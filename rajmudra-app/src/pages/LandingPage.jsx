import React from 'react';
import { Link } from 'react-router-dom';
import '../landing.css';
import { logoBase64 } from '../assets/logo';

const LandingPage = () => {
  return (
    <div className="landing-page-container">
      {/* ═══════════════════════════════════════════════
           LIVE PRICE TICKER
      ════════════════════════════════════════════════ */}
      <div className="ticker-container">
        <div className="ticker-content" id="tickerContent">
          <div className="ticker-item">
            <span className="ticker-symbol">AAPL</span>
            <span className="ticker-price">$180.45</span>
            <span className="ticker-change up">+1.25%</span>
          </div>
          <div className="ticker-item">
            <span className="ticker-symbol">MSFT</span>
            <span className="ticker-price">$425.30</span>
            <span className="ticker-change up">+0.85%</span>
          </div>
          <div className="ticker-item">
            <span className="ticker-symbol">TSLA</span>
            <span className="ticker-price">$242.15</span>
            <span className="ticker-change down">-0.95%</span>
          </div>
          <div className="ticker-item">
            <span className="ticker-symbol">BTC</span>
            <span className="ticker-price">$70,831</span>
            <span className="ticker-change down">-1.18%</span>
          </div>
          <div className="ticker-item">
            <span className="ticker-symbol">ETH</span>
            <span className="ticker-price">$2,189</span>
            <span className="ticker-change down">-1.28%</span>
          </div>
          <div className="ticker-item">
            <span className="ticker-symbol">XAUSD</span>
            <span className="ticker-price">$2045.50/oz</span>
            <span className="ticker-change up">+0.45%</span>
          </div>
          <div className="ticker-item">
            <span className="ticker-symbol">XAGUSD</span>
            <span className="ticker-price">$24.35/oz</span>
            <span className="ticker-change down">-0.32%</span>
          </div>
          <div className="ticker-item">
            <span className="ticker-symbol">USOIL</span>
            <span className="ticker-price">$81.30/bbl</span>
            <span className="ticker-change up">+1.15%</span>
          </div>
          <div className="ticker-item">
            <span className="ticker-symbol">AAPL</span>
            <span className="ticker-price">$180.45</span>
            <span className="ticker-change up">+1.25%</span>
          </div>
          <div className="ticker-item">
            <span className="ticker-symbol">MSFT</span>
            <span className="ticker-price">$425.30</span>
            <span className="ticker-change up">+0.85%</span>
          </div>
          <div className="ticker-item">
            <span className="ticker-symbol">TSLA</span>
            <span className="ticker-price">$242.15</span>
            <span className="ticker-change down">-0.95%</span>
          </div>
          <div className="ticker-item">
            <span className="ticker-symbol">BTC</span>
            <span className="ticker-price">$70,831</span>
            <span className="ticker-change down">-1.18%</span>
          </div>
          <div className="ticker-item">
            <span className="ticker-symbol">ETH</span>
            <span className="ticker-price">$2,189</span>
            <span className="ticker-change down">-1.28%</span>
          </div>
          <div className="ticker-item">
            <span className="ticker-symbol">XAUSD</span>
            <span className="ticker-price">$2045.50/oz</span>
            <span className="ticker-change up">+0.45%</span>
          </div>
          <div className="ticker-item">
            <span className="ticker-symbol">XAGUSD</span>
            <span className="ticker-price">$24.35/oz</span>
            <span className="ticker-change down">-0.32%</span>
          </div>
          <div className="ticker-item">
            <span className="ticker-symbol">USOIL</span>
            <span className="ticker-price">$81.30/bbl</span>
            <span className="ticker-change up">+1.15%</span>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════
           HERO (No navbar — just auth buttons)
      ════════════════════════════════════════════════ */}
      <header>
        <div className="hero-bg"></div>

        {/* Floating auth buttons — top-right corner */}
        <div className="hero-auth-buttons">
          <Link to="/login" className="btn-outline" id="hero-signin-btn">Sign In</Link>
          <Link to="/register" className="btn-primary" id="hero-register-btn">Register</Link>
        </div>

        <div className="header-content pt-16">
          <div className="logo-wrap">
            <img src={logoBase64} alt="Rajmudra Fintech" style={{ filter: 'drop-shadow(0 0 15px rgba(201,168,76,0.6))', width: '380px', maxWidth: '80%' }} />
          </div>
          <p className="eyebrow">Presents · Professional Forex Mastery</p>
          <h1>Trade with the<br /><em>Precision of</em><br />Institutions</h1>
          <p className="hero-sub">From first candle to live market execution — a complete transformation.</p>
          <div className="hero-cta">
            <a href="#syllabus" className="btn-primary">Explore the Programme</a>
            <a href="#contact" className="btn-outline">Contact Us</a>
          </div>
        </div>
        <div className="scroll-hint">Scroll to explore</div>
      </header>

      {/* ═══════════════════════════════════════════════
           STATS BAR
      ════════════════════════════════════════════════ */}
      <div className="stats-bar">
        <div className="stat-item">
          <span className="stat-num">5</span>
          <span className="stat-label">Structured Phases</span>
        </div>
        <div className="stat-item">
          <span className="stat-num">4</span>
          <span className="stat-label">Days Live Trading</span>
        </div>
        <div className="stat-item">
          <span className="stat-num">100%</span>
          <span className="stat-label">Dedication Required</span>
        </div>
        <div className="stat-item">
          <span className="stat-num">∞</span>
          <span className="stat-label">Trade Audit Support</span>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════
           HIGHLIGHTS
      ════════════════════════════════════════════════ */}
      <section id="highlights">
        <div className="section-tag">What Sets Us Apart</div>
        <h2>The <em>Rajmudra</em> Difference</h2>
        <p className="lead">We built this programme for those who are genuinely committed. Not for the curious — for the dedicated.</p>

        <div className="highlights-grid">
          <div className="highlight-card">
            <span className="card-num">01</span>
            <svg className="card-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
            <h3>For the Dedicated Only</h3>
            <p>This course demands 100% commitment. Designed exclusively for traders serious about results — not casual learners.</p>
          </div>

          <div className="highlight-card">
            <span className="card-num">02</span>
            <svg className="card-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line><line x1="2" y1="12" x2="6" y2="12"></line><line x1="18" y1="12" x2="22" y2="12"></line><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line></svg>
            <h3>Complete Roadmap</h3>
            <p>A seamless journey from basic fundamentals all the way to advanced institutional strategies. No gaps, no guesswork.</p>
          </div>

          <div className="highlight-card">
            <span className="card-num">03</span>
            <svg className="card-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>
            <h3>4-Day Live Trading</h3>
            <p>We don't just talk — we execute together in real-time markets. Real money, real decisions, real lessons.</p>
          </div>

          <div className="highlight-card">
            <span className="card-num">04</span>
            <svg className="card-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
            <h3>The Power of Three</h3>
            <p>We <strong>Educate</strong>, we <strong>Practice</strong>, and we <strong>Trade</strong> live. Three pillars. One complete trader.</p>
          </div>

          <div className="highlight-card">
            <span className="card-num">05</span>
            <svg className="card-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
            <h3>Active Hand-Holding</h3>
            <p>Continuous guidance throughout your learning journey. You are never alone in navigating the markets.</p>
          </div>

          <div className="highlight-card">
            <span className="card-num">06</span>
            <svg className="card-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path></svg>
            <h3>Trade Auditing</h3>
            <p>We review and refine your actual trades after the course. Mistakes become lessons. Lessons become profits.</p>
          </div>
        </div>
      </section>

      <div className="full-divider"></div>

      {/* ═══════════════════════════════════════════════
           SYLLABUS
      ════════════════════════════════════════════════ */}
      <div className="syllabus-section" id="syllabus">
        <div className="syllabus-inner">
          <div className="section-tag">Programme Structure</div>
          <h2>Course <em>Syllabus</em></h2>
          <p className="lead">Five carefully designed phases that build upon each other — creating a complete, professional trader.</p>

          <div className="syllabus-layout">
            <div className="phase-list">
              <div className="phase-item">
                <div className="phase-num">01</div>
                <div className="phase-content">
                  <div className="phase-title">The Foundation</div>
                  <div className="phase-topics">
                    <span>Forex Basics</span>
                    <span>Currency Pairs</span>
                    <span>Pips &amp; Lots</span>
                    <span>Leverage</span>
                    <span>Platform Setup</span>
                  </div>
                </div>
              </div>

              <div className="phase-item">
                <div className="phase-num">02</div>
                <div className="phase-content">
                  <div className="phase-title">Technical Analysis</div>
                  <div className="phase-topics">
                    <span>Candlestick Mastery</span>
                    <span>Support &amp; Resistance</span>
                    <span>Trendlines</span>
                    <span>Price Action</span>
                  </div>
                </div>
              </div>

              <div className="phase-item">
                <div className="phase-num">03</div>
                <div className="phase-content">
                  <div className="phase-title">Advanced Strategy — The Edge</div>
                  <div className="phase-topics">
                    <span>Smart Money Concepts</span>
                    <span>Market Structure</span>
                    <span>Supply &amp; Demand</span>
                    <span>Institutional Flow</span>
                  </div>
                </div>
              </div>

              <div className="phase-item">
                <div className="phase-num">04</div>
                <div className="phase-content">
                  <div className="phase-title">Risk Management</div>
                  <div className="phase-topics">
                    <span>Position Sizing</span>
                    <span>Risk-to-Reward</span>
                    <span>Capital Preservation</span>
                    <span>Trade Psychology</span>
                  </div>
                </div>
              </div>

              <div className="phase-item">
                <div className="phase-num">05</div>
                <div className="phase-content">
                  <div className="phase-title">Execution &amp; Audit</div>
                  <div className="phase-topics">
                    <span>4 Days Live Trading</span>
                    <span>Entry / Exit Psychology</span>
                    <span>Trade Review</span>
                    <span>Ongoing Audit</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Who Is This For Section */}
          <div className="who-is-this-section">
            <div className="who-is-this-inner">
              <div className="who-card">
                <h3>Who Is This <em>For?</em></h3>
                <span className="sub">Admission Criteria</span>
                <ul className="who-list">
                  <li>Individuals with zero to intermediate market knowledge</li>
                  <li>Those who can dedicate full time during the programme</li>
                  <li>Aspiring full-time or part-time professional traders</li>
                  <li>Anyone tired of losing money without a strategy</li>
                  <li>People serious about making trading a skill — not a gamble</li>
                </ul>
                <div className="who-divider"></div>
                <p className="tag-line">"We don't just teach you trading. We make you think like an institution."</p>
                <div className="who-divider"></div>
                <p className="footer-text">✓ Trusted by <strong>500+ Students</strong> — Limited seats are available per batch to ensure <strong>personalised attention</strong> for every student.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="full-divider"></div>

      {/* ═══════════════════════════════════════════════
           MEET YOUR MENTOR
      ════════════════════════════════════════════════ */}
      <div className="mentor-section">
        <div className="section-tag">Your Guides to Success</div>
        <h2>Meet Your <em>Mentors</em></h2>

        <div className="mentors-grid">
          <div className="mentor-card">
            <div className="mentor-initials-badge">VTP</div>
            <div className="mentor-content">
              <h3>Vishal Tompe Patil</h3>
              <span className="title">Founder &amp; Educational Mentor, Rajmudra Fintech</span>
              <p>With over 10 years of deep-rooted experience in trading and investing, Vishal specialises in institutional stock and forex market strategies. Holding an MBA in Finance, he brings academic rigour and real-market wisdom together in every session.</p>
              <p>His teaching philosophy centres on transforming retail traders into disciplined, institution-grade market participants — equipping them with Smart Money Concepts, order block analysis, and risk management frameworks that actually work.</p>
              <a href="https://wa.me/917020408147" target="_blank" rel="noreferrer" className="mentor-btn">
                <span>💬 Chat with Vishal</span>
              </a>
            </div>
          </div>

          <div className="mentor-card">
            <div className="mentor-initials-badge">NTP</div>
            <div className="mentor-content">
              <h3>Nilesh Thore Patil</h3>
              <span className="title">Founder &amp; Educational Mentor, Rajmudra Fintech</span>
              <p>Nilesh brings over 10 years of hands-on experience in forex, commodities, and equity markets. Specialising in price action, liquidity analysis, and multi-timeframe confluence, he has helped hundreds of students decode market structure with clarity and confidence.</p>
              <p>Known for his patient, step-by-step teaching style, Nilesh focuses on building long-term trading discipline — from charting fundamentals to live trade execution — ensuring every student leaves with a strategy they can rely on.</p>
              <a href="https://wa.me/919370473645" target="_blank" rel="noreferrer" className="mentor-btn">
                <span>💬 Chat with Nilesh</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="full-divider"></div>

      {/* ═══════════════════════════════════════════════
           STUDENT TESTIMONIALS
      ════════════════════════════════════════════════ */}
      <div className="testimonials-section">
        <div className="section-tag">Success Stories</div>
        <h2>What Our <em>Students</em> Say</h2>

        <div className="testimonials-grid">
          <div className="testimonial-card">
            <p className="testimonial-quote">"Truly Game Changing. I Will Never Use Retail Trading Concepts, Ever. Vishal Sir explained how the markets really work as opposed to the half baked knowledge I had after watching YouTube Videos. Such an eye opener."</p>
            <div className="testimonial-author">
              <div className="testimonial-avatar">M</div>
              <div>
                <div className="testimonial-name">Madhav</div>
                <div className="testimonial-role">Lawyer</div>
              </div>
            </div>
          </div>

          <div className="testimonial-card">
            <p className="testimonial-quote">"Mind Blowing! This Was The Best Trading Webinar I Have Ever Attended. The way Vishal Sir explains things shows the kind of time and energy he has spent in trading. Absolutely loved it!"</p>
            <div className="testimonial-author">
              <div className="testimonial-avatar">A</div>
              <div>
                <div className="testimonial-name">Abhishek</div>
                <div className="testimonial-role">Trader</div>
              </div>
            </div>
          </div>

          <div className="testimonial-card">
            <p className="testimonial-quote">"This Workshop Transformed My Approach to Trading. I cannot express enough gratitude to Vishal Sir and the incredible team at Rajmudra Fintech. The personal mentorship is invaluable."</p>
            <div className="testimonial-author">
              <div className="testimonial-avatar">P</div>
              <div>
                <div className="testimonial-name">Prashil</div>
                <div className="testimonial-role">Investor</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="full-divider"></div>

      {/* ═══════════════════════════════════════════════
           CONTACT
      ════════════════════════════════════════════════ */}
      <div className="contact-section" id="contact">
        <div className="contact-inner">
          <div className="section-tag">Enroll Now</div>
          <h2>Begin Your <em>Journey</em></h2>
          <p className="lead">Limited seats. Personalised attention. Reach out now to secure your place in the next batch.</p>

          <div className="contact-layout">
            <div>
              <div className="contact-item">
                <div className="contact-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.18h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.82a16 16 0 0 0 5.55 5.55l.96-.96a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"></path>
                  </svg>
                </div>
                <div>
                  <div className="contact-label">Call / WhatsApp</div>
                  <div className="contact-val">
                    <a href="tel:+917020408147">+91 70204 08147</a>
                  </div>
                  <div className="contact-val" style={{ marginTop: '4px' }}>
                    <a href="tel:+919370473645">+91 93704 73645</a>
                  </div>
                </div>
              </div>

              <div className="contact-item">
                <div className="contact-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                    <polyline points="22,6 12,13 2,6"></polyline>
                  </svg>
                </div>
                <div>
                  <div className="contact-label">Email</div>
                  <div className="contact-val">
                    <a href="mailto:info@rajmudrafintech.com" style={{ color: 'var(--gold)' }}>info@rajmudrafintech.com</a><br />
                    <a href="mailto:contact@rajmudrafintech.com" style={{ color: 'var(--gold)' }}>contact@rajmudrafintech.com</a>
                  </div>
                </div>
              </div>

              <div className="contact-item">
                <div className="contact-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
                    <line x1="8" y1="21" x2="16" y2="21"></line>
                    <line x1="12" y1="17" x2="12" y2="21"></line>
                  </svg>
                </div>
                <div>
                  <div className="contact-label">WhatsApp DM Keyword</div>
                  <div className="contact-val" style={{ color: 'var(--gold)', fontFamily: "'Montserrat',sans-serif", fontSize: '22px', letterSpacing: '3px', fontWeight: '700' }}>TRADER</div>
                </div>
              </div>

            </div>

            <div className="contact-right">
              <h3>Ready to Transform<br />Your Trading?</h3>
              <p>Send us a WhatsApp message with the keyword <strong style={{ color: 'var(--gold)' }}>TRADER</strong> to receive the full syllabus, batch dates, and pricing details instantly.</p>

              <p className="tag-line">"Stop trading blindly. Start trading strategically. The market rewards preparation — not luck."</p>

              <div style={{ marginTop: '28px' }}>
                <a href="https://wa.me/917020408147" className="btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '10px' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"></path></svg>
                Message TRADER on WhatsApp
              </a>
            </div>
          </div>
        </div>
      </div>
      </div>
      
      {/* ═══════════════════════════════════════════════
           COMPANY INFO & FOOTER
      ════════════════════════════════════════════════ */}
      <div className="company-info-section">
        <div className="company-info-inner">
          <div className="company-info-left">
            <h4>Rajmudra Fintech</h4>
            <p>Our mission is to bridge the gap between retail traders and institutional market dynamics. We dedicate ourselves to cultivating deeply knowledgeable, disciplined, and profitable traders.</p>
            <div className="company-details">
              <div className="company-detail-item"><strong>Headquarters:</strong> Maharashtra, India</div>
              <div className="company-detail-item"><strong>Email:</strong> info@rajmudrafintech.com</div>
              <div className="company-detail-item"><strong>Working Hours:</strong> Mon - Fri, 9:00 AM - 6:00 PM (IST)</div>
            </div>
            <div className="contact-links">
              <a href="https://wa.me/917020408147" target="_blank" rel="noreferrer">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"></path></svg>
              </a>
              <a href="https://www.instagram.com/rajmudrafintech/" target="_blank" rel="noreferrer">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
              </a>
              <a href="#" style={{ pointerEvents: 'none', opacity: 0.5 }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path></svg>
              </a>
            </div>
          </div>
        </div>
      </div>
      
    </div>
  );
};

export default LandingPage;
