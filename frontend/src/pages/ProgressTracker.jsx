import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import apiClient from '../api/client'

export default function ProgressTracker() {
  const navigate = useNavigate()

  const { data: progress, isLoading: progressLoading } = useQuery({
    queryKey: ['progress'],
    queryFn: () => apiClient.get('/progress').then((r) => r.data),
    refetchInterval: 30000,
  })

  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: () => apiClient.get('/profile').then((r) => r.data),
  })

  if (progressLoading || profileLoading) {
    return (
      <>
        <div style={{ padding: '28px 32px', color: '#8b8fa8' }}>Loading progress stats...</div>
      </>
    )
  }

  const {
    total_workouts = 0,
    this_week = 0,
    current_streak = 0,
    avg_duration = 0,
    recent_workouts = [],
    weekly_calendar = []
  } = progress || {}

  const totalCaloriesBurned = recent_workouts.reduce((acc, log) => acc + (log.calories_burned || log.duration_min * 8 || 0), 0)

  const currentWeight = profile?.current_weight_kg
  const weightLogs = profile?.weight_logs || []
  const hasWeightData = weightLogs.length >= 2

  const getWeightTrendPoints = () => {
    if (!hasWeightData) return []
    return weightLogs.slice(-5).map((entry, i) => ({
      week: `Wk ${i + 1}`,
      weight: entry.weight_kg ?? entry.weight ?? 0
    }))
  }

  const weightTrend = getWeightTrendPoints()

  const getSvgPath = () => {
    if (weightTrend.length === 0) return ''
    const minW = Math.min(...weightTrend.map(d => d.weight)) - 2
    const maxW = Math.max(...weightTrend.map(d => d.weight)) + 2
    const range = maxW - minW
    const coords = weightTrend.map((d, i) => {
      const x = 50 + i * 75
      const y = 110 - ((d.weight - minW) / range) * 80
      return { x, y }
    })
    return coords.reduce((acc, c, i) => i === 0 ? `M ${c.x} ${c.y}` : `${acc} L ${c.x} ${c.y}`, '')
  }

  const svgLinePath = getSvgPath()

  const handlePromptWeight = () => {
    const msg = `Log my weight today: ${currentWeight || ''}kg`
    localStorage.setItem('prefillMessage', msg)
    navigate('/chat')
  }

  const renderDifficultyCircles = (difficulty) => (
    <div style={{ display: 'flex', gap: 4 }}>
      {Array.from({ length: 5 }).map((_, i) => (
        <span
          key={i}
          style={{
            width: 8, height: 8, borderRadius: '50%',
            backgroundColor: i < Math.round(difficulty / 2) ? '#7c6af7' : '#2a2d3e',
            display: 'inline-block',
          }}
        />
      ))}
    </div>
  )

  const dayNamesShort = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  const todayIndex = (new Date().getDay() + 6) % 7

  const StatCard = ({ icon, label, value, unit, sub }) => (
    <div style={{ background: '#1a1d27', border: '1px solid #2a2d3e', borderRadius: 8, padding: 16 }}>
      <div style={{ fontSize: 20, marginBottom: 8 }}>{icon}</div>
      <p style={{ fontSize: 10, color: '#4a4d62', letterSpacing: '0.8px', textTransform: 'uppercase', fontWeight: 600, marginBottom: 6 }}>{label}</p>
      <p style={{ fontSize: 24, fontWeight: 700, color: '#e8e9f0', lineHeight: 1 }}>
        {value}{unit && <span style={{ fontSize: 13, color: '#8b8fa8', fontWeight: 400, marginLeft: 3 }}>{unit}</span>}
      </p>
      {sub && <p style={{ fontSize: 11, color: '#4a4d62', marginTop: 4 }}>{sub}</p>}
    </div>
  )

  return (
    <div style={{
      height: '100vh',
      overflowY: 'auto',
      overflowX: 'hidden',
      background: '#0f1117',
    }}>
      <div style={{ padding: '28px 32px', maxWidth: 1200 }}>

        {/* Page header */}
        <div style={{ marginBottom: 24 }}>
          <h2 style={{ fontSize: 22, fontWeight: 600, color: '#e8e9f0', lineHeight: 1.2 }}>Progress Tracker</h2>
          <p style={{ fontSize: 13, color: '#8b8fa8', marginTop: 4 }}>Your fitness journey at a glance</p>
        </div>

        {/* Streak banner */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(245,158,11,0.08), rgba(251,146,60,0.04))',
          border: '1px solid rgba(245,158,11,0.2)',
          borderRadius: 8, padding: '16px 20px',
          marginBottom: 20,
          display: 'flex', alignItems: 'center', gap: 16,
        }}>
          <span style={{ fontSize: 28 }}>🔥</span>
          <div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
              <span style={{ fontSize: 26, fontWeight: 700, color: '#f59e0b' }}>{current_streak}</span>
              <span style={{ fontSize: 15, fontWeight: 600, color: '#e8e9f0' }}>Day Workout Streak</span>
            </div>
            <p style={{ fontSize: 12, color: '#8b8fa8', marginTop: 2 }}>
              {current_streak > 0 ? 'You are doing amazing! Keep the momentum going! 🔥' : 'Start logging your workouts to kick off your streak! 💪'}
            </p>
          </div>
        </div>

        {/* Stats row — 4 cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 20 }}>
          <StatCard icon="🏋️" label="Total Workouts" value={total_workouts} sub="Regimes completed" />
          <StatCard icon="📅" label="This Week" value={this_week} sub="Active days logged" />
          <StatCard icon="⏱️" label="Avg Duration" value={avg_duration} unit="min" sub="Time per session" />
          <StatCard icon="🔥" label="Est. Burned" value={totalCaloriesBurned} unit="kcal" sub="Calculated from history" />
        </div>

        {/* Weekly tracker */}
        <div style={{ background: '#1a1d27', border: '1px solid #2a2d3e', borderRadius: 8, padding: '18px 20px', marginBottom: 12 }}>
          <h4 style={{ fontSize: 14, fontWeight: 600, color: '#e8e9f0', marginBottom: 4 }}>Weekly Workouts</h4>
          <p style={{ fontSize: 12, color: '#8b8fa8', marginBottom: 16 }}>Your activity breakdown for current week</p>

          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {weekly_calendar.map((day, idx) => {
              const isCompleted = day.completed
              const isToday = idx === todayIndex
              const isFuture = idx > todayIndex

              let bg = '#1a1d27', border = '1px solid #2a2d3e', color = '#4a4d62'
              if (isCompleted) { bg = '#7c6af7'; border = '1px solid #7c6af7'; color = 'white' }
              else if (isToday) { bg = 'transparent'; border = '2px solid #7c6af7'; color = '#7c6af7' }
              else if (isFuture) { bg = 'transparent'; border = '1px dashed #2a2d3e'; color = '#4a4d62' }

              return (
                <div
                  key={day.date}
                  title={isToday ? 'Today' : isCompleted ? 'Completed' : 'Planned / Rest'}
                  style={{
                    width: 42, height: 42, borderRadius: '50%',
                    display: 'flex', flexDirection: 'column',
                    alignItems: 'center', justifyContent: 'center',
                    gap: 1, background: bg, border, color,
                  }}
                >
                  <span style={{ fontSize: 10, fontWeight: 600 }}>{dayNamesShort[idx][0]}</span>
                  <span style={{ fontSize: 12, fontWeight: 700 }}>{new Date(day.date).getDate()}</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Weight trend */}
        <div style={{ background: '#1a1d27', border: '1px solid #2a2d3e', borderRadius: 8, padding: '18px 20px', marginBottom: 12 }}>
          <h4 style={{ fontSize: 14, fontWeight: 600, color: '#e8e9f0', marginBottom: 12 }}>Weight Trend</h4>
          {!hasWeightData ? (
            <div style={{ padding: '24px 0', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
              <p style={{ fontSize: 14, color: '#4a4d62' }}>📊 Log your weight weekly to see your trend</p>
              <button
                onClick={handlePromptWeight}
                style={{
                  border: '1px solid #2a2d3e', background: '#1a1d27', color: '#8b8fa8',
                  borderRadius: 6, padding: '8px 16px', fontSize: 12, fontWeight: 600, cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = '#7c6af7'; e.currentTarget.style.color = '#e8e9f0' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = '#2a2d3e'; e.currentTarget.style.color = '#8b8fa8' }}
              >
                Log Today's Weight
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', justifyContent: 'center', padding: 8 }}>
              <svg viewBox="0 0 400 130" style={{ width: '100%', maxWidth: 400, overflow: 'visible' }}>
                <line x1="50" y1="30" x2="350" y2="30" stroke="#2a2d3e" strokeWidth="1" />
                <line x1="50" y1="70" x2="350" y2="70" stroke="#2a2d3e" strokeWidth="1" />
                <line x1="50" y1="110" x2="350" y2="110" stroke="#2a2d3e" strokeWidth="1" />
                <path d={svgLinePath} fill="none" stroke="#7c6af7" strokeWidth="2.5" />
                {weightTrend.map((d, i) => {
                  const minW = Math.min(...weightTrend.map(pt => pt.weight)) - 2
                  const maxW = Math.max(...weightTrend.map(pt => pt.weight)) + 2
                  const range = maxW - minW
                  const x = 50 + i * 75
                  const y = 110 - ((d.weight - minW) / range) * 80
                  return (
                    <g key={i}>
                      <circle cx={x} cy={y} r="3.5" fill="#7c6af7" />
                      <text x={x} y={y - 8} textAnchor="middle" fill="#e8e9f0" fontSize="9" fontWeight="600">{d.weight.toFixed(1)}kg</text>
                      <text x={x} y="125" textAnchor="middle" fill="#4a4d62" fontSize="9">{d.week}</text>
                    </g>
                  )
                })}
              </svg>
            </div>
          )}
        </div>

        {/* Recent workouts table */}
        <div style={{ background: '#1a1d27', border: '1px solid #2a2d3e', borderRadius: 8, overflow: 'hidden' }}>
          <div style={{ padding: '10px 16px', background: '#0f1117', borderBottom: '1px solid #2a2d3e' }}>
            <span style={{ fontSize: 10, fontWeight: 600, color: '#4a4d62', textTransform: 'uppercase', letterSpacing: 1 }}>Recent Workouts</span>
          </div>

          {recent_workouts.length === 0 ? (
            <div style={{ padding: 32, textAlign: 'center', color: '#8b8fa8', fontSize: 13 }}>
              No workouts logged yet. Complete a workout and tell AroMi to log it!
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #2a2d3e' }}>
                    {['DATE', 'TYPE', 'DURATION', 'DIFFICULTY', 'NOTES'].map(h => (
                      <th key={h} style={{ padding: '10px 16px', fontSize: 10, textTransform: 'uppercase', color: '#4a4d62', letterSpacing: 1, fontWeight: 600 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {recent_workouts.map((log) => {
                    const dateObj = new Date(log.logged_at)
                    const formattedDate = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                    return (
                      <tr key={log.id} style={{ borderBottom: '1px solid #1f2235' }}>
                        <td style={{ padding: '12px 16px', color: '#e8e9f0', fontWeight: 500 }}>{formattedDate}</td>
                        <td style={{ padding: '12px 16px' }}>
                          <span style={{
                            background: 'rgba(124,106,247,0.1)', border: '1px solid rgba(124,106,247,0.2)',
                            color: '#a89cf7', borderRadius: 20, padding: '2px 9px', fontSize: 11, textTransform: 'capitalize',
                          }}>{log.workout_type}</span>
                        </td>
                        <td style={{ padding: '12px 16px', color: '#e8e9f0' }}>{log.duration_min} min</td>
                        <td style={{ padding: '12px 16px' }}>{renderDifficultyCircles(log.perceived_difficulty)}</td>
                        <td style={{ padding: '12px 16px', color: '#8b8fa8', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{log.notes || '—'}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
