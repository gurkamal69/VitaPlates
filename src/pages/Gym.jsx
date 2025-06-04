import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../styles/Gym.css'; // Import the CSS file for Gym page

// Option 1: If HeroGym.png is in src/assets, uncomment the import
// import HeroGymImage from '../assets/HeroGym.png';
// import WeightLiftingImage from '../assets/weightlifting.jpg';
// import CardioImage from '../assets/cardio.jpg';
// import NutritionImage from '../assets/nutrition.jpg';

export default function FitnessLandingPage() {
  const testimonials = [
    {
      quote: "This gym changed my lifestyle. Amazing coaches, energetic environment, and real results!",
      author: "Emily Carter",
    },
    {
      quote: "The personalized plans made all the difference. I've never felt stronger!",
      author: "Michael Lee",
    },
    {
      quote: "The community here is incredible. It's more than a gym—it's a family!",
      author: "Sarah Johnson",
    },
  ];

  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  useEffect(() => {
    console.log('FitnessLandingPage rendered'); // Debug log
    const cycle = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 2000);
    return () => clearInterval(cycle);
  }, []);

  return (
    <div className="landing-container">
      <section className="hero">
        <div className="hero-text">
          <h2>Elevate Your Body, Empower Your Life</h2>
          <p>
            Discover the power of consistency, smart workouts, and balanced nutrition. Your fitness journey begins here.
          </p>
          <Link to="/ExerciseList" className="btn">
            Get Started
          </Link>
        </div>
        <div className="hero-image">
          {/* Option 1: If image is in src/assets, use the import */}
          {/* <img src={HeroGymImage} alt="Person exercising in a modern gym" loading="lazy" /> */}
          
          {/* Option 2: If image is in public folder */}
          <img src="/HeroGym.png" alt="Person exercising in a modern gym" loading="lazy" />
          

        </div>
      </section>

      <section className="stats">
        <h1 className="Why-Choose">Why Choose Our Gym?</h1>
        <div className="stat-numbers">
          <div>
            <span>12k+</span> Active Members
          </div>
          <div>
            <span>80+</span> Professional Trainers
          </div>
          <div>
            <span>95%</span> Success Rate
          </div>
        </div>
      </section>

      <section className="services">
        <h1 className="Why-Choose">Our Specializations</h1>
        <div className="service-list">
          <div className="service">
            {/* <img src={WeightLiftingImage} alt="Person lifting weights in a gym" className="service-img" loading="lazy" /> */}
            <img src="/weightlifting.jpg" alt="Person lifting weights in a gym" className="service-img" loading="lazy" />
            <p>Strength Training</p>
          </div>
          <div className="service">
            {/* <img src={CardioImage} alt="Person running on a treadmill" className="service-img" loading="lazy" /> */}
            <img src="/cardio.jpg" alt="Person running on a treadmill" className="service-img" loading="lazy" />
            <p>Cardio Workouts</p>
          </div>
          <div className="service">
            {/* <img src={NutritionImage} alt="Healthy meal plan with fresh ingredients" className="service-img" loading="lazy" /> */}
            <img src="/nutrition.jpg" alt="Healthy meal plan with fresh ingredients" className="service-img" loading="lazy" />
            <p>Diet & Nutrition</p>
          </div>
        </div>
      </section>

      <section className="info-panels">
        <div className="panel">
          <h4>Work Out Anytime</h4>
          <p>
            With our 24/7 gym access and home workout programs, you have no excuse to skip a session.
          </p>
        </div>
        <div className="panel">
          <h4>Personalized Plans</h4>
          <p>
            From weight loss to muscle gain, we tailor every workout and diet to your unique needs.
          </p>
        </div>
        <div className="panel">
          <h4>Track Your Progress</h4>
          <p>
            Use our dashboard to visualize your fitness progress, set goals, and stay on track.
          </p>
        </div>
      </section>

      <h1 className="Why-Choose">Testimonials</h1>
      <div className="testimonial" key={currentTestimonial}>
        <p className="testimonial-content">{testimonials[currentTestimonial].quote}</p>
        <span>{testimonials[currentTestimonial].author}</span>
      </div>
    </div>
  );
}