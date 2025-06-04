import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/Blog.css';
import mealPrepVideo from '../Images/meal-prep-lead.mp4';
import DietVideo from '../Images/Diet.mp4';

// Image mapping for specific categories
const imageMap = {
  // cancer: 'https://images.unsplash.com/photo-1532938911079-1b8926b79a7e', // Fixed: Cancer awareness image
  // pregnancy: 'https://images.unsplash.com/photo-1522778119026-d4747c4f5e4d', // Pregnancy image
  // 'heart health': 'https://images.unsplash.com/photo-1505751172876-fa1923c5c7a2', // Heart health image
  default: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd', // Generic health image
};

const Blog = () => {
  // State Management
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [blogs, setBlogs] = useState([]);
  const [filteredBlogs, setFilteredBlogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showAllBlogs, setShowAllBlogs] = useState(false);
  const searchRef = useRef(null);
  const navigate = useNavigate();

  // API Configuration
  const API_URL = 'https://odphp.health.gov/myhealthfinder/api/v3/itemlist.json';
  const CONTENT_API_URL = 'https://odphp.health.gov/myhealthfinder/api/v3/topicsearch.json';
  const CACHE_KEY = 'myhealthfinder_cache';
  const CACHE_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours

  // Analytics Tracking
  const trackEvent = (category, action, label) => {
    if (window.gtag) {
      window.gtag('event', action, { event_category: category, event_label: label });
    }
  };

  // Debounce Function
  const debounce = (func, delay) => {
    let timeoutId;
    return (...args) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func.apply(null, args), delay);
    };
  };

  // Exponential Backoff for API Retry
  const fetchWithBackoff = async (url, params, retries = 3, delay = 1000) => {
    for (let i = 0; i < retries; i++) {
      try {
        const response = await axios.get(url, { params });
        return response;
      } catch (err) {
        if (i === retries - 1 || err.response?.status !== 429) throw err;
        await new Promise((resolve) => setTimeout(resolve, delay * 2 ** i));
      }
    }
  };

  // Fetch Blogs
  const fetchBlogs = useCallback(async () => {
    setLoading(true);
    setError(null);
    const cache = JSON.parse(localStorage.getItem(CACHE_KEY) || '{}');
    const now = Date.now();

    // Check cache
    if (cache.blogs && now - cache.blogs.timestamp < CACHE_EXPIRY) {
      setBlogs(cache.blogs.data);
      setFilteredBlogs(cache.blogs.data);
      setLoading(false);
      return;
    }

    try {
      const response = await fetchWithBackoff(API_URL, { Type: 'topic', Lang: 'en' });
      const items = response.data.Result.Items?.Item || [];

      if (items.length === 0) {
        throw new Error('No health topics found.');
      }
      const fetchedBlogs = [];
      for (const item of items) {
        let content = '';
        let contentResponse;
        try {
          contentResponse = await fetchWithBackoff(CONTENT_API_URL, { TopicId: item.Id });
          content = contentResponse.data.Result?.Content || '';
        } catch (contentErr) {
          console.warn(`Failed to fetch content for topic ${item.Id}:`, contentErr);
        }

        // Assign image
        let imageUrl = imageMap.default;
        const resource = contentResponse?.data?.Result?.Resources?.[0]?.Sections?.[0] || {};
        if (resource.ImageUrl) {
          imageUrl = resource.ImageUrl;
          console.log(`Using API image for ${item.Title}: ${imageUrl}`);
        } else {
          const title = item.Title.toLowerCase();
          let matchedKey = null;
          if (title.includes('cancer')) {
            matchedKey = 'cancer';
          } else if (title.includes('pregnancy') || title.includes('pregnant')) {
            matchedKey = 'pregnancy';
          } else if (title.includes('heart')) {
            matchedKey = 'heart health';
          }

          if (matchedKey) {
            imageUrl = imageMap[matchedKey];
            console.log(`Matched ${item.Title} to imageMap key ${matchedKey}: ${imageUrl}`);
          } else {
            // Fallback to category if it matches cancer, pregnancy, or heart health
            const category = item.Title.split(' ')[0].toLowerCase();
            const categoryKey = Object.keys(imageMap).find(
              (key) => key.toLowerCase() === category && key !== 'default'
            );
            imageUrl = categoryKey ? imageMap[categoryKey] : imageMap.default;
            console.log(`Using category ${category} for ${item.Title}: ${imageUrl}`);
          }
        }

        fetchedBlogs.push({
          id: item.Id,
          title: item.Title,
          subtitle: `Learn more about ${item.Title.toLowerCase()} and its benefits for your health.`,
          author: 'MyHealthfinder',
          date: item.LastUpdated || new Date().toISOString().split('T')[0],
          imageUrl,
          category: item.Title.includes('Cancer') ? 'Cancer' :
                    item.Title.includes('Pregnancy') || item.Title.includes('Pregnant') ? 'Pregnancy' :
                    item.Title.includes('Heart') ? 'Heart Health' : 'Health',
          content,
        });
      }

      setBlogs(fetchedBlogs);
      setFilteredBlogs(fetchedBlogs);
      localStorage.setItem(CACHE_KEY, JSON.stringify({
        ...cache,
        blogs: { data: fetchedBlogs, timestamp: now },
      }));
    } catch (err) {
      setError(
        err.response?.status === 429
          ? 'Too many requests. Please try again later.'
          : `Failed to load health topics: ${err.message}`
      );
    } finally {
      setLoading(false);
    }
  }, []);

  // Generate Suggestions
  const generateSuggestions = useCallback(() => {
    return blogs.slice(0, 5).map((blog) => ({
      text: blog.title,
      icon: '📝',
    }));
  }, [blogs]);

  // Handle Search
  const handleSearch = useCallback(
    debounce((query) => {
      setIsSearching(true);
      trackEvent('Search', 'Execute', query);
      if (query) {
        const filteredSuggestions = generateSuggestions().filter((s) =>
          s.text.toLowerCase().includes(query.toLowerCase())
        );
        setSuggestions(filteredSuggestions);
        const filtered = blogs.filter(
          (blog) =>
            blog.title.toLowerCase().includes(query.toLowerCase()) ||
            blog.subtitle.toLowerCase().includes(query.toLowerCase()) ||
            blog.author.toLowerCase().includes(query.toLowerCase()) ||
            blog.category.toLowerCase().includes(query.toLowerCase())
        );
        setFilteredBlogs(filtered);
      } else {
        setSuggestions(generateSuggestions());
        setFilteredBlogs(blogs);
      }
      setIsSearching(false);
    }, 150),
    [blogs, generateSuggestions]
  );

  // Effect Hooks
  useEffect(() => {
    fetchBlogs();
  }, [fetchBlogs]);

  useEffect(() => {
    setSuggestions(generateSuggestions());
  }, [blogs, generateSuggestions]);

  useEffect(() => {
    handleSearch(searchQuery);
  }, [searchQuery, handleSearch]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Event Handlers
  const handleSuggestionClick = (suggestion) => {
    setSearchQuery(suggestion.text);
    setShowSuggestions(false);
    handleSearch(suggestion.text);
    trackEvent('Search', 'Suggestion Click', suggestion.text);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setSuggestions(generateSuggestions());
    setShowSuggestions(false);
    setFilteredBlogs(blogs);
    trackEvent('Search', 'Clear', 'Search Cleared');
  };

  const handleKeyDown = (e) => {
    if (!showSuggestions || suggestions.length === 0) return;
    const activeElement = document.activeElement;
    const suggestionItems = searchRef.current.querySelectorAll('.search-bar-suggestion-item');
    const currentIndex = Array.from(suggestionItems).indexOf(activeElement);

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      const nextIndex = currentIndex < suggestionItems.length - 1 ? currentIndex + 1 : 0;
      suggestionItems[nextIndex].focus();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const prevIndex = currentIndex > 0 ? currentIndex - 1 : suggestionItems.length - 1;
      suggestionItems[prevIndex].focus();
    } else if (e.key === 'Enter' && currentIndex >= 0) {
      e.preventDefault();
      handleSuggestionClick(suggestions[currentIndex]);
    }
  };

  // Card Component
  const Card = ({ id, title, subtitle, author, date, imageUrl, badgeText }) => (
    <div
      className="custom-card"
      style={{ background: badgeText?.includes('Featured') ? '#f9fafb' : '#ffffff', cursor: 'pointer' }}
      onClick={() => {
        navigate(`/blog/${id}`);
        trackEvent('Card', 'Click', title);
      }}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          navigate(`/blog/${id}`);
          trackEvent('Card', 'KeyPress', title);
        }
      }}
      aria-label={`Read more about ${title}`}
    >
      {badgeText && <span className="badge">{badgeText}</span>}
      <img
        src={imageUrl || imageMap.default}
        className="card-img-top"
        alt={title}
        loading="lazy"
        onError={(e) => { e.target.src = imageMap.default; }}
      />
      <div className="card-body p-3">
        <h5 className="card-title mb-2">{title}</h5>
        <p className="card-text mb-2">{subtitle}</p>
        <p className="author mb-1">By {author}</p>
        <p className="date">Last modified {date}</p>
        <Link
          to={`/blog/${id}`}
          className="btn btn-primary mt-2"
          style={{ fontSize: '0.875rem' }}
          onClick={(e) => e.stopPropagation()}
        >
          Read More
        </Link>
      </div>
    </div>
  );

  // TrendingBlogs Component
  const TrendingBlogs = () => {
    const [selectedFilter, setSelectedFilter] = useState('All');

    const handleFilterChange = (e) => {
      const filter = e.target.value.toLowerCase();
      setSelectedFilter(e.target.value);
      if (filter === 'all') {
        setFilteredBlogs(blogs);
      } else {
        setFilteredBlogs(
          blogs.filter(
            (blog) =>
              blog.category.toLowerCase().includes(filter) ||
              blog.title.toLowerCase().includes(filter)
          )
        );
      }
      setShowAllBlogs(false);
      trackEvent('Filter', 'Change', filter);
    };

    const handleShowMore = () => {
      setShowAllBlogs(true);
      trackEvent('Button', 'Show More', 'Trending Blogs');
    };

    const handleShowLess = () => {
      setShowAllBlogs(false);
      trackEvent('Button', 'Show Less', 'Trending Blogs');
    };

    const displayedBlogs = showAllBlogs ? filteredBlogs : filteredBlogs.slice(0, 12);

    return (
      <section className="trending-blogs-section" aria-labelledby="trending-blogs-heading">
        <h1 id="trending-blogs-heading" className="trending-section-title">Trending Blogs This Week</h1>
        <label htmlFor="target" className="trending-filter-container">
          <select
            className="trending-filter-btn"
            onChange={handleFilterChange}
            value={selectedFilter}
            aria-label="Filter blogs by category"
          >
            <option value="">All Categories</option>
            <option value="Cancer">Cancer</option>
            <option value="Pregnancy">Pregnancy</option>
            <option value="Heart Health">Heart Health</option>
          </select>
        </label>
        {loading && <div className="text-center" aria-live="polite">Loading blogs</div>}
        {error && (
          <div className="text-center text-danger" aria-live="assertive">
            {error} <button onClick={fetchBlogs} className="btn btn-link">Retry</button>
          </div>
        )}
        {!loading && !error && blogs.length === 0 && (
          <div className="text-center" aria-live="assertive">
            No blogs available. Please try again later.
          </div>
        )}
        {!loading && !error && blogs.length > 0 && filteredBlogs.length === 0 && (
          <div className="text-center" aria-live="assertive">
            No blogs found for the selected filter.
          </div>
        )}
        {!loading && !error && filteredBlogs.length > 0 && (
          <>
            <div className="trending-card-container">
              {displayedBlogs.map((blog) => {
                // Assign image based on category for Trending Blogs
                const categoryImage = blog.category === 'Cancer' ? imageMap.cancer :
                                     blog.category === 'Pregnancy' ? imageMap.pregnancy :
                                     blog.category === 'Heart Health' ? imageMap['heart health'] :
                                     imageMap.default;
                console.log(`Trending Blog: ${blog.title} (Category: ${blog.category}) -> Image: ${categoryImage}`);
                return (
                  <Card
                    key={blog.id}
                    id={blog.id}
                    title={blog.title}
                    subtitle={blog.subtitle}
                    author={blog.author}
                    date={blog.date}
                    imageUrl={categoryImage}
                    badgeText={blog.badgeText}
                  />
                );
              })}
            </div>
            {filteredBlogs.length > 12 && (
              <div className="blog-toggle-buttons text-center">
                {!showAllBlogs ? (
                  <button className="btn" onClick={handleShowMore} aria-label="Show all blogs">
                    Want More
                  </button>
                ) : (
                  <button className="btn" onClick={handleShowLess} aria-label="Show fewer blogs">
                    Less It
                  </button>
                )}
              </div>
            )}
          </>
        )}
      </section>
    );
  };

  return (
    <div className="Blog-page" role="main" aria-label="Blog Page">
      <section className="search-section" aria-labelledby="search-heading">
        <div className="search-bar-container" ref={searchRef}>
          <h2 id="search-heading" className="search-bar-title">Explore Our Blog</h2>
          <div className="search-bar-input-wrapper">
            <input
              type="text"
              placeholder="Search Cancer, Pregnancy, Heart Health..."
              className="search-bar-input"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
              onKeyDown={handleKeyDown}
              aria-label="Search blog posts"
              aria-autocomplete="list"
              aria-controls="search-suggestions"
            />
            {searchQuery && (
              <button
                className="search-bar-clear"
                onClick={handleClearSearch}
                aria-label="Clear search"
              >
                ✕
              </button>
            )}
            <button
              className="search-bar-icon"
              onClick={() => handleSearch(searchQuery)}
              disabled={isSearching}
              aria-label="Search"
            >
              {isSearching ? <span className="search-spinner" aria-hidden="true"></span> : '🔍'}
            </button>
            {showSuggestions && suggestions.length > 0 && (
              <ul
                id="search-suggestions"
                className="search-bar-suggestions"
                role="listbox"
                aria-label="Search suggestions"
              >
                {suggestions.map((suggestion, index) => (
                  <li
                    key={index}
                    className="search-bar-suggestion-item"
                    onClick={() => handleSuggestionClick(suggestion)}
                    onMouseDown={(e) => e.preventDefault()}
                    role="option"
                    aria-selected={false}
                    tabIndex={0}
                  >
                    <span className="suggestion-icon">{suggestion.icon}</span>
                    {suggestion.text}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </section>
      <marquee behavior="scroll" direction="left" className="carousel-marquee">
        Featured Stories: Explore Cancer, Pregnancy, and Heart Health Tips!
      </marquee>
      <section className="Blog-container">
        <header className="Blog-header" aria-hidden="true"></header>
        <div className="Blog-content">
          <div className="Blog-right-section">
            <div className="Blog-card" style={{ backgroundColor: '#ecfdf5' }}>
              <div className="Blog-card-content">
                <div className="Blog-category">Category · Food➹</div>
                <img
                  src="https://images.unsplash.com/photo-1512621776951-a57141f2eefd"
                  alt="Healthy meal"
                  className="Blog-card-img"
                  loading="lazy"
                />
                <h2 className="Blog-card-title" style={{ marginBottom: '0.5rem' }}>
                  Fuel Your Body with Nutrient-Dense Meals
                </h2>
                <p className="Blog-card-excerpt">
                  Discover how VitaPlates’ meal planner helps you create balanced, healthy meals.{' '}
                  <Link to="#" style={{ color: 'var(--button-color)' }}>
                    More
                  </Link>
                </p>
                <div className="Blog-related-posts">
                  <Link to="#" className="Blog-related-link">
                    <span>5 TIPS FOR EASY MEAL PREP</span>
                    <span>→</span>
                  </Link>
                  <Link to="#" className="Blog-related-link">
                    <span>KETO VS. VEGAN: WHICH IS RIGHT FOR YOU?</span>
                    <span>→</span>
                  </Link>
                </div>
              </div>
            </div>
            <div className="Blog-card" style={{ backgroundColor: '#f3f4f6' }}>
              <div className="Blog-card-content">
                <div className="Blog-category">Category · Diet➹</div>
                <div className="Blog-card-small">
                  <video
                    src={DietVideo}
                    className="Blog-card-img"
                    autoPlay
                    muted
                    loop
                    playsInline
                  ></video>
                </div>
                <div className="Blog-meta">8 Min · 21 Sept</div>
                <h2 className="Blog-card-title-small">Foods To Add To Your Diet Plan</h2>
                <p className="Blog-card-excerpt">
                  Discover how VitaPlates’ meal planner helps you create balanced, healthy meals.{' '}
                  <Link to="#" style={{ color: 'var(--button-color)' }}>
                    More
                  </Link>
                </p>
              </div>
            </div>
          </div>
          <div className="Blog-middle-section">
            <div className="Blog-card" style={{ backgroundColor: '#ecfdf5' }}>
              <div className="Blog-card-content">
                <div className="Blog-category">Category · Nutrition➹</div>
                <h2 className="Blog-card-title" style={{ marginBottom: '0.5rem' }}>
                  READY, SET, PLAN!<br />MASTER MEAL PLANNING
                </h2>
                <p className="Blog-card-excerpt">
                  Learn how to save time and eat healthier with VitaPlates’ meal planning tools.{' '}
                  <Link to="#" style={{ color: 'var(--button-color)' }}>
                    More
                  </Link>
                </p>
                <div className="Blog-related-posts">
                  <Link to="#" className="Blog-related-link">
                    <span>BUDGET-FRIENDLY MEAL IDEAS</span>
                    <span>→</span>
                  </Link>
                  <Link to="#" className="Blog-related-link">
                    <span>PLANT-BASED MEAL PREP GUIDE</span>
                    <span>→</span>
                  </Link>
                  <div className="Blog-card-image-small">
                    <img
                      src="https://images.unsplash.com/photo-1540420773420-3366772f4999"
                      alt="Meal prep containers"
                      className="Blog-card-img"
                      loading="lazy"
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="Blog-card" style={{ backgroundColor: '#e0f2fe' }}>
              <div className="Blog-card-content">
                <div className="Blog-category">Category · Wellness➹</div>
                <h2 className="Blog-card-title">
                  OVERCOMING MEAL PREP CHALLENGES
                </h2>
                <div className="Blog-meta">Hot · 12 Feb</div>
                <div className="Blog-card-image-small">
                  <img
                    src="https://images.unsplash.com/photo-1540420773420-3366772f4999"
                    alt="Meal prep containers"
                    className="Blog-card-img"
                    loading="lazy"
                  />
                </div>
                <p className="Blog-card-excerpt">
                    <Link to="#" className="Blog-related-link">
                    <span>BUDGET-FRIENDLY MEAL IDEAS</span>
                    <span>→</span>
                  </Link>
                  <Link to="#" className="Blog-related-link">
                    <span>PLANT-BASED MEAL PREP GUIDE</span>
                    <span>→</span>
                  </Link>
                  </p>
              </div>
            </div>
          </div>
          <div className="Blog-right-section">
            <div className="Blog-card" style={{ backgroundColor: 'var(--offerings-section)' }}>
              <div className="Blog-card-content">
                <div className="Blog-category">Category · Tutorial➹</div>
                <div className="Blog-card-small">
                  <video
                    src={mealPrepVideo}
                    className="Blog-card-img"
                    autoPlay
                    muted
                    loop
                    playsInline
                  ></video>
                  
                </div>
                <div className="Blog-meta">5 Min · 22 Feb</div>
                <h2 className="Blog-card-title-small">MEAL PREP 101 | EASY TIPS FOR BEGINNERS</h2>
                <p className="Blog-card-excerpt">
                    Discover how VitaPlates’ meal planner helps you create balanced, healthy meals, Discover how VitaPlates’ meal planner helps you create balanced, healthy meals...{' '}
                    <Link to="#" style={{ color: 'var(--button-color)' }}>
                      More
                    </Link>
                    <Link to="#" className="Blog-related-link">
                    <span>BUDGET-FRIENDLY MEAL IDEAS</span>
                    <span>→</span>
                  </Link>
                  <Link to="#" className="Blog-related-link">
                    <span>PLANT-BASED MEAL PREP GUIDE</span>
                    <span>→</span>
                  </Link>
                  </p>
              </div>
              
            </div>
            <div className="Blog-categories-card">
              <h2 className="Blog-card-title-small">Blog Category</h2>
              <div className="Blog-categories-grid">
                <div className="Blog-category-tag">Meal Planning</div>
                <div className="Blog-category-tag">Healthy Recipes</div>
                <div className="Blog-category-tag">Nutrition</div>
                <div className="Blog-category-tag">Keto Diet</div>
                <div className="Blog-category-tag">Vegan Diet</div>
                <div className="Blog-category-tag">Budget Meals</div>
                <div className="Blog-category-tag">Gut Health</div>
                <div className="Blog-category-tag">Sustainable Eating</div>
                <div className="Blog-category-tag">Gut Health</div>
                <div className="Blog-category-tag">Sustainable Eating</div>
              </div>
              <div className="Blog-view-all">
                <span className="Blog-view-all-text">View All Categories</span>
                <Link to="#" className="Blog-arrow-icon">→</Link>
              </div>
            </div>
          </div>
        </div>
      </section>
      <TrendingBlogs />
    </div>
  );
};

export default Blog;