import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import '../styles/Home.css';
import anythingIcon from '../';
import ketoIcon from '../assets/keto.svg';
import aegeanIcon from '../assets/aegean.svg';
import paleoIcon from '../assets/paleo.svg';
import veganIcon from '../assets/vegan.svg';
import vegetarianIcon from '../assets/vegetarian.svg';

const Home = () => {
  const [calories, setCalories] = useState(1800);
  const [meals, setMeals] = useState(3);
  const [mealPlan, setMealPlan] = useState('');

  // Diet macros from original Script.js
  const dietMacros = {
    "Anything": {
      percentages: { carbs: 40, fats: 20, protein: 40 },
      requirements: { carbs: { min: 45 }, fats: { min: 40 }, protein: { min: 45 } }
    },
    "Keto": {
      percentages: { carbs: 5, fats: 70, protein: 25 },
      requirements: { carbs: { max: 41 }, fats: { min: 120 }, protein: { min: 68 } }
    },
    "Aegean": {
      percentages: { carbs: 35, fats: 30, protein: 35 },
      requirements: { carbs: { min: 45 }, fats: { min: 40 }, protein: { min: 45 } }
    },
    "Paleo": {
      percentages: { carbs: 20, fats: 40, protein: 40 },
      requirements: { carbs: { min: 45 }, fats: { min: 40 }, protein: { min: 45 } }
    },
    "Vegan": {
      percentages: { carbs: 50, fats: 25, protein: 25 },
      requirements: { carbs: { min: 45 }, fats: { min: 40 }, protein: { min: 45 } }
    },
    "Vegetarian": {
      percentages: { carbs: 45, fats: 20, protein: 35 },
      requirements: { carbs: { min: 45 }, fats: { min: 40 }, protein: { min: 45 } }
    }
  };

  const calculateGrams = (calories, percentages) => {
    const grams = {
      carbs: Math.round((calories * (percentages.carbs / 100)) / 4),
      fats: Math.round((calories * (percentages.fats / 100)) / 9),
      protein: Math.round((calories * (percentages.protein / 100)) / 4)
    };
    return grams;
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

  const [selectedDiet, setSelectedDiet] = useState("Anything");
  const [macros, setMacros] = useState(dietMacros["Anything"].percentages);

  const updateMacros = (calories, dietName) => {
    const macrosData = dietMacros[dietName] || dietMacros["Anything"];
    const percentages = macrosData.percentages;
    let grams = calculateGrams(calories, percentages);
    grams = enforceRequirements(grams, macrosData.requirements);
    setMacros(percentages);
  };

  useEffect(() => {
    updateMacros(calories, selectedDiet);

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('section-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { root: null, threshold: 0.1, rootMargin: '0px' });

    const sections = document.querySelectorAll('.hero, .meal-section, .stat-section, .offerings-section');
    sections.forEach(section => observer.observe(section));

    return () => sections.forEach(section => observer.unobserve(section));
  }, [calories, selectedDiet]);

  const handleDietClick = (dietName) => {
    setSelectedDiet(dietName);
    updateMacros(calories, dietName);
  };

  const generateMealPlan = () => {
    if (meals < 1 || meals > 5) {
      alert("Please enter a number of meals between 1 and 5.");
      return;
    }
    const caloriesPerMeal = Math.round(calories / meals);
    let resultHTML = `<h4>Your Meal Plan</h4>`;
    for (let i = 1; i <= meals; i++) {
      resultHTML += `<p>Meal ${i}: ${caloriesPerMeal} calories</p>`;
    }
    resultHTML += `<p>Total: ${calories} calories across ${meals} meals</p>`;
    setMealPlan(resultHTML);
  };

  return (
    <div>
      <div className="container d-flex justify-content-center align-items-center min-vh-100 hero">
        <div className="row align-items-center text-center">
          <div className="col-md-12 text-content hero-text">
            <p>Since 1999</p>
            <h2 className="hero-text">All pretty souls got pretty problems</h2>
          </div>
        </div>
      </div>

      <h1 className="fw-bold text-center">Create Your Custom Meal Plan</h1>
      <section className="meal-section">
        <div className="container meal-container justify-content-end">
          <p className="Preferred-Diet"><strong>Select Your Preferred Diet</strong></p>
         <div className="d-flex flex-wrap justify-content-center diet-btn-container">
            {["Anything", "Keto", "Aegean", "Paleo", "Vegan", "Vegetarian"].map(diet => (
              <button
                key={diet}
                className={`diet-btn ${selectedDiet === diet ? 'active' : ''}`}
                onClick={() => handleDietClick(diet)}
              >
                <img src={`/${diet.toLowerCase() === 'anything' ? 'anything' : diet.toLowerCase() === 'keto' ? 'keto' : diet.toLowerCase() === 'aegean' ? 'aegean' : diet.toLowerCase() === 'paleo' ? 'paleo' : diet.toLowerCase() === 'vegan' ? 'vegan' : 'Vegetarian'}.svg`} alt={diet} />
                {diet}
              </button>
            ))}
          </div>
          <br />
          <div className="text-center input-take">
            <label className="fw-bold">I want to eat</label>
            <input
              type="number"
              id="calories"
              className="form-control d-inline-block mx-2 text-center no-spinner"
              value={calories}
              onChange={(e) => setCalories(parseInt(e.target.value) || 1800)}
              style={{ width: '80px', borderRadius: '4px' }}
            />
            <span>calories.</span>
            <br /><br />
            <small className="text-meal">Not sure? Try our{' '}<Link to="/calorie-calculator" className="text-primary">Calorie Calculator </Link>
            </small>
            <br /><br />
            <label className="fw-bold">in</label>
            <select
              id="meals"
              className="form-select d-inline-block mx-2 text-center"
              value={meals}
              onChange={(e) => setMeals(parseInt(e.target.value))}
              style={{ width: '80px' }}
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
          <div className="button" onTouchStart="">
            <button className="btn-start" onClick={generateMealPlan}>Generate Plan</button>
          </div>
          <div id="meal-plan-result" className="text-center mt-3" dangerouslySetInnerHTML={{ __html: mealPlan }}></div>
        </div>
      </section>
      <br />

    

      <section className="stat-section">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-md-8 que-text">
              <h2 className="fw-bold">Why is Meal Planning Important?</h2>
              <p className="description">
                Meal planning saves time, reduces stress, and helps you eat healthier. Instead of worrying about what to cook daily, a well-structured plan ensures balanced meals, fewer unhealthy choices, and less food waste. It also saves money by cutting down on impulse buys and unnecessary takeout. With 
                <b style={{ fontWeight: 800 }}>VitaPlates</b>, you get personalized meal plans, expert nutrition advice, and automatic grocery lists, making healthy eating effortless.
              </p>
              <ul className="list">
                <li><span className="icon material-symbols-outlined">done_all</span><span className="text">Stay on track with your health goals.</span></li>
                <li><span className="icon material-symbols-outlined">done_all</span><span className="text">Save time & money.</span></li>
                <li><span className="icon material-symbols-outlined">done_all</span><span className="text">Enjoy delicious, balanced meals.</span></li>
              </ul>
              <div className="stat-section-buttons">
                <a href="#" className="btn">🚀 GET STARTED</a>
              </div>
            </div>
            <div className="col-md-4 text-center">
              <img src="QUES.png" className="Statistician-img" alt="Statistician" />
            </div>
          </div>
        </div>
      </section>

      <div className="header text-white text-center py-5 OUR-STORY">
        <h1 className="OUR-STORY-title">OUR STORY UNVEILED</h1>
      </div>
      <section id="our-story" className="container my-5">
        <div className="row justify-content-center">
          <div className="col-md-8 text-center">
            <p className="lead">
              "At  <b style={{ fontWeight: 800 }}>VitaPlates</b>, we are committed to revolutionizing the way individuals, families, and fitness enthusiasts approach meal planning and nutrition tracking. Our platform seamlessly blends smart kitchen technology with advanced AI assistance, offering a personalized and effortless experience. Whether you're striving for a healthier lifestyle, managing dietary needs, or optimizing fitness goals, NutriStrip empowers you with intelligent meal recommendations, real-time tracking, and expert guidance—all in one place."
            </p>
            <hr className="my-4" />
            <p className="text-meal">
              We believe in promoting healthy living through customized meal plans that cater to the unique needs of our customers. Join us in our mission to make nutrition accessible and enjoyable for everyone.
            </p>
            <button id="learnMoreBtn" className="btn">Learn More</button>
          </div>
        </div>
      </section>

      <section className="offerings-section py-5" id="offerings">
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
                <div className="price h1">$5 <span>per month<br /><small>(billed at $60 per year)</small></span></div>
                <button className="get-started-btn btn w-100 mb-3">Get Started</button>
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
                <div className="price h1">$15 <span>per month<br /><small>(billed at $180 per year)</small></span></div>
                <button className="get-started-btn btn w-100 mb-3">Get Started</button>
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
                <div className="price h1">$20 <span>per month<br /><small>(billed at $240 per year)</small></span></div>
                <button className="get-started-btn btn highlighted w-100 mb-3">Get Started</button>
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
                <div className="price h1">$20 <span>per month<br /><small>(billed at $240 per year)</small></span></div>
                <button className="get-started-btn btn w-100 mb-3">Get Started</button>
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
      </section>
    </div>
  );
};

export default Home;