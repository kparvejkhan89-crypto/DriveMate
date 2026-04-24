import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, MapPin, TrendingUp, Car, Star, ArrowRight } from 'lucide-react';
import Button from '../components/Button';
import './Landing.css';

export default function Landing() {
  return (
    <div className="landing">
      {/* Navigation / Header */}
      <nav className="landing-nav container">
        <div className="nav-brand">
          <Car size={32} className="text-primary" />
          <span className="brand-name">DriveMate</span>
        </div>
        <div className="nav-links">
          <Link to="/login" className="nav-login">User Login</Link>
          <Link to="/login-provider" className="nav-login">Provider Login</Link>
          <Link to="/signup?role=user">

            <Button size="md" className="nav-cta">Get Started</Button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="hero-section">
        <div className="hero-bg-shapes">
          <div className="shape shape-1"></div>
          <div className="shape shape-2"></div>
        </div>
        <div className="container hero-content animate-slide-up">
          <div className="hero-badge">✨ The #1 Vehicle Management Platform</div>
          <h1 className="hero-title">
            Your vehicle's <span className="gradient-text">ultimate</span> companion.
          </h1>
          <p className="hero-subtitle">
            Experience seamless vehicle management. Track expenses, securely store documents, and book top-rated service centers in seconds.
          </p>
          <div className="hero-actions">
            <Link to="/signup?role=user">
              <Button size="lg" className="cta-btn primary-glow">
                Start for Free <ArrowRight size={20} style={{ marginLeft: 8 }}/>
              </Button>
            </Link>
            <Link to="/signup?role=provider">
              <Button size="lg" variant="outline" className="cta-btn-outline glass-btn">
                Join as Provider
              </Button>
            </Link>
          </div>
          <div className="hero-social-proof text-muted text-sm mt-4">
            Trusted by 50,000+ vehicle owners nationwide.
          </div>
        </div>
      </header>

      {/* Features Section */}
      <section className="features-section container">
        <div className="section-header text-center">
          <h2 className="section-title">Everything you need, in one place</h2>
          <p className="section-subtitle text-muted">Powerful features designed to make vehicle ownership stress-free.</p>
        </div>
        
        <div className="features-grid">
          <div className="feature-card glass-card">
            <div className="feature-icon-wrapper"><Car size={28} className="text-primary" /></div>
            <h3>Smart Dashboard</h3>
            <p className="text-muted">Get real-time insights and a holistic view of all your vehicles in one secure dashboard.</p>
          </div>
          <div className="feature-card glass-card">
            <div className="feature-icon-wrapper"><MapPin size={28} className="text-primary" /></div>
            <h3>Instant Booking</h3>
            <p className="text-muted">Find nearby top-rated service centers, compare prices, and book slots instantly.</p>
          </div>
          <div className="feature-card glass-card">
            <div className="feature-icon-wrapper"><TrendingUp size={28} className="text-primary" /></div>
            <h3>Expense Tracking</h3>
            <p className="text-muted">Automatically monitor fuel, maintenance, and insurance costs with visual charts.</p>
          </div>
          <div className="feature-card glass-card">
            <div className="feature-icon-wrapper"><ShieldCheck size={28} className="text-primary" /></div>
            <h3>Digital Vault</h3>
            <p className="text-muted">Upload and access your RC, insurance, and PUC documents anytime, securely.</p>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="how-it-works bg-surface">
        <div className="container">
          <h2 className="section-title text-center">How DriveMate Works</h2>
          <div className="steps-container">
            <div className="step-item">
              <div className="step-number">1</div>
              <h4>Add Your Vehicle</h4>
              <p className="text-muted">Enter basic details or upload documents to get started.</p>
            </div>
            <div className="step-item">
              <div className="step-number">2</div>
              <h4>Find Services</h4>
              <p className="text-muted">Browse nearby verified centers based on your needs.</p>
            </div>
            <div className="step-item">
              <div className="step-number">3</div>
              <h4>Book & Track</h4>
              <p className="text-muted">Confirm appointments and track maintenance history automatically.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="testimonials-section container">
        <h2 className="section-title text-center">Loved by car owners</h2>
        <div className="testimonials-grid">
          <div className="testimonial-card">
            <div className="stars"><Star size={16} /><Star size={16} /><Star size={16} /><Star size={16} /><Star size={16} /></div>
            <p className="testimonial-text">"DriveMate completely changed how I manage my car. Tracking fuel and service history has never been easier. Highly recommended!"</p>
            <div className="testimonial-author">
              <div className="author-avatar">S</div>
              <div>
                <h5>Sarah Jenkins</h5>
                <p className="text-sm text-muted">Daily Commuter</p>
              </div>
            </div>
          </div>
          <div className="testimonial-card">
            <div className="stars"><Star size={16} /><Star size={16} /><Star size={16} /><Star size={16} /><Star size={16} /></div>
            <p className="testimonial-text">"As a service provider, getting listed on DriveMate boosted my bookings by 40%. The dashboard is incredibly intuitive."</p>
            <div className="testimonial-author">
              <div className="author-avatar">M</div>
              <div>
                <h5>Mike Roberts</h5>
                <p className="text-sm text-muted">Garage Owner</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bottom-cta container text-center">
        <div className="cta-box glass">
          <h2>Ready to simplify your vehicle ownership?</h2>
          <p className="text-muted mb-4">Join thousands of users who have already made the switch to DriveMate.</p>
          <Link to="/signup?role=user">
            <Button size="lg" className="cta-btn primary-glow" style={{ margin: '0 auto' }}>Create Free Account</Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer bg-dark text-white">
        <div className="container">
          <div className="footer-grid">
            <div className="footer-brand">
              <div className="flex items-center gap-2 mb-2">
                <Car size={28} className="text-primary" />
                <span className="brand-name text-xl">DriveMate</span>
              </div>
              <p className="text-muted text-sm" style={{ opacity: 0.7 }}>The ultimate vehicle companion platform for seamless management and service booking.</p>
            </div>
            <div className="footer-links">
              <h4>Product</h4>
              <Link to="#">Features</Link>
              <Link to="#">Pricing</Link>
              <Link to="#">For Providers</Link>
            </div>
            <div className="footer-links">
              <h4>Company</h4>
              <Link to="#">About Us</Link>
              <Link to="#">Careers</Link>
              <Link to="#">Contact</Link>
            </div>
            <div className="footer-links">
              <h4>Legal</h4>
              <Link to="#">Privacy Policy</Link>
              <Link to="#">Terms of Service</Link>
            </div>
          </div>
          <div className="footer-bottom text-center text-sm text-muted border-top pt-4 mt-4" style={{ opacity: 0.7 }}>
            <p>&copy; {new Date().getFullYear()} DriveMate. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
