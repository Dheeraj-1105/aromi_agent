import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { MessageSquare, Dumbbell, Apple, TrendingUp, Settings, LogOut } from 'lucide-react'
import apiClient from '../api/client'
import useAuth from '../store/useAuth'

export default function Sidebar() {
  const { user, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [profile, setProfile] = useState(null)

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await apiClient.get('/profile')
        setProfile(res.data)
      } catch (err) {
        console.error('Failed to load profile')
      }
    }
    fetchProfile()
  }, [])

  const goalLabels = {
    lose_weight: '🔥 Lose Weight',
    build_muscle: '💪 Build Muscle',
    endurance: '🏃 Endurance',
    general_fitness: '⭐ Stay Fit',
  }

  const fitnessLabels = {
    beginner: '🌱 Beginner',
    intermediate: '🌿 Intermediate',
    advanced: '🌳 Advanced',
  }

  const navItems = [
    { path: '/chat', label: 'Chat Coach', icon: <MessageSquare size={16} /> },
    { path: '/workout', label: 'Workout Plan', icon: <Dumbbell size={16} /> },
    { path: '/nutrition', label: 'Nutrition Plan', icon: <Apple size={16} /> },
    { path: '/progress', label: 'Progress Tracker', icon: <TrendingUp size={16} /> },
    { path: '/settings', label: 'Settings', icon: <Settings size={16} /> },
  ]

  const handleLogout = () => {
    logout()
    window.location.href = '/'
  }

  const SectionLabel = ({ text }) => (
    <div style={{
      padding: '16px 16px 6px',
      fontSize: 10,
      fontWeight: 600,
      color: '#4a4d62',
      letterSpacing: '1px',
      textTransform: 'uppercase'
    }}>
      {text}
    </div>
  )

  const InfoCard = ({ label, value }) => (
    <div style={{
      background: 'rgba(124,106,247,0.08)',
      border: '1px solid rgba(124,106,247,0.2)',
      borderRadius: 8,
      padding: '10px 12px',
      marginBottom: 6
    }}>
      <p style={{ fontSize: 10, color: '#4a4d62', fontWeight: 600, letterSpacing: '0.8px', textTransform: 'uppercase', marginBottom: 4 }}>{label}</p>
      <p style={{ fontSize: 13, fontWeight: 600, color: '#e8e9f0', display: 'flex', alignItems: 'center', gap: 6 }}>{value}</p>
    </div>
  )

  const userInitial = user?.full_name?.charAt(0)?.toUpperCase() || 'U'

  return (
    <aside className="sidebar" style={{
      width: 240,
      flexShrink: 0,
      background: '#0f1117',
      borderRight: '1px solid #2a2d3e',
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      overflowY: 'auto',
      overflowX: 'hidden',
      fontFamily: "'Inter', -apple-system, sans-serif",
    }}>
      {/* Top logo row */}
      <div style={{
        padding: 16,
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        borderBottom: '1px solid #2a2d3e',
        flexShrink: 0
      }}>
        <div style={{
          width: 28, height: 28, borderRadius: '50%',
          background: '#7c6af7',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 14, color: 'white', flexShrink: 0
        }}>⊙</div>
        <span style={{ fontSize: 16, fontWeight: 600, color: '#e8e9f0' }}>AroMi</span>
        <span style={{
          fontSize: 10, color: '#7c6af7',
          background: 'rgba(124,106,247,0.1)',
          border: '1px solid rgba(124,106,247,0.2)',
          borderRadius: 20, padding: '1px 7px',
          marginLeft: 'auto', fontWeight: 600
        }}>AI Coach</span>
      </div>

      {/* Navigation section */}
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <SectionLabel text="NAVIGATION" />
        <nav style={{ display: 'flex', flexDirection: 'column', gap: 2, padding: '0 8px' }}>
          {navItems.map((item) => {
            const isActive = location.pathname === item.path
            return (
              <Link
                key={item.path}
                to={item.path}
                style={{
                  padding: '8px 12px',
                  borderRadius: 6,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  fontSize: 13,
                  fontWeight: isActive ? 500 : 400,
                  color: isActive ? '#e8e9f0' : '#8b8fa8',
                  background: isActive ? 'rgba(124,106,247,0.15)' : 'transparent',
                  textDecoration: 'none',
                  transition: 'all 0.15s',
                  cursor: 'pointer'
                }}
                onMouseEnter={e => {
                  if (!isActive) {
                    e.currentTarget.style.background = '#1e2130'
                    e.currentTarget.style.color = '#e8e9f0'
                  }
                }}
                onMouseLeave={e => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'transparent'
                    e.currentTarget.style.color = '#8b8fa8'
                  }
                }}
              >
                <span style={{ display: 'flex', alignItems: 'center' }}>{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>
      </div>

      {/* Profile section */}
      {profile && (
        <div style={{ padding: '0 8px' }}>
          <SectionLabel text="MY PROFILE" />
          <div style={{ padding: '0 8px' }}>
            <InfoCard label="GOAL" value={goalLabels[profile.primary_goal] || profile.primary_goal} />
            <InfoCard label="FITNESS LEVEL" value={fitnessLabels[profile.fitness_level] || profile.fitness_level} />
          </div>

          {/* Stats section */}
          <SectionLabel text="STATS" />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, padding: '0 8px' }}>
            <div style={{ background: '#1a1d27', border: '1px solid #2a2d3e', borderRadius: 8, padding: '8px 10px' }}>
              <p style={{ fontSize: 9, color: '#4a4d62', fontWeight: 600, letterSpacing: '0.8px', textTransform: 'uppercase', marginBottom: 3 }}>WEIGHT</p>
              <p style={{ fontSize: 18, fontWeight: 700, color: '#e8e9f0', lineHeight: 1 }}>
                {profile.current_weight_kg || '-'}<span style={{ fontSize: 10, color: '#8b8fa8', fontWeight: 400, marginLeft: 2 }}>kg</span>
              </p>
            </div>
            <div style={{ background: '#1a1d27', border: '1px solid #2a2d3e', borderRadius: 8, padding: '8px 10px' }}>
              <p style={{ fontSize: 9, color: '#4a4d62', fontWeight: 600, letterSpacing: '0.8px', textTransform: 'uppercase', marginBottom: 3 }}>HEIGHT</p>
              <p style={{ fontSize: 18, fontWeight: 700, color: '#e8e9f0', lineHeight: 1 }}>
                {profile.height_cm || '-'}<span style={{ fontSize: 10, color: '#8b8fa8', fontWeight: 400, marginLeft: 2 }}>cm</span>
              </p>
            </div>
            <div style={{ background: '#1a1d27', border: '1px solid #2a2d3e', borderRadius: 8, padding: '8px 10px', gridColumn: 'span 2' }}>
              <p style={{ fontSize: 9, color: '#4a4d62', fontWeight: 600, letterSpacing: '0.8px', textTransform: 'uppercase', marginBottom: 3 }}>AGE</p>
              <p style={{ fontSize: 18, fontWeight: 700, color: '#e8e9f0', lineHeight: 1 }}>
                {profile.age || '-'}<span style={{ fontSize: 10, color: '#8b8fa8', fontWeight: 400, marginLeft: 2 }}>y</span>
              </p>
            </div>
          </div>

          {/* Equipment section */}
          {profile.available_equipment && profile.available_equipment.length > 0 && (
            <>
              <SectionLabel text="EQUIPMENT" />
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, padding: '0 16px' }}>
                {profile.available_equipment.map((eq, i) => (
                  <span key={i} style={{
                    background: 'rgba(124,106,247,0.08)',
                    border: '1px solid rgba(124,106,247,0.2)',
                    color: '#a89cf7',
                    borderRadius: 20,
                    padding: '3px 9px',
                    fontSize: 11,
                    textTransform: 'capitalize'
                  }}>
                    {eq.replace('_', ' ')}
                  </span>
                ))}
              </div>
            </>
          )}

          {/* Schedule section */}
          {profile.workout_days_per_week !== undefined && (
            <>
              <SectionLabel text="SCHEDULE" />
              <div style={{ padding: '0 16px' }}>
                <div style={{ display: 'flex', gap: 5 }}>
                  {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => {
                    const isActive = i < profile.workout_days_per_week
                    return (
                      <div
                        key={i}
                        style={{
                          width: 24,
                          height: 24,
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 9,
                          fontWeight: 600,
                          background: isActive ? '#7c6af7' : '#1e2130',
                          border: isActive ? 'none' : '1px solid #2a2d3e',
                          color: isActive ? 'white' : '#4a4d62',
                        }}
                      >
                        {day}
                      </div>
                    )
                  })}
                </div>
                <p style={{ fontSize: 11, color: '#8b8fa8', marginTop: 6 }}>{profile.workout_days_per_week} days/week</p>
              </div>
            </>
          )}

          {/* Last session section */}
          {profile.last_workout_summary && (
            <>
              <SectionLabel text="LAST SESSION" />
              <div style={{ padding: '0 16px 16px' }}>
                <div style={{
                  background: '#1a1d27',
                  border: '1px solid #2a2d3e',
                  borderRadius: 6,
                  padding: '8px 10px',
                  fontSize: 12,
                  color: '#8b8fa8',
                  lineHeight: 1.5
                }}>
                  {profile.last_workout_summary}
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* Bottom user row */}
      <div style={{
        marginTop: 'auto',
        borderTop: '1px solid #2a2d3e',
        padding: '12px 14px',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        background: '#0f1117',
        flexShrink: 0
      }}>
        <div style={{
          width: 32,
          height: 32,
          borderRadius: '50%',
          background: '#7c6af7',
          color: 'white',
          fontSize: 13,
          fontWeight: 700,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0
        }}>
          {userInitial}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: 13, fontWeight: 500, color: '#e8e9f0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', margin: 0 }}>
            {user?.full_name || 'User'}
          </p>
          <p style={{ fontSize: 11, color: '#8b8fa8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', margin: 0 }}>
            {user?.email || ''}
          </p>
        </div>
        <button
          onClick={handleLogout}
          title="Sign out"
          style={{
            background: 'transparent',
            border: 'none',
            color: '#4a4d62',
            cursor: 'pointer',
            padding: 0,
            display: 'flex',
            alignItems: 'center',
            transition: 'color 0.15s'
          }}
          onMouseEnter={e => e.currentTarget.style.color = '#ef4444'}
          onMouseLeave={e => e.currentTarget.style.color = '#4a4d62'}
        >
          <LogOut size={16} />
        </button>
      </div>
    </aside>
  )
}
