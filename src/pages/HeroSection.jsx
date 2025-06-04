import React, { useEffect, useState } from "react";
import '../styles/HeroSection.css';

const HSHeroSection = () => {
  const slides = [
    {
      heading: "Transform Your",
      highlight: "Body",
      subheading: "with Smart Workouts",
      description: "Our app uses AI to build customized workout plans based on your fitness goals, body type, and training level.",
      buttonText: "START TRAINING!",
      href: "/Gym",
      subscribers: "40K+ members transformed",
      images: [
        "/user1.jpg",
        "/user2.jpg",
        "/user3.jpg",
        "/user4.jpg"
      ],
      bgImage: "/gym.jpg"
    },
    {
      heading: "Build Your",
      highlight: "Custom",
      subheading: "Meal Plan Fast",
      description: "Personalized diet plans tailored to your needs. Let AI do the hard work!",
      buttonText: "START NOW",
      href: "/AIMeal", // Changed 'src' to 'href' for consistency
      subscribers: "50K+ users joined",
      images: [
        "/user2.jpg",
        "/user1.jpg",
        "/user4.jpg",
        "/user3.jpg"
      ],
      bgImage: "/meal1.jpg"
    },
    {
      heading: "Embrace Your",
      highlight: "Inner Peace",
      subheading: "with Daily Yoga",
      description: "Discover personalized yoga routines for your body and mind. Improve flexibility, reduce stress, and enhance mindfulness.",
      buttonText: "START YOUR JOURNEY",
      href: "/Yoga", // Added href for consistency, assuming a yoga route
      subscribers: "75K+ peaceful practitioners",
      images: [
        "/user2.jpg",
        "/user1.jpg",
        "/user4.jpg",
        "/user3.jpg"
      ],
      bgImage: "/pexels-jeshoots-com-147458-834893.jpg"
    }
  ];

  const [currentSlide, setCurrentSlide] = useState(0);
  const [fadeClass, setFadeClass] = useState("HSFadeIn");

  useEffect(() => {
    const interval = setInterval(() => {
      setFadeClass("HSFadeOut");
      setTimeout(() => {
        setCurrentSlide((prev) => (prev + 1) % slides.length);
        setFadeClass("HSFadeIn");
      }, 500); // match fade duration
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const slide = slides[currentSlide];

  return (
    <div className={`HSHeroSection ${fadeClass}`}>
      <div className="HSContainer">
        <div className="HSLeft">
          <h1 className="HSTitle">
            {slide.heading} <span className="HSHighlight">{slide.highlight}</span> {slide.subheading}
          </h1>
          <p className="HSDescription">{slide.description}</p>
          <a href={slide.href} className="HSButtonLink">
            <button className="HSButton">{slide.buttonText}</button>
          </a>
          <div className="HSSubscribers">
            <strong>{slide.subscribers}</strong>
            <div className="HSAvatarGroup">
              {slide.images.map((img, idx) => (
                <img src={img} alt="user" className="HSAvatar" key={idx} />
              ))}
            </div>
          </div>
        </div>
        <div
          className="HSRight"
          style={{ backgroundImage: `url(${slide.bgImage})` }}
        ></div>
      </div>
    </div>
  );
};

export default HSHeroSection;