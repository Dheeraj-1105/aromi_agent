import { useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Dumbbell, Apple, TrendingUp, ArrowRight, Sparkles, UserPlus, MessageSquare, Trophy } from 'lucide-react'
import useAuth from '../store/useAuth'

export default function Landing() {
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/chat', { replace: true })
    }
  }, [isAuthenticated, navigate])

  if (isAuthenticated) {
    return null
  }

  const S = {
    page: {
      minHeight: '100vh',
      background: '#07080c',
      color: '#e8e9f0',
      display: 'flex',
      flexDirection: 'column',
      fontFamily: "'Inter', -apple-system, sans-serif",
      position: 'relative',
      overflowX: 'hidden',
      overflowY: 'auto'
    },
    inner: {
      maxWidth: 1100,
      margin: '0 auto',
      padding: '0 40px',
      width: '100%',
      position: 'relative',
      zIndex: 2
    },
    nav: {
      borderBottom: '1px solid rgba(42, 45, 62, 0.4)',
      background: 'rgba(7, 8, 12, 0.75)',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      position: 'sticky',
      top: 0,
      zIndex: 50
    },
    navRow: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '16px 0'
    },
    logoRow: {
      display: 'flex',
      alignItems: 'center',
      gap: 8
    },
    badge: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6,
      background: 'rgba(124,106,247,0.1)',
      border: '1px solid rgba(124,106,247,0.25)',
      color: '#a89cf7',
      borderRadius: 20,
      padding: '5px 14px',
      fontSize: 12,
      fontWeight: 600,
      marginBottom: 20,
      boxShadow: '0 2px 10px rgba(124,106,247,0.05)'
    },
    hero: {
      textAlign: 'center',
      padding: '88px 0 64px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      position: 'relative',
      zIndex: 2
    },
    h1: {
      fontSize: 48,
      fontWeight: 800,
      color: '#e8e9f0',
      letterSpacing: '-0.5px',
      lineHeight: 1.15,
      marginBottom: 18,
      background: 'linear-gradient(to bottom right, #ffffff 30%, #a89cf7 100%)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
    },
    subtitle: {
      fontSize: 16,
      color: '#8b8fa8',
      lineHeight: 1.65,
      maxWidth: 580,
      marginBottom: 36
    },
    btnPrimary: {
      background: 'linear-gradient(135deg, #7c6af7 0%, #6b5ce7 100%)',
      color: 'white',
      border: 'none',
      padding: '13px 26px',
      borderRadius: 8,
      fontSize: 14,
      fontWeight: 600,
      cursor: 'pointer',
      display: 'inline-flex',
      alignItems: 'center',
      gap: 8,
      textDecoration: 'none',
      transition: 'all 0.2s ease',
      boxShadow: '0 4px 20px rgba(124, 106, 247, 0.3)'
    },
    btnSecondary: {
      background: 'rgba(255, 255, 255, 0.03)',
      color: '#e8e9f0',
      border: '1px solid rgba(42, 45, 62, 0.8)',
      padding: '12px 26px',
      borderRadius: 8,
      fontSize: 14,
      fontWeight: 600,
      cursor: 'pointer',
      display: 'inline-flex',
      alignItems: 'center',
      gap: 8,
      textDecoration: 'none',
      transition: 'all 0.2s ease',
      backdropFilter: 'blur(4px)',
      WebkitBackdropFilter: 'blur(4px)'
    },
    section: {
      paddingTop: 72,
      paddingBottom: 72,
      position: 'relative',
      zIndex: 2
    },
    sectionCenter: {
      textAlign: 'center',
      marginBottom: 48
    },
    h2: {
      fontSize: 32,
      fontWeight: 700,
      color: '#e8e9f0',
      marginBottom: 12,
      letterSpacing: '-0.3px'
    },
    sectionSub: {
      fontSize: 15,
      color: '#8b8fa8'
    },
    grid3: {
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
      gap: 24,
      width: '100%'
    },
    card: {
      background: 'rgba(19, 21, 30, 0.65)',
      border: '1px solid rgba(42, 45, 62, 0.6)',
      borderRadius: 16,
      padding: '28px 24px',
      transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
      backdropFilter: 'blur(8px)',
      WebkitBackdropFilter: 'blur(8px)',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
      position: 'relative',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-start'
    },
    iconBox: {
      width: 44,
      height: 44,
      borderRadius: 10,
      background: 'rgba(124, 106, 247, 0.12)',
      border: '1px solid rgba(124, 106, 247, 0.25)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 18,
      color: '#a89cf7',
      transition: 'all 0.2s ease'
    },
    cardTitle: {
      fontSize: 16,
      fontWeight: 600,
      color: '#e8e9f0',
      marginBottom: 10
    },
    cardDesc: {
      fontSize: 13.5,
      color: '#8b8fa8',
      lineHeight: 1.6
    },
    stepBadge: {
      position: 'absolute',
      top: 18,
      right: 18,
      background: 'rgba(124, 106, 247, 0.12)',
      border: '1px solid rgba(124, 106, 247, 0.25)',
      color: '#a89cf7',
      borderRadius: 20,
      padding: '2px 10px',
      fontSize: 11,
      fontWeight: 700,
    },
    cta: {
      background: 'rgba(19, 21, 30, 0.65)',
      border: '1px solid rgba(42, 45, 62, 0.6)',
      borderRadius: 16,
      padding: '56px 40px',
      textAlign: 'center',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 18,
      backdropFilter: 'blur(8px)',
      WebkitBackdropFilter: 'blur(8px)',
      boxShadow: '0 12px 40px rgba(0, 0, 0, 0.4)',
      position: 'relative',
      overflow: 'hidden'
    },
    footer: {
      borderTop: '1px solid rgba(42, 45, 62, 0.4)',
      background: 'rgba(7, 8, 12, 0.85)',
      padding: '28px 0',
      textAlign: 'center',
      fontSize: 13,
      color: '#4a4d62',
      position: 'relative',
      zIndex: 2
    },
    orb1: {
      position: 'absolute',
      top: '-10%',
      left: '-15%',
      width: '600px',
      height: '600px',
      borderRadius: '50%',
      background: 'radial-gradient(circle, rgba(124, 106, 247, 0.08) 0%, transparent 70%)',
      pointerEvents: 'none',
      zIndex: 0
    },
    orb2: {
      position: 'absolute',
      top: '35%',
      right: '-15%',
      width: '700px',
      height: '700px',
      borderRadius: '50%',
      background: 'radial-gradient(circle, rgba(99, 179, 237, 0.05) 0%, transparent 70%)',
      pointerEvents: 'none',
      zIndex: 0
    },
    orb3: {
      position: 'absolute',
      bottom: '10%',
      left: '-10%',
      width: '600px',
      height: '600px',
      borderRadius: '50%',
      background: 'radial-gradient(circle, rgba(124, 106, 247, 0.06) 0%, transparent 70%)',
      pointerEvents: 'none',
      zIndex: 0
    }
  }

  return (
    <div style={S.page}>
      {/* Background Glow Orbs */}
      <div style={S.orb1} />
      <div style={S.orb2} />
      <div style={S.orb3} />

      {/* Navbar */}
      <header style={S.nav}>
        <div style={{ ...S.inner, ...S.navRow }} className="landing-nav-inner">
          <div style={S.logoRow}>
            <svg width="24" height="24" viewBox="0 0 32 32" fill="none">
              <path d="M16 6C10.477 6 6 10.477 6 16s4.477 10 10 10 10-4.477 10-10S21.523 6 16 6z" stroke="#7c6af7" strokeWidth="2.5" fill="none" />
              <circle cx="16" cy="16" r="3.5" fill="#7c6af7" />
            </svg>
            <span style={{ fontWeight: 700, fontSize: 18, color: '#e8e9f0', letterSpacing: '-0.3px' }}>AroMi</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <Link to="/login" style={{ fontSize: 14, fontWeight: 500, color: '#8b8fa8', textDecoration: 'none', transition: 'color 0.15s' }}
              onMouseEnter={e => e.currentTarget.style.color = '#e8e9f0'}
              onMouseLeave={e => e.currentTarget.style.color = '#8b8fa8'}
            >Login</Link>
            <Link to="/register" style={{ ...S.btnPrimary, padding: '9px 18px', fontSize: 13 }}
              onMouseEnter={e => {
                e.currentTarget.style.background = 'linear-gradient(135deg, #8c7cf8 0%, #7b6de9 100%)';
                e.currentTarget.style.boxShadow = '0 6px 24px rgba(124, 106, 247, 0.45)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'linear-gradient(135deg, #7c6af7 0%, #6b5ce7 100%)';
                e.currentTarget.style.boxShadow = '0 4px 20px rgba(124, 106, 247, 0.3)';
              }}
            >Get Started</Link>
          </div>
        </div>
      </header>

      <main style={{ flex: 1, position: 'relative', zIndex: 2 }}>
        {/* Hero */}
        <div style={S.inner} className="landing-section-inner">
          <section style={S.hero} className="landing-hero-section">
            <div style={S.badge}><Sparkles size={12} /><span>AroMi AI Coach v2.0</span></div>
            <h1 style={S.h1} className="landing-hero-title">AroMi — Your AI Fitness Coach</h1>
            <p style={S.subtitle}>
              A personalized workout, nutrition, and wellness companion that remembers your preferences, tracks your trends, and adapts to your daily progress in real-time.
            </p>
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', justifyContent: 'center' }}>
              <Link to="/register" style={S.btnPrimary}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.background = 'linear-gradient(135deg, #8c7cf8 0%, #7b6de9 100%)';
                  e.currentTarget.style.boxShadow = '0 6px 24px rgba(124, 106, 247, 0.5)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.background = 'linear-gradient(135deg, #7c6af7 0%, #6b5ce7 100%)';
                  e.currentTarget.style.boxShadow = '0 4px 20px rgba(124, 106, 247, 0.3)';
                }}
              >
                Start Your Journey <ArrowRight size={16} />
              </Link>
              <Link to="/login" style={S.btnSecondary}
                onMouseEnter={e => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                  e.currentTarget.style.borderColor = 'rgba(124, 106, 247, 0.4)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
                  e.currentTarget.style.borderColor = 'rgba(42, 45, 62, 0.8)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >Sign In</Link>
            </div>
          </section>
        </div>

        {/* Feature Cards */}
        <div style={{ borderTop: '1px solid rgba(42, 45, 62, 0.4)', borderBottom: '1px solid rgba(42, 45, 62, 0.4)', padding: '80px 0', background: 'rgba(7, 8, 12, 0.4)' }}>
          <div style={S.inner} className="landing-section-inner">
            <div style={S.sectionCenter}>
              <h2 style={S.h2}>Designed for Your Transformation</h2>
              <p style={S.sectionSub}>Real-time coaching and personalization at every stage of your fitness journey</p>
            </div>
            <div style={S.grid3} className="landing-grid">
              {[
                { icon: <Dumbbell size={20} />, title: 'Personalized Workouts', desc: 'Dynamic plans that target specific muscle groups, balance consecutive days, and adjust dynamically to your equipment and constraints.' },
                { icon: <Apple size={20} />, title: 'Smart Nutrition', desc: 'Target caloric and macro calculations based on your parameters. Prompt adjustments in seconds via natural chat inputs.' },
                { icon: <TrendingUp size={20} />, title: 'Progress Tracking', desc: 'Visualize weight logs, track workout streak milestones, check weekly progress check-ins, and stay consistent with streak rewards.' },
              ].map((feat, i) => (
                <div key={i} style={S.card}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = 'rgba(124, 106, 247, 0.45)';
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.boxShadow = '0 12px 40px rgba(124, 106, 247, 0.15)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = 'rgba(42, 45, 62, 0.6)';
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.3)';
                  }}
                >
                  <div style={S.iconBox}>{feat.icon}</div>
                  <h3 style={S.cardTitle}>{feat.title}</h3>
                  <p style={S.cardDesc}>{feat.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* How It Works */}
        <div style={{ padding: '80px 0' }}>
          <div style={S.inner} className="landing-section-inner">
            <div style={S.sectionCenter}>
              <h2 style={S.h2}>How It Works</h2>
              <p style={S.sectionSub}>Getting results with your personal AI coach is simple and structured</p>
            </div>
            <div style={S.grid3} className="landing-grid">
              {[
                { n: 1, title: 'Share Your Profile', desc: 'Provide your target goals, daily activities, and dietary preferences during a quick onboarding setup.', icon: <UserPlus size={20} /> },
                { n: 2, title: 'Ask AroMi Anything', desc: 'Request customized workout templates, macro adjustments, or daily meal recommendations directly in chat.', icon: <MessageSquare size={20} /> },
                { n: 3, title: 'Log Your Wins', desc: 'Update your weekly weight logs, log finished workouts, build consistency streaks, and reach your goals.', icon: <Trophy size={20} /> },
              ].map((step) => (
                <div key={step.n} style={S.card}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = 'rgba(99, 179, 237, 0.45)';
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.boxShadow = '0 12px 40px rgba(99, 179, 237, 0.15)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = 'rgba(42, 45, 62, 0.6)';
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.3)';
                  }}
                >
                  <span style={S.stepBadge}>Step 0{step.n}</span>
                  <div style={{ ...S.iconBox, color: '#63b3ed', background: 'rgba(99, 179, 237, 0.12)', border: '1px solid rgba(99, 179, 237, 0.25)' }}>
                    {step.icon}
                  </div>
                  <h3 style={S.cardTitle}>{step.title}</h3>
                  <p style={S.cardDesc}>{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CTA */}
        <div style={{ padding: '0 0 88px' }}>
          <div style={S.inner} className="landing-section-inner">
            <div style={S.cta}>
              {/* Inner subtle glow for CTA */}
              <div style={{
                position: 'absolute', top: '-50%', left: '-50%', width: '200%', height: '200%',
                background: 'radial-gradient(circle, rgba(124,106,247,0.05) 0%, transparent 50%)',
                pointerEvents: 'none', zIndex: 0
              }} />
              <h2 style={{ ...S.h2, margin: 0, position: 'relative', zIndex: 1 }}>Ready to take control of your health?</h2>
              <p style={{ fontSize: 14.5, color: '#8b8fa8', maxWidth: 480, lineHeight: 1.65, margin: 0, position: 'relative', zIndex: 1 }}>
                Join today and start building customized fitness and nutrition regimens built specifically for your body and your goals.
              </p>
              <Link to="/register" style={{ ...S.btnPrimary, position: 'relative', zIndex: 1 }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.background = 'linear-gradient(135deg, #8c7cf8 0%, #7b6de9 100%)';
                  e.currentTarget.style.boxShadow = '0 6px 24px rgba(124, 106, 247, 0.5)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.background = 'linear-gradient(135deg, #7c6af7 0%, #6b5ce7 100%)';
                  e.currentTarget.style.boxShadow = '0 4px 20px rgba(124, 106, 247, 0.3)';
                }}
              >
                Get Started Free
              </Link>
            </div>
          </div>
        </div>
      </main>

      <footer style={S.footer}>
        <div style={S.inner} className="landing-section-inner">
          <p>© 2026 AroMi AI. All rights reserved.</p>
        </div>
      </footer>

      {/* Embedded CSS for mobile responsiveness and minor animations */}
      <style>{`
        @media (max-width: 768px) {
          .landing-grid {
            grid-template-columns: 1fr !important;
            gap: 16px !important;
          }
          .landing-hero-title {
            font-size: 32px !important;
          }
          .landing-nav-inner {
            padding: 0 16px !important;
          }
          .landing-hero-section {
            padding: 56px 0 48px !important;
          }
          .landing-section-inner {
            padding: 0 16px !important;
          }
        }
      `}</style>
    </div>
  )
}
