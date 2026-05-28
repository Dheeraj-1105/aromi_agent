import { useQuery } from '@tanstack/react-query'
import apiClient from '../api/client'

export default function ProgressSidebar() {
  const { data: profile, isLoading, error } = useQuery({
    queryKey: ['profile'],
    queryFn: () => apiClient.get('/profile').then((r) => r.data),
    refetchInterval: 30000,
  })

  const { data: progress } = useQuery({
    queryKey: ['progress'],
    queryFn: () => apiClient.get('/progress').then((r) => r.data),
    refetchInterval: 30000,
  })

  if (isLoading) {
    return (
      <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ height: 48, background: '#1a1d27', border: '1px solid #2a2d3e', borderRadius: 8, opacity: 0.5 }} />
        <div style={{ height: 48, background: '#1a1d27', border: '1px solid #2a2d3e', borderRadius: 8, opacity: 0.5 }} />
      </div>
    )
  }

  if (error) {
    return <div style={{ padding: 12, textAlign: 'center', fontSize: 12, color: '#4a4d62' }}>Could not load profile</div>
  }

  const goalLabels = {
    lose_weight: '🔥 Lose Weight',
    build_muscle: '💪 Build Muscle',
    endurance: '🏃 Endurance',
    general_fitness: '⭐ General Fitness',
  }

  const fitnessLabels = {
    beginner: '🌱 Beginner',
    intermediate: '🌿 Intermediate',
    advanced: '🌳 Advanced',
  }

  const SectionLabel = ({ text }) => (
    <div style={{ padding: '12px 0 4px', fontSize: 10, fontWeight: 600, color: '#4a4d62', letterSpacing: 1, textTransform: 'uppercase' }}>
      {text}
    </div>
  )

  const InfoCard = ({ label, value }) => (
    <div style={{
      background: 'rgba(124,106,247,0.08)',
      border: '1px solid rgba(124,106,247,0.2)',
      borderRadius: 8, padding: '10px 12px',
    }}>
      <p style={{ fontSize: 10, color: '#4a4d62', fontWeight: 600, letterSpacing: '0.8px', textTransform: 'uppercase', marginBottom: 4 }}>{label}</p>
      <p style={{ fontSize: 13, fontWeight: 600, color: '#e8e9f0', display: 'flex', alignItems: 'center', gap: 6 }}>{value}</p>
    </div>
  )

  return (
    <div style={{ padding: '0 12px', display: 'flex', flexDirection: 'column', gap: 4 }}>

      {/* Profile cards */}
      {(profile?.primary_goal || profile?.fitness_level) && (
        <>
          <SectionLabel text="My Profile" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {profile?.primary_goal && (
              <InfoCard label="Goal" value={goalLabels[profile.primary_goal] || profile.primary_goal} />
            )}
            {profile?.fitness_level && (
              <InfoCard label="Fitness Level" value={fitnessLabels[profile.fitness_level] || profile.fitness_level} />
            )}
          </div>
        </>
      )}

      {/* Stats grid */}
      {(profile?.current_weight_kg || profile?.height_cm || profile?.age) && (
        <>
          <SectionLabel text="Stats" />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
            {profile?.current_weight_kg && (
              <div style={{ background: '#1a1d27', border: '1px solid #2a2d3e', borderRadius: 8, padding: '8px 10px' }}>
                <p style={{ fontSize: 9, color: '#4a4d62', fontWeight: 600, letterSpacing: '0.8px', textTransform: 'uppercase', marginBottom: 3 }}>Weight</p>
                <p style={{ fontSize: 18, fontWeight: 700, color: '#e8e9f0', lineHeight: 1 }}>
                  {profile.current_weight_kg}<span style={{ fontSize: 10, color: '#8b8fa8', fontWeight: 400, marginLeft: 2 }}>kg</span>
                </p>
              </div>
            )}
            {profile?.height_cm && (
              <div style={{ background: '#1a1d27', border: '1px solid #2a2d3e', borderRadius: 8, padding: '8px 10px' }}>
                <p style={{ fontSize: 9, color: '#4a4d62', fontWeight: 600, letterSpacing: '0.8px', textTransform: 'uppercase', marginBottom: 3 }}>Height</p>
                <p style={{ fontSize: 18, fontWeight: 700, color: '#e8e9f0', lineHeight: 1 }}>
                  {profile.height_cm}<span style={{ fontSize: 10, color: '#8b8fa8', fontWeight: 400, marginLeft: 2 }}>cm</span>
                </p>
              </div>
            )}
            {profile?.age && (
              <div style={{ background: '#1a1d27', border: '1px solid #2a2d3e', borderRadius: 8, padding: '8px 10px' }}>
                <p style={{ fontSize: 9, color: '#4a4d62', fontWeight: 600, letterSpacing: '0.8px', textTransform: 'uppercase', marginBottom: 3 }}>Age</p>
                <p style={{ fontSize: 18, fontWeight: 700, color: '#e8e9f0', lineHeight: 1 }}>
                  {profile.age}<span style={{ fontSize: 10, color: '#8b8fa8', fontWeight: 400, marginLeft: 2 }}>y</span>
                </p>
              </div>
            )}
            {profile?.daily_calorie_target && (
              <div style={{ background: '#1a1d27', border: '1px solid #2a2d3e', borderRadius: 8, padding: '8px 10px' }}>
                <p style={{ fontSize: 9, color: '#4a4d62', fontWeight: 600, letterSpacing: '0.8px', textTransform: 'uppercase', marginBottom: 3 }}>Calorie Goal</p>
                <p style={{ fontSize: 16, fontWeight: 700, color: '#e8e9f0', lineHeight: 1 }}>
                  {profile.daily_calorie_target}<span style={{ fontSize: 9, color: '#8b8fa8', fontWeight: 400, marginLeft: 2 }}>kcal</span>
                </p>
              </div>
            )}
          </div>
        </>
      )}

      {/* Equipment */}
      {profile?.available_equipment?.length > 0 && (
        <>
          <SectionLabel text="Equipment" />
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
            {profile.available_equipment.map((eq) => (
              <span key={eq} style={{
                background: 'rgba(124,106,247,0.08)',
                border: '1px solid rgba(124,106,247,0.2)',
                color: '#a89cf7', borderRadius: 20,
                padding: '3px 9px', fontSize: 11, fontWeight: 500,
                textTransform: 'capitalize',
              }}>
                {eq.replace('_', ' ')}
              </span>
            ))}
          </div>
        </>
      )}

      {/* Schedule */}
      {profile?.workout_days_per_week && (
        <>
          <SectionLabel text="Schedule" />
          <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
            {Array.from({ length: 7 }).map((_, i) => {
              const isActive = i < profile.workout_days_per_week
              return (
                <div
                  key={i}
                  title={['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i]}
                  style={{
                    width: 24, height: 24, borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 9, fontWeight: 600,
                    background: isActive ? '#7c6af7' : '#1e2130',
                    color: isActive ? 'white' : '#4a4d62',
                    border: isActive ? 'none' : '1px solid #2a2d3e',
                  }}
                >
                  {['M', 'T', 'W', 'T', 'F', 'S', 'S'][i]}
                </div>
              )
            })}
          </div>
          <p style={{ fontSize: 11, color: '#8b8fa8', marginTop: 2 }}>{profile.workout_days_per_week} days/week</p>
        </>
      )}

      {/* Last session */}
      {profile?.last_workout_summary && (
        <>
          <SectionLabel text="Last Session" />
          <div style={{
            fontSize: 12, color: '#8b8fa8',
            background: '#1a1d27', border: '1px solid #2a2d3e',
            borderRadius: 6, padding: '8px 10px',
            lineHeight: 1.5, marginBottom: 8,
          }}>
            {profile.last_workout_summary}
          </div>
        </>
      )}
    </div>
  )
}
