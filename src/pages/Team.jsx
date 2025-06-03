import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../styles/Team.css'; // We'll create this CSS file next

const Team = () => {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          console.log('IntersectionObserver entry:', entry); // Debug log
          if (entry.isIntersecting) {
            entry.target.classList.add('section-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { root: null, threshold: 0.1, rootMargin: '0px' }
    );

    const sections = document.querySelectorAll('.team-hero, .team-members, .team-cta');
    sections.forEach((section) => observer.observe(section));

    return () => {
      sections.forEach((section) => observer.unobserve(section));
    };
  }, []);

  return (
    <div className="team-page">
      {/* Team Hero Section */}
      <section className="team-hero">
        <div className="container text-center">
          <h1 className="fw-bold">Meet the VitaPlates Team</h1>
          <p className="lead">
            We're a passionate group dedicated to making healthy eating simple and accessible for everyone. Get to know the people behind VitaPlates!
          </p>
        </div>
      </section>

      {/* Team Members Section */}
      <section className="team-members py-5">
        <div className="container">
          <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
            {/* Team Member 1 */}
            <div className="col">
              <div className="team-card text-center">
                <img
                  src="/team-member-1.jpg" // Placeholder path; add images to the public folder
                  alt="Alex Carter"
                  className="team-member-img"
                />
                <h3 className="mt-3">Alex Carter</h3>
                <p className="team-role">Founder & CEO</p>
                <p className="team-bio">
                  Alex started VitaPlates to help people achieve their health goals through personalized meal plans, driven by a lifelong passion for nutrition.
                </p>
                <div className="social-links">
                  <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" aria-label="Alex Carter LinkedIn">
                    🔗 LinkedIn
                  </a>
                </div>
              </div>
            </div>

            {/* Team Member 2 */}
            <div className="col">
              <div className="team-card text-center">
                <img
                  src="/team-member-2.jpg"
                  alt="Dr. Emily Stone"
                  className="team-member-img"
                />
                <h3 className="mt-3">Dr. Emily Stone</h3>
                <p className="team-role">Lead Nutritionist</p>
                <p className="team-bio">
                  Emily is a certified nutritionist with over 10 years of experience, ensuring every meal plan is balanced and tailored to your needs.
                </p>
                <div className="social-links">
                  <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" aria-label="Emily Stone LinkedIn">
                    🔗 LinkedIn
                  </a>
                </div>
              </div>
            </div>

            {/* Team Member 3 */}
            <div className="col">
              <div className="team-card text-center">
                <img
                  src="/team-member-3.jpg"
                  alt="Sam Rivera"
                  className="team-member-img"
                />
                <h3 className="mt-3">Sam Rivera</h3>
                <p className="team-role">Lead Developer</p>
                <p className="team-bio">
                  Sam builds the tech that powers VitaPlates, making sure your meal planning experience is seamless and user-friendly.
                </p>
                <div className="social-links">
                  <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" aria-label="Sam Rivera LinkedIn">
                    🔗 LinkedIn
                  </a>
                </div>
              </div>
            </div>

            {/* Team Member 4 */}
            <div className="col">
              <div className="team-card text-center">
                <img
                  src="/team-member-4.jpg"
                  alt="Luna Kim"
                  className="team-member-img"
                />
                <h3 className="mt-3">Luna Kim</h3>
                <p className="team-role">UI/UX Designer</p>
                <p className="team-bio">
                  Luna designs the beautiful and intuitive interfaces that make VitaPlates a joy to use every day.
                </p>
                <div className="social-links">
                  <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" aria-label="Luna Kim LinkedIn">
                    🔗 LinkedIn
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="team-cta container my-5">
        <div className="row justify-content-center">
          <div className="col-md-8 text-center">
            <h2 className="fw-bold">Want to Join Us?</h2>
            <p className="lead">
              We're always looking for talented individuals to join our mission of making healthy eating effortless. Reach out to us!
            </p>
            <Link to="/contact" className="btn btn-primary" aria-label="Contact VitaPlates team">
              Get in Touch
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Team;