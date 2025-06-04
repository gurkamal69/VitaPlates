import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import '../styles/OurStory.css'; // Ensure this is scoped or unique

const OurStory = () => {
  const sections = useRef([]);

  useEffect(() => {
    // Create IntersectionObserver for visibility animations
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('OurStoryvisible');
            observer.unobserve(entry.target); // Stop observing once visible
          }
        });
      },
      { threshold: 0.2 }
    );

    // Observe all sections
    sections.current.forEach((section) => {
      if (section) observer.observe(section);
    });

    // Clean up observers on unmount
    return () => {
      sections.current.forEach((section) => {
        if (section) observer.unobserve(section);
      });
    };
  }, []);

  const addToRefs = (el) => {
    if (el && !sections.current.includes(el)) {
      sections.current.push(el);
    }
  };

  return (
    <div className="OurStoryour-story">
      {/* Hero Section */}
      <section className="OurStoryhero-section" ref={addToRefs}>
        <div className="OurStoryhero-parallax">
          <div className="OurStorycontainer">
            <h1 className="OurStoryanimate-slide-up">The Story Behind VitaPlates</h1>
            <p className="OurStoryanimate-slide-up OurStoryanimate-delay-200">
              Crafting personalized meal plans to make healthy eating simple, vibrant, and yours.
            </p>
          </div>
        </div>
      </section>

      {/* Origin Story */}
      <section className="OurStoryorigin-story" ref={addToRefs}>
        <div className="OurStorycontainer">
          <h2 className="OurStoryanimate-fade-in">Our Journey</h2>
          <div className="OurStorycontent OurStorycard">
            <p className="OurStoryanimate-fade-in OurStoryanimate-delay-200">
              VitaPlates began with a vision: healthy eating should be effortless and personalized. Our founder, Jane Doe, faced the challenge of balancing nutrition with a busy life. Tired of one-size-fits-all meal plans, she created VitaPlates to empower everyone—whether Keto, Vegan, or Paleo—to craft meals that fit their unique needs.
            </p>
            <p className="OurStoryanimate-fade-in OurStoryanimate-delay-400">
              Since our 2023 launch, we’ve blended innovative technology with a passion for wellness. Our mission is to simplify your path to healthier living with tools that save time and inspire. Rooted in simplicity, personalization, and community, VitaPlates is here to make every meal a step toward vitality.
            </p>
          </div>
        </div>
      </section>

      {/* Milestones Timeline */}
      <section className="OurStorymilestones" ref={addToRefs}>
        <div className="OurStorycontainer">
          <h2 className="OurStoryanimate-fade-in">Our Milestones</h2>
          <div className="OurStorytimeline-container">
            <div className="OurStorytimeline-line"></div>
            <div className="OurStorytimeline-item OurStoryanimate-slide-in-left">
              <div className="OurStorycontent-left OurStorycard">
                <h3>2023</h3>
                <p>VitaPlates launched, redefining meal planning with personalization.</p>
              </div>
              <div className="OurStorycontent-right"></div>
            </div>
            <div className="OurStorytimeline-item OurStoryreverse OurStoryanimate-slide-in-right">
              <div className="OurStorycontent-right OurStorycard">
                <h3>2024</h3>
                <p>Introduced Vegan and Keto plans, reaching 5,000 users.</p>
              </div>
              <div className="OurStorycontent-left"></div>
            </div>
            <div className="OurStorytimeline-item OurStoryanimate-slide-in-left">
              <div className="OurStorycontent-left OurStorycard">
                <h3>2025</h3>
                <p>Expanded to 10+ diet types, transforming thousands of lives.</p>
              </div>
              <div className="OurStorycontent-right"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Team Spotlight */}
      <section className="OurStoryteam" ref={addToRefs}>
        <div className="OurStorycontainer">
          <h2 className="OurStoryanimate-fade-in">Meet Our Team</h2>
          <div className="OurStoryteam-grid">
            <div className="OurStoryteam-member OurStorycard OurStoryanimate-scale-in">
              <img src="/7309670-Photoroom.png" alt="Jane Doe, Founder" />
              <h3>Jane Doe</h3>
              <p className="OurStoryrole">Founder & Nutrition Enthusiast</p>
              <p className="OurStorybio">Jane turned her passion for healthy eating into VitaPlates, making nutrition accessible.</p>
            </div>
            <div className="OurStoryteam-member OurStorycard OurStoryanimate-scale-in OurStoryanimate-delay-200">
              <img src="/Person.png" alt="John Smith, Lead Developer" />
              <h3>John Smith</h3>
              <p className="OurStoryrole">Lead Developer</p>
              <p className="OurStorybio">John builds the tech that powers your personalized meal plans.</p>
            </div>
            <div className="OurStoryteam-member OurStorycard OurStoryanimate-scale-in OurStoryanimate-delay-400">
              <img src="/7309670-Photoroom.png" alt="Emma Lee, Dietitian" />
              <h3>Emma Lee</h3>
              <p className="OurStoryrole">Dietitian</p>
              <p className="OurStorybio">Emma ensures every meal plan is nutritionally balanced.</p>
            </div>
          </div>
        </div>
      </section>

      {/* User Impact */}
      <section className="OurStoryimpact" ref={addToRefs}>
        <div className="OurStorycontainer">
          <h2 className="OurStoryanimate-fade-in">Our Impact</h2>
          <p className="OurStorytestimonial OurStorycard OurStoryanimate-fade-in OurStoryanimate-delay-200">
            “VitaPlates transformed my routine! Planning meals is now quick, and I feel healthier.” — Sarah, User
          </p>
          <p className="OurStorystat OurStorycard OurStoryanimate-fade-in OurStoryanimate-delay-400">
            98% of users say VitaPlates simplifies their meal planning.
          </p>
        </div>
      </section>

      {/* CTA Section */}
      <section className="OurStorycta" ref={addToRefs}>
        <div className="OurStorycontainer">
          <h2 className="OurStoryanimate-slide-up">Ready to Simplify Your Meals?</h2>
          <p className="OurStoryanimate-slide-up OurStoryanimate-delay-200">
            Join thousands and start planning with VitaPlates today!
          </p>
          <Link
            to="/meal-planner"
            className="OurStorycta-button OurStoryanimate-pulse"
            aria-label="Create your personalized meal plan"
          >
            Create Your Meal Plan
          </Link>
        </div>
      </section>
    </div>
  );
};

export default OurStory;