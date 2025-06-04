import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import '../styles/Home.css';
import anythingIcon from "../Images/Anything.svg";
import ketoIcon from '../Images/keto.svg';
import aegeanIcon from '../Images/aegean.svg';
import paleoIcon from '../Images/paleo.svg';
import veganIcon from '../Images/vegan.svg';
import vegetarianIcon from '../Images/vegetarian.svg';
import HeroSection from './HeroSection';

const Home = () => {
  const [calories, setCalories] = useState(1800);
  const [meals, setMeals] = useState(3);
  const [mealPlan, setMealPlan] = useState('');
  const [selectedDiet, setSelectedDiet] = useState('Anything');
  const [loading, setLoading] = useState(false);
  const [dietMealsLoading, setDietMealsLoading] = useState(false);
  const [error, setError] = useState('');
  const [dietMeals, setDietMeals] = useState([]);

  const dietMacros = {
    Anything: {
      percentages: { carbs: 0, fats: 20, protein: 40 },
      requirements: { carbs: { min: 45 }, fats: { min: 40 }, protein: { min: 45 } },
    },
    Keto: {
      percentages: { carbs: 5, fats: 70, protein: 25 },
      requirements: { carbs: { max: 41 }, fats: { min: 120 }, protein: { min: 68 } },
    },
    Aegean: {
      percentages: { carbs: 35, fats: 30, protein: 35 },
      requirements: { carbs: { min: 45 }, fats: { min: 40 }, protein: { min: 45 } },
    },
    Paleo: {
      percentages: { carbs: 20, fats: 40, protein: 40 },
      requirements: { carbs: { min: 45 }, fats: { min: 40 }, protein: { min: 45 } },
    },
    Vegan: {
      percentages: { carbs: 50, fats: 25, protein: 25 },
      requirements: { carbs: { min: 45 }, fats: { min: 40 }, protein: { min: 45 } },
    },
    Vegetarian: {
      percentages: { carbs: 45, fats: 20, protein: 35 },
      requirements: { carbs: { min: 45 }, fats: { min: 40 }, protein: { min: 45 } },
    },
  };

  const calculateGrams = (calories, percentages) => {
    return {
      carbs: Math.round((calories * (percentages.carbs / 100)) / 4),
      fats: Math.round((calories * (percentages.fats / 100)) / 9),
      protein: Math.round((calories * (percentages.protein / 100)) / 4),
    };
  };

  const enforceRequirements = (grams, requirements) => {
    const adjustedGrams = { ...grams };
    if (requirements.carbs.min && adjustedGrams.carbs < requirements.carbs.min) {
      adjustedGrams.carbs = requirements.carbs.min;
    }
    if (requirements.carbs.max && adjustedGrams.carbs > requirements.carbs.max) {
      adjustedGrams.carbs = requirements.carbs.max;
    }
    if (requirements.fats.min && adjustedGrams.fats < requirements.fats.min) {
      adjustedGrams.fats = requirements.fats.min;
    }
    if (requirements.fats.max && adjustedGrams.fats > requirements.fats.max) {
      adjustedGrams.fats = requirements.fats.max;
    }
    if (requirements.protein.min && adjustedGrams.protein < requirements.protein.min) {
      adjustedGrams.protein = requirements.protein.min;
    }
    if (requirements.protein.max && adjustedGrams.protein > requirements.protein.max) {
      adjustedGrams.protein = requirements.protein.max;
    }
    return adjustedGrams;
  };

  const [macros, setMacros] = useState(dietMacros.Anything.percentages);

  const updateMacros = (calories, dietName) => {
    const macrosData = dietMacros[dietName] || dietMacros.Anything;
    const percentages = macrosData.percentages;
    let grams = calculateGrams(calories, percentages);
    grams = enforceRequirements(grams, macrosData.requirements);
    setMacros(percentages);
  };

  const fetchDietMeals = async (dietName) => {
    if (!calories || calories < 500 || calories > 5000) {
      setError('Please enter a calorie value between 500 and 5000.');
      setDietMeals([]);
      return;
    }

    setDietMealsLoading(true);
    setError('');
    setDietMeals([]);

    const dietMapping = {
      Anything: '',
      Keto: 'ketogenic',
      Aegean: '',
      Paleo: 'paleolithic',
      Vegan: 'vegan',
      Vegetarian: 'vegetarian',
    };
    const dietParam = dietMapping[dietName] || '';

    try {
      const apiKey = '779f8e7d8d56469d8fad52233912f6e2'; // Replace with your Spoonacular API key
      const url = `https://api.spoonacular.com/recipes/complexSearch?apiKey=${apiKey}&maxCalories=${calories}${dietParam ? `&diet=${dietParam}` : ''}&number=3&addRecipeNutrition=true`;

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`API request failed: ${response.statusText}`);
      }
      const data = await response.json();

      const mealsData = data.results || [];
      setDietMeals(mealsData);
    } catch (err) {
      setError(`Failed to fetch meals for ${dietName}: ${err.message}`);
      setDietMeals([]);
    } finally {
      setDietMealsLoading(false);
    }
  };

  useEffect(() => {
    updateMacros(calories, selectedDiet);
    fetchDietMeals(selectedDiet);

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('section-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { root: null, threshold: 0.1, rootMargin: '0px' }
    );

    const sections = document.querySelectorAll('.home-hero, .meal-section, .stat-section, .offerings-section, .story-cta-section');
    sections.forEach((section) => observer.observe(section));

    return () => {
      sections.forEach((section) => observer.unobserve(section));
    };
  }, [calories, selectedDiet]);

  const svgIcons = {
    anything: anythingIcon,
    keto: ketoIcon,
    aegean: aegeanIcon,
    paleo: paleoIcon,
    vegan: veganIcon,
    vegetarian: vegetarianIcon,
  };

  const handleDietClick = (dietName) => {
    setSelectedDiet(dietName);
    updateMacros(calories, dietName);
    fetchDietMeals(dietName);
  };

  const generateMealPlan = async () => {
    if (!calories || calories < 500 || calories > 5000) {
      setError('Please enter a calorie value between 500 and 5000.');
      setMealPlan('');
      return;
    }
    if (meals < 1 || meals > 5) {
      setError('Please select a number of meals between 1 and 5.');
      setMealPlan('');
      return;
    }

    setError('');
    setLoading(true);
    setMealPlan('');

    const dietMapping = {
      Anything: '',
      Keto: 'ketogenic',
      Aegean: '',
      Paleo: 'paleolithic',
      Vegan: 'vegan',
      Vegetarian: 'vegetarian',
    };
    const dietParam = dietMapping[selectedDiet] || '';

    try {
      const apiKey = '779f8e7d8d56469d8fad52233912f6e2'; // Replace with your Spoonacular API key
      const url = `https://api.spoonacular.com/mealplanner/generate?apiKey=${apiKey}&timeFrame=day&targetCalories=${calories}${dietParam ? `&diet=${dietParam}` : ''}`;

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`API request failed: ${response.statusText}`);
      }
      const data = await response.json();

      const mealsData = data.meals || [];
      let resultHTML = `<h4>Your Meal Plan</h4>`;
      resultHTML += `<p>This meal plan is designed to maintain weight based on your ${calories} calorie input.</p>`;
      mealsData.slice(0, meals).forEach((meal, index) => {
        const caloriesPerMeal = Math.round(meal.nutrition?.nutrients?.find(n => n.name === 'Calories')?.amount || calories / meals);
        resultHTML += `<p>Meal ${index + 1}: <a href="/recipe/${meal.id}">${meal.title}</a> (${caloriesPerMeal} calories)</p>`;
      });
      resultHTML += `<p>Total: ${calories} calories in ${meals} meals</p>`;
      setMealPlan(resultHTML);
    } catch (err) {
      setError(`Failed to generate meal plan: ${err.message}`);
      setMealPlan('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <HeroSection />
      <h1 className="fw-bold text-center">Create Your Custom Meal Plan</h1>
      <section className="meal-section">
        <div className="container meal-container">
          <p className="Preferred-Diet">
            <strong>Select Your Preferred Diet</strong>
          </p>
          <div className="d-flex flex-wrap justify-content-center diet-btn-container">
            {['Anything', 'Keto', 'Aegean', 'Paleo', 'Vegan', 'Vegetarian'].map((diet) => (
              <button
                key={diet}
                className={`diet-btn ${selectedDiet === diet ? 'active' : ''}`}
                onClick={() => handleDietClick(diet)}
                aria-label={`Select ${diet} diet`}
              >
                <img src={svgIcons[diet.toLowerCase()]} alt={`${diet} diet icon`} />
                {diet}
              </button>
            ))}
          </div>
          <div className="diet-meals-preview mt-4">
            <h4>Sample {selectedDiet} Meals</h4>
            {dietMealsLoading && <p>Loading meals...</p>}
            {error && <div className="text-danger">{error}</div>}
            {dietMeals.length > 0 && (
              <ul className="list-unstyled">
                {dietMeals.map((meal) => (
                  <li key={meal.id}>
                    <a href={`/recipe/${meal.id}`}>{meal.title}</a> (
                    {Math.round(meal.nutrition.nutrients.find(n => n.name === 'Calories')?.amount || 0)} calories)
                  </li>
                ))}
              </ul>
            )}
            {!dietMealsLoading && dietMeals.length === 0 && !error && (
              <p>No meals found for this diet.</p>
            )}
          </div>
          <br />
          <div className="text-center input-take">
            <label className="fw-bold">I want to eat</label>
            <input
              type="number"
              id="calories"
              className="form-control d-inline-block mx-2 text-center no-spinner"
              value={calories}
              onChange={(e) => {
                const value = parseInt(e.target.value);
                setCalories(isNaN(value) ? 1800 : value);
                setError('');
              }}
              style={{ width: '80px', borderRadius: '4px' }}
              aria-label="Daily calorie intake"
            />
            <span>calories.</span>
            <br />
            <br />
            <small className="text-meal">
              Not sure? Try our{' '}
              <Link to="/calorie-calculator" className="text-primary">
                Calorie Calculator
              </Link>
            </small>
            <br />
            <br />
            <label className="fw-bold">in</label>
            <select
              id="meals"
              className="form-select d-inline-block mx-2 text-center"
              value={meals}
              onChange={(e) => setMeals(parseInt(e.target.value))}
              style={{ width: '80px' }}
              aria-label="Number of meals per day"
            >
              <option value="2">2</option>
              <option value="3">3</option>
              <option value="4">4</option>
              <option value="5">5</option>
            </select>
            <span>meals.</span>
          </div>
          <ul className="macro-container">
            <li className="macro carbs">🟡 {macros.carbs}% Carbs</li>
            <li className="macro fats">🔵 {macros.fats}% Fats</li>
            <li className="macro protein">🟠 {macros.protein}% Protein</li>
          </ul>
          <div className="button">
            <button
              className="btn-start"
              onClick={generateMealPlan}
              disabled={loading}
              aria-label="Generate meal plan"
            >
              {loading ? 'Generating...' : 'Generate Plan'}
            </button>
          </div>
          {error && <div className="text-danger text-center mt-3">{error}</div>}
          <div
            id="meal-plan-result"
            className="text-center mt-3"
            dangerouslySetInnerHTML={{ __html: mealPlan }}
          ></div>
        </div>
      </section>

      <section className="stat-section">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-md-8 que-text">
              <h2 className="fw-bold">Why is Meal Planning Important?</h2>
              <p className="description">
                Meal planning saves time, reduces stress, and helps you eat healthier. Instead of worrying about what to cook daily, a well-structured plan ensures balanced meals, fewer unhealthy choices, and less food waste. It also saves money by cutting down on impulse buys and unnecessary takeout. With
                <b style={{ fontWeight: 800 }}> VitaPlates</b>, you get personalized meal plans, expert nutrition advice, and automatic grocery lists, making healthy eating effortless.
              </p>
              <ul className="list">
                <li>
                  <span className="icon material-symbols-outlined">done_all</span>
                  <span className="text">Stay on track with your health goals.</span>
                </li>
                <li>
                  <span className="icon material-symbols-outlined">done_all</span>
                  <span className="text">Save time & money.</span>
                </li>
                <li>
                  <span className="icon material-symbols-outlined">done_all</span>
                  <span className="text">Enjoy delicious, balanced meals.</span>
                </li>
              </ul>
              <div className="stat-section-buttons">
                <Link to="/meal-planner" className="btn" aria-label="Get started with meal planning">
                  🚀 GET STARTED
                </Link>
              </div>
            </div>
            <div className="col-md-4 text-center">
              <img src="/QUES.png" className="Statistician-img" alt="Meal planning illustration" />
            </div>
          </div>
        </div>
      </section>

      <section className="story-cta-section container my-5">
        <div className="row justify-content-center">
          <div className="col-md-8 text-center">
            <h2 className="fw-bold">Discover Our Story</h2>
            <p className="lead">
              VitaPlates began with a vision: healthy eating should be effortless and personalized. Our founder, Jane Doe, faced the challenge of balancing nutrition with a busy life. Tired of one-size-fits-all meal plans, she created VitaPlates to empower everyone—whether Keto, Vegan, or Paleo—to craft meals that fit their unique needs.
            </p>
            <Link to="/OurStory" className="btn btn-primary" aria-label="Explore VitaPlates story">
              Explore Our Journey
            </Link>
          </div>
        </div>
      </section>

      {/* <section className="offerings-section py-5" id="offerings">
        <header className="section-header text-center mb-5">
          <h2 className="display-3">Our Meal Plans</h2>
          <p className="section-subtitle lead">Tailored options for every lifestyle</p>
        </header>
        <div className="container">
          <div className="row row-cols-1 row-cols-md-2 row-cols-lg-4 g-4">
            <div className="col">
              <article className="offering-card">
                <h3 className="h3">Basic Plan</h3>
                <p className="text-muted price-head">Simple, affordable meals for everyday nutrition.</p>
                <div className="price h1">
                  $5 <span>per month<br /><small>(billed at $60 per year)</small></span>
                </div>
                <button className="get-started-btn btn w-100 mb-3" aria-label="Get started with Basic Plan">
                  Get Started
                </button>
                <div className="features">
                  <h4>What's included:</h4>
                  <ul className="list-unstyled">
                    <li>5 simple recipes per week</li>
                    <li>Basic nutritional info (calories)</li>
                    <li>Meal timing suggestions</li>
                    <li>1 user profile</li>
                  </ul>
                </div>
              </article>
            </div>
            <div className="col">
              <article className="offering-card">
                <h3 className="h3">Family Plan</h3>
                <p className="text-muted price-head">Healthy meals designed for the whole family.</p>
                <div className="price h1">
                  $15 <span>per month<br /><small>(billed at $180 per year)</small></span>
                </div>
                <button className="get-started-btn btn w-100 mb-3" aria-label="Get started with Family Plan">
                  Get Started
                </button>
                <div className="features">
                  <h4>What's included:</h4>
                  <ul className="list-unstyled">
                    <li>10 family-sized recipes per week</li>
                    <li>Nutritional info for all members</li>
                    <li>Up to 5 user profiles</li>
                    <li>Adjustable portion sizes</li>
                  </ul>
                </div>
              </article>
            </div>
            <div className="col">
              <article className="offering-card premium">
                <div className="badge">Most Popular</div>
                <h3 className="h3">Healthy Plan</h3>
                <p className="text-muted price-head">Specialized meals for health-conscious individuals.</p>
                <div className="price h1">
                  $20 <span>per month<br /><small>(billed at $240 per year)</small></span>
                </div>
                <button
                  className="get-started-btn btn highlighted w-100 mb-3"
                  aria-label="Get started with Healthy Plan"
                >
                  Get Started
                </button>
                <div className="features">
                  <h4>What's included:</h4>
                  <ul className="list-unstyled">
                    <li>7 specialized recipes per week</li>
                    <li>Detailed nutritional breakdown</li>
                    <li>Personalized dietary suggestions</li>
                    <li>Monthly dietitian Q&A session</li>
                  </ul>
                </div>
              </article>
            </div>
            <div className="col">
              <article className="offering-card">
                <h3 className="h3">Fitness Plan</h3>
                <p className="text-muted price-head">High-protein meals to fuel your active lifestyle.</p>
                <div className="price h1">
                  $20 <span>per month<br /><small>(billed at $240 per year)</small></span>
                </div>
                <button className="get-started-btn btn w-100 mb-3" aria-label="Get started with Fitness Plan">
                  Get Started
                </button>
                <div className="features">
                  <h4>What's included:</h4>
                  <ul className="list-unstyled">
                    <li>7 high-protein recipes weekly</li>
                    <li>Customized macros for goals</li>
                    <li>Meal timing suggestions</li>
                    <li>Fitness app integration</li>
                  </ul>
                </div>
              </article>
            </div>
          </div>
        </div>
      </section> */}
    </div>
  );
};

export default Home;