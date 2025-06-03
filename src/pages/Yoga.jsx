import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import '../styles/Yoga.css';
import yoga1 from '/Yoga.jpg';
import mainPose from '/yoga2.jpg';
import yoga2 from '/yogapage.jpg';

function YogaLanding() {
  const testimonials = [
    {
      text: "The yoga guides have transformed my daily routine. I feel more balanced and centered.",
      author: "— Anika R."
    },
    {
      text: "This blog helped me find yoga practices that suit my lifestyle. Truly life-changing!",
      author: "— Sameer V."
    },
    {
      text: "The expert tips and community support make this the best yoga resource out there.",
      author: "— Maya T."
    }
  ];

  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedPose, setSelectedPose] = useState(null);
  const [videoUrl, setVideoUrl] = useState(null);
  const [loadingVideo, setLoadingVideo] = useState(false);
  const [timerDuration, setTimerDuration] = useState(60);
  const [timeLeft, setTimeLeft] = useState(60);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const timerRef = useRef(null);
  const searchRef = useRef(null);
  const modalRef = useRef(null);

  // Rotate testimonials
  useEffect(() => {
    const cycle = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 2000);
    return () => clearInterval(cycle);
  }, []);

  // Timer logic
  useEffect(() => {
    if (isTimerRunning && timeLeft > 0) {
      const startTime = Date.now();
      timerRef.current = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTime) / 1000);
        setTimeLeft((prev) => Math.max(timerDuration - elapsed, 0));
      }, 1000);
    } else if (timeLeft === 0) {
      setIsTimerRunning(false);
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [isTimerRunning, timerDuration]);

  // Debounced search effect
  useEffect(() => {
    const debounceTimeout = setTimeout(() => {
      if (searchQuery.trim() === '') {
        setSearchResults([]);
        setError(null);
        return;
      }

      const fetchSearchResults = async () => {
        setIsLoading(true);
        setError(null);
        try {
          const response = await fetch('https://yoga-api-nzy4.onrender.com/v1/poses');
          if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
          const data = await response.json();
          if (!Array.isArray(data)) throw new Error('Invalid API response: Expected array');
          const filteredResults = data.filter(pose =>
            pose.english_name.toLowerCase().includes(searchQuery.toLowerCase())
          );
          setSearchResults(filteredResults);
        } catch (err) {
          console.error('Search error:', err.message);
          setError('Failed to fetch yoga poses. Please try again.');
          setSearchResults([]);
        } finally {
          setIsLoading(false);
        }
      };

      fetchSearchResults();
    }, 300);

    return () => clearTimeout(debounceTimeout);
  }, [searchQuery]);

  // Fetch YouTube video
  useEffect(() => {
    if (selectedPose) {
      fetchYouTubeVideo(selectedPose.english_name);
      resetTimer();
    }
  }, [selectedPose]);

  // Outside click handler
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target) &&
        (!modalRef.current || !modalRef.current.contains(event.target))
      ) {
        setSearchQuery('');
        setSearchResults([]);
        setSelectedPose(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Modal focus
  useEffect(() => {
    if (selectedPose && modalRef.current) {
      modalRef.current.focus();
    }
  }, [selectedPose]);

  const startTimer = () => {
    if (timeLeft > 0) setIsTimerRunning(true);
  };

  const pauseTimer = () => {
    setIsTimerRunning(false);
    clearInterval(timerRef.current);
  };

  const resetTimer = () => {
    setIsTimerRunning(false);
    clearInterval(timerRef.current);
    setTimeLeft(timerDuration);
  };

  const handleDurationChange = (e) => {
    const newDuration = parseInt(e.target.value) || 60;
    setTimerDuration(newDuration);
    setTimeLeft(newDuration);
    setIsTimerRunning(false);
    clearInterval(timerRef.current);
  };

  const fetchYouTubeVideo = async (poseName) => {
    setLoadingVideo(true);
    try {
      const query = `${poseName} yoga Yoga With Adriene`;
      const apiKey = import.meta.env.VITE_YOUTUBE_API_KEY;
      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(
          query
        )}&key=${apiKey}&maxResults=1&type=video`
      );
      const data = await response.json();
      if (data.items && data.items.length > 0) {
        const videoId = data.items[0].id.videoId;
        setVideoUrl(`https://www.youtube.com/embed/${videoId}`);
      } else {
        setVideoUrl(null);
      }
    } catch (err) {
      console.error('YouTube API error:', err.message);
      setVideoUrl(null);
    } finally {
      setLoadingVideo(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const retrySearch = () => {
    setSearchQuery(searchQuery);
  };

  return (
    <>
      <div className="YogaFitness-landing">
        <div className="YogaOverlay">
          <h1 className="YogaTitle">
            YOGA <span>/ VOG</span>
          </h1>
          <p className="YogaSubtitle">Your Path to Inner Peace and Physical Wellness</p>
          <p className="YogaCustom-description">
            Explore expert yoga sequences, meditation techniques, and mindfulness tips designed to enhance your practice and bring balance to your life.
          </p>

          <div className="YogaSearch-bar" ref={searchRef}>
            <input
              type="text"
              placeholder="Search Yoga, Meditation, Mindfulness..."
              className="YogaSearch-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Search yoga poses"
            />
            <button
              className="YogaClear-button"
              onClick={() => setSearchQuery('')}
              style={{ display: searchQuery ? 'block' : 'none' }}
              aria-label="Clear search"
            >
              <i className="fas fa-times"></i>
            </button>
            
            {searchQuery && (
              <div className="YogaSearch-results YogaAnimated YogaFadeSlide">
                {isLoading && <p className="YogaSearch-message">Loading...</p>}
                {error && (
                  <div className="YogaSearch-message YogaError">
                    {error}
                    <button onClick={retrySearch} className="YogaRetry-button">Retry</button>
                  </div>
                )}
                {!isLoading && !error && searchResults.length === 0 && (
                  <p className="YogaSearch-message">No results found for "{searchQuery}"</p>
                )}
                {searchResults.length > 0 && (
                  <ul className="YogaResults-list">
                    {searchResults.map((pose) => (
                      <li
                        key={pose.id}
                        className="YogaResult-item"
                        onClick={() => {
                          setSelectedPose(pose);
                          setSearchQuery('');
                          setSearchResults([]);
                        }}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            setSelectedPose(pose);
                            setSearchQuery('');
                            setSearchResults([]);
                          }
                        }}
                        aria-label={`View details for ${pose.english_name}`}
                      >
                        <img
                          src={pose.url_png || 'https://via.placeholder.com/40?text=Yoga+Pose'}
                          alt={pose.english_name}
                          className="YogaResult-image"
                        />
                        <div className="YogaResult-info">
                          <span>{pose.english_name}</span>
                          <span className="YogaSanskrit">{pose.sanskrit_name}</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>

          {selectedPose && (
            <div className="YogaModal-overlay" onClick={() => setSelectedPose(null)} role="dialog" aria-modal="true">
              <div
                className="YogaModal-content"
                ref={modalRef}
                onClick={(e) => e.stopPropagation()}
                tabIndex={-1}
              >
                <button
                  className="YogaModal-close"
                  onClick={() => setSelectedPose(null)}
                  aria-label="Close modal"
                >
                  <i className="fas fa-times"></i>
                </button>
                <h2>{selectedPose.english_name}</h2>
                <p className="YogaSanskrit">{selectedPose.sanskrit_name}</p>
                <div className="YogaModal-body">
                  <div className="YogaModal-image-section">
                    <img
                      src={selectedPose.url_png || 'https://via.placeholder.com/250?text=Yoga+Pose'}
                      alt={selectedPose.english_name}
                      className="YogaModal-image"
                    />
                    <div className="YogaTimer">
                      <h3>Practice Timer</h3>
                      <div className="YogaTimer-display">{formatTime(timeLeft)}</div>
                      <div className="YogaTimer-controls">
                        <input
                          type="number"
                          min="1"
                          value={timerDuration}
                          onChange={handleDurationChange}
                          disabled={isTimerRunning}
                          aria-label="Set timer duration in seconds"
                          className="YogaTimer-input"
                        />
                        <button
                          onClick={startTimer}
                          disabled={isTimerRunning || timeLeft === 0}
                          aria-label="Start timer"
                          className="YogaTimer-btn YogaStart"
                        >
                          Start
                        </button>
                        <button
                          onClick={pauseTimer}
                          disabled={!isTimerRunning}
                          aria-label="Pause timer"
                          className="YogaTimer-btn YogaPause"
                        >
                          Pause
                        </button>
                        <button
                          onClick={resetTimer}
                          disabled={timeLeft === timerDuration && !isTimerRunning}
                          aria-label="Reset timer"
                          className="YogaTimer-btn YogaReset"
                        >
                          Reset
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="YogaModal-details">
                    <p><strong>Description:</strong> {selectedPose.pose_description}</p>
                    <div className="YogaYoutube-frame">
                      {loadingVideo ? (
                        <div className="YogaLoading-spinner">Loading video...</div>
                      ) : videoUrl ? (
                        <iframe
                          width="100%"
                          height="315"
                          src={videoUrl}
                          title={`${selectedPose.english_name} Yoga Tutorial`}
                          frameBorder="0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        ></iframe>
                      ) : (
                        <p>No tutorial found for this pose yet.</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="YogaStats-container">
            <div className="YogaStat"><h2>150+</h2><p>YOGA SEQUENCES</p></div>
            <div className="YogaStat"><h2>40k+</h2><p>COMMUNITY MEMBERS</p></div>
            <div className="YogaStat"><h2>12+</h2><p>EXPERT INSTRUCTORS</p></div>
          </div>

          <div className="YogaIcons-section">
            <div className="YogaIcon-card YogaAnimated YogaFadeInUp YogaDelay-1">
              <i className="fas fa-praying-hands"></i><p>Yoga Practices</p>
            </div>
            <div className="YogaIcon-card YogaAnimated YogaFadeInUp YogaDelay-2">
              <i className="fas fa-spa"></i><p>Meditation Guides</p>
            </div>
            <div className="YogaIcon-card YogaAnimated YogaFadeInUp YogaDelay-3">
              <i className="fas fa-users"></i><p>Community Support</p>
            </div>
          </div>

          <div className="YogaTestimonial YogaFade-slide">
            <p>{testimonials[currentTestimonial].text}</p>
            <span>{testimonials[currentTestimonial].author}</span>
          </div>
        </div>
      </div>

      <div className="YogaCustom-hero-container">
        <div className="YogaCustom-text-content">
          <p className="YogaCustom-top-tag">#1 Yoga training app</p>
          <h1 className="YogaCustom-main-heading">
            Control Your <span className="YogaCustom-highlight">body & mind</span><br />
            with <span className="YogaCustom-brand">YogaVog</span>
          </h1>
          <p className="YogaCustom-description">
            Lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Nostrud exercitation ullamco.
          </p>
          <div className="YogaCustom-buttons">
            <Link to="/YogaExercise" className="YogaCustom-download-btn">Start</Link>
          </div>
          <div className="YogaCustom-yoga-thumbs">
            <img src={yoga1} alt="Yoga Pose 1" />
            <img src={yoga2} alt="Yoga Pose 2" />
          </div>
        </div>
        <div className="YogaCustom-image-content">
          <img src={mainPose} alt="Main Yoga Pose" className="YogaCustom-main-img" />
        </div>
      </div>
    </>
  );
}

export default YogaLanding;