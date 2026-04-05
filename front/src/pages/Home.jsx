import { Link } from "react-router-dom";

function Home() {
  return (
    <>

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-pattern"></div>
        <div className="hero-content">
          <div className="hero-text">
            <h1>Empowering the Valuation Profession</h1>
            <h2>INDUSTRY LEADERSHIP</h2>
            <p>
              Future-Ready Valuation Starts Here. <br />
              Join a professional institution that advances your credibility,
              competence, and global standing.
            </p>

            <div className="hero-buttons">
              <button className="btn-primary">Become a Member</button>
              <button className="btn-secondary">Explore Services</button>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="about-section" id="about">
        <div className="about-container">
          <div className="about-image">
            <div className="about-badge">
              Be <span>Valued</span> Be <span>Recognised</span>
            </div>
          </div>

          <div className="about-content">
            <h2>Welcome to Council of Valuers</h2>
            <h3>Advancing Excellence in Valuation</h3>

            <p>
              At the <span className="highlight-cov">Council of Valuers (COV)</span>, 
              we function as a professional institution committed to strengthening 
              the valuation ecosystem in India through rigour, standards, and informed collaboration.
            </p>

            <Link to="/our-story" className="btn-primary">
              About Us
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section">
        <div className="stats-container">
          <h2 className="stats-title">Boosting Valuation Impact</h2>

          <div className="stats-grid">
            <div className="stat-box">
              <div className="stat-number">2500+</div>
              <div className="stat-label">Valuers Members Registered</div>
            </div>

            <div className="stat-box">
              <div className="stat-number">24</div>
              <div className="stat-label">International VPOs Engaged</div>
            </div>

            <div className="stat-box">
              <div className="stat-number">30</div>
              <div className="stat-label">Chartered Mentors</div>
            </div>

            <div className="stat-box">
              <div className="stat-number">100%</div>
              <div className="stat-label">Digital Services</div>
            </div>
          </div>
        </div>
      </section>

      {/* OSP Section */}
      <section className="osp">
        <div className="osp1">
          <h2>One Stop Platform (OSP)</h2>

          <div className="osp-content">
            <div className="osp-visual">
              <div className="orbit-container">
                <div className="orbit orbit-1">
                  <div className="orbit-dot"></div>
                </div>
                <div className="orbit orbit-2">
                  <div className="orbit-dot"></div>
                </div>
                <div className="orbit orbit-3">
                  <div className="orbit-dot"></div>
                </div>
                <div className="center-core"></div>
              </div>
            </div>

            <div className="osp-steps">
              <div className="osp-step">
                <h3>Search Your Requirement Online</h3>
                <p>Select a specialist as per your requirement only at OSP.</p>
              </div>

              <div className="osp-step">
                <h3>Connect with an Expert</h3>
                <p>Connect directly with our expert members.</p>
              </div>

              <div className="osp-step">
                <h3>Get a Quote</h3>
                <p>Based on the conversation, our member will provide a quote.</p>
              </div>

              <button className="cta-btn">Join OSP</button>
            </div>
          </div>
        </div>
      </section>

      {/* Ecosystem Section */}
      <section className="ecosystem-section">
        <div className="ecosystem-container">
          <h2 className="ecosystem-title">Valuation Ecosystem</h2>

          <p className="ecosystem-subtitle">
            Your journey to becoming a trusted valuation professional starts here.
          </p>

          <div className="ecosystem-items">

            <div className="ecosystem-item">
              <div className="ecosystem-number">01</div>
              <div className="ecosystem-content">
                <h3>Capability Building</h3>
                <p>Empowering professionals through structured learning.</p>
              </div>
            </div>

            <div className="ecosystem-item">
              <div className="ecosystem-number">02</div>
              <div className="ecosystem-content">
                <h3>Professional Services & Tools</h3>
                <p>Access to OSP and tools.</p>
              </div>
            </div>

            <div className="ecosystem-item">
              <div className="ecosystem-number">03</div>
              <div className="ecosystem-content">
                <h3>Community & Collaboration</h3>
                <p>Events and partnerships.</p>
              </div>
            </div>

            <div className="ecosystem-item">
              <div className="ecosystem-number">04</div>
              <div className="ecosystem-content">
                <h3>Quality & Oversight</h3>
                <p>Ethical and transparent valuation.</p>
              </div>
            </div>

          </div>
        </div>
      </section>

    </>
  );
}

export default Home;