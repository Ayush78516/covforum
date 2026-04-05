import { useState, useEffect } from "react";
import { directors } from "../data/bodinfo";

function BODPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);
  const [selectedDirector, setSelectedDirector] = useState(null);
  const [email, setEmail] = useState("");

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "Escape" && selectedDirector) setSelectedDirector(null);
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [selectedDirector]);

  useEffect(() => {
    if (selectedDirector || menuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [selectedDirector, menuOpen]);

  const toggleMenu = () => setMenuOpen((v) => !v);
  const closeMenu = () => { setMenuOpen(false); setAboutOpen(false); };

  return (
    <>
      {/* HERO */}
      <section className="hero">
        <div className="hero-content">
          <h1>Meet Our Board of Directors</h1>
          <p>
            At COV, our Board of Directors brings together a distinguished group
            of leaders from diverse fields—including valuation, finance,
            infrastructure, public policy, and cooperative development. Their
            collective expertise and vision guide our mission to elevate
            professional standards, foster innovation, and build a globally
            aligned, ethically grounded valuation ecosystem. Together, they
            ensure that COV remains an institution driven by impact, inclusion,
            and integrity.
          </p>
        </div>
      </section>

      {/* DIRECTORS GRID */}
      <section className="directors-section">
        <div className="directors-container">
          <div className="directors-grid">
            {directors.map((d) => (
              <div className="director-card" key={d.id}>
                <div className="director-image">
                  <img src={d.image} alt={d.name} />
                </div>
                <h3 className="director-name">{d.name}</h3>
                <p className="director-title">{d.title}</p>
                <p className="director-bio-preview">{d.preview}</p>
                <button
                  className="read-more-btn"
                  onClick={(e) => { e.stopPropagation(); setSelectedDirector(d); }}
                >
                  Read More
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* MODAL */}
      {selectedDirector && (
        <div
          className="modal-backdrop active"
          onClick={() => setSelectedDirector(null)}
        >
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setSelectedDirector(null)}>
              ✕
            </button>
            <div className="modal-header">
              <div className="modal-image">
                <img src={selectedDirector.image} alt={selectedDirector.name} />
              </div>
              <h2 className="modal-name">{selectedDirector.name}</h2>
              <p className="modal-title">{selectedDirector.title}</p>
            </div>
            <p className="modal-bio">{selectedDirector.bio}</p>
          </div>
        </div>
      )}
    </>
  );
};

export default BODPage;