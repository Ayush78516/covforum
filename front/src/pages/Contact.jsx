import { useEffect, useRef, useState } from "react";

function Contact() {
  const [formData, setFormData] = useState({
    name: "", email: "", phone: "", subject: "", message: "",
  });

  const contactGridRef = useRef(null);
  const mapSectionRef = useRef(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      alert("Message sent successfully!");
      setFormData({ name: "", email: "", phone: "", subject: "", message: "" });
    } catch (err) {
      alert("Something went wrong. Please try again.");
    }
  };

  // Fade-in animations
  useEffect(() => {
    const observerOptions = { threshold: 0.1, rootMargin: "0px" };

    const formTitle = document.querySelector(".contact-form-section h2");
    const infoTitle = document.querySelector(".contact-info-section h2");
    const formGroups = document.querySelectorAll(".contact-form-section .form-group");
    const submitBtn = document.querySelector(".submit-btn");
    const infoItems = document.querySelectorAll(".info-item");

    // Set initial states
    [formTitle, infoTitle, submitBtn].forEach((el) => {
      if (el) { el.style.opacity = "0"; el.style.transform = "translateY(20px)"; }
    });
    [...formGroups, ...infoItems].forEach((el) => {
      el.style.opacity = "0"; el.style.transform = "translateY(20px)";
    });

    const gridObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          [formTitle, infoTitle].forEach((el) => {
            if (el) setTimeout(() => {
              el.style.transition = "all 0.8s ease";
              el.style.opacity = "1";
              el.style.transform = "translateY(0)";
            }, 200);
          });

          [...formGroups].forEach((el, i) => {
            setTimeout(() => {
              el.style.transition = "all 0.6s ease";
              el.style.opacity = "1";
              el.style.transform = "translateY(0)";
            }, 400 + i * 100);
          });

          [...infoItems].forEach((el, i) => {
            setTimeout(() => {
              el.style.transition = "all 0.6s ease";
              el.style.opacity = "1";
              el.style.transform = "translateX(0)";
            }, 400 + i * 100);
          });

          if (submitBtn) setTimeout(() => {
            submitBtn.style.transition = "all 0.8s ease";
            submitBtn.style.opacity = "1";
            submitBtn.style.transform = "translateY(0)";
          }, 400 + formGroups.length * 100);

          gridObserver.unobserve(entry.target);
        }
      });
    }, observerOptions);

    if (contactGridRef.current) gridObserver.observe(contactGridRef.current);

    // Map fade-in
    const mapEl = mapSectionRef.current;
    if (mapEl) {
      mapEl.style.opacity = "0";
      mapEl.style.transform = "translateY(40px)";
      const mapObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            mapEl.style.transition = "all 0.8s ease";
            mapEl.style.opacity = "1";
            mapEl.style.transform = "translateY(0)";
            mapObserver.unobserve(entry.target);
          }
        });
      }, observerOptions);
      mapObserver.observe(mapEl);
    }

    return () => { gridObserver.disconnect(); };
  }, []);

  const infoItems = [
    {
      icon: "fas fa-map-marker-alt",
      title: "Address",
      content: <>26/A, First Cross, First Main Canara Bank Colony,<br />Subramanyapura, Bengaluru-560061, Karnataka</>,
    },
    {
      icon: "fas fa-phone-alt",
      title: "Phone",
      content: <a href="tel:+919599099012">+91 9599099012</a>,
    },
    {
      icon: "fas fa-envelope",
      title: "Email",
      content: <a href="mailto:covindiaforum@gmail.com">covindiaforum@gmail.com</a>,
    },
    {
      icon: "fas fa-clock",
      title: "Working Hours",
      content: <>Mon - Sat: 9:00 AM - 5:00 PM<br />Sunday: Closed</>,
    },
  ];

  const bankDetails = [
    { label: "Bank Name", value: "Yes Bank Ltd" },
    { label: "Account Number", value: "020588700000262" },
    { label: "IFSC Code", value: "YESB0000205" },
    { label: "Branch", value: "Karol Bagh, New Delhi" },
  ];

  return (
    <>
      {/* HERO */}
      <section className="hero">
        <h1>Get In Touch</h1>
        <p>We'd love to hear from you. Reach out to us anytime!</p>
      </section>

      {/* MAIN CONTAINER */}
      <div className="container">

        {/* Contact Grid */}
        <div className="contact-grid" ref={contactGridRef}>

          {/* Contact Form */}
          <div className="contact-form-section">
            <h2>Send Us a Message</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <input
                  type="text" name="name" placeholder="Full Name *"
                  value={formData.name} onChange={handleChange} required
                />
              </div>
              <div className="form-group">
                <input
                  type="email" name="email" placeholder="Email Address *"
                  value={formData.email} onChange={handleChange} required
                />
              </div>
              <div className="form-group">
                <input
                  type="tel" name="phone" placeholder="Phone Number"
                  value={formData.phone} onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <input
                  type="text" name="subject" placeholder="Subject *"
                  value={formData.subject} onChange={handleChange} required
                />
              </div>
              <div className="form-group">
                <textarea
                  name="message" placeholder="Message *"
                  value={formData.message} onChange={handleChange} required
                />
              </div>
              <button type="submit" className="submit-btn">Send Message</button>
            </form>
          </div>

          {/* Contact Info */}
          <div className="contact-info-section">
            <h2>Contact Information</h2>
            {infoItems.map((item, i) => (
              <div className="info-item" key={i}>
                <div className="info-icon">
                  <i className={item.icon}></i>
                </div>
                <div className="info-content">
                  <h3>{item.title}</h3>
                  <p>{item.content}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Map Section */}
        <div className="map-section" ref={mapSectionRef}>
          <h2>Find Us on Map</h2>
          <div className="map-container">
            <p>
              <i className="fas fa-map-marked-alt" style={{ fontSize: "2em" }}></i>
              <br />Map
            </p>
          </div>
        </div>

        {/* Bank Details */}
        <div className="bank-details-section">
          <h2>Bank Details</h2>
          <div className="bank-card">
            <div className="bank-header">
              <i className="fas fa-university"></i>
              <h3>COV India Forum</h3>
            </div>
            <div className="bank-info-grid">
              {bankDetails.map((item, i) => (
                <div className="bank-info-item" key={i}>
                  <div className="bank-label">{item.label}</div>
                  <div className="bank-value">{item.value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </>
  );
}

export default Contact;