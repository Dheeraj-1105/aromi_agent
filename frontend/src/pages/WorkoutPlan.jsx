import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import apiClient from '../api/client'

export default function WorkoutPlan() {
  const navigate = useNavigate()

  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: () => apiClient.get('/profile').then((r) => r.data),
  })

  const getWeekDays = () => {
    const today = new Date()
    const currentDay = today.getDay()
    const mondayOffset = currentDay === 0 ? -6 : 1 - currentDay
    const monday = new Date(today)
    monday.setDate(today.getDate() + mondayOffset)

    return ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day, idx) => {
      const date = new Date(monday)
      date.setDate(monday.getDate() + idx)
      return {
        name: day,
        dateStr: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        isToday: date.toDateString() === today.toDateString()
      }
    })
  }

  const weekDays = getWeekDays()

  let workoutPlan = null
  if (profile?.current_week_plan) {
    try {
      const parsed = JSON.parse(profile.current_week_plan)
      if (parsed.workout_plan) {
        workoutPlan = parsed.workout_plan
      } else if (parsed.Monday || parsed.monday) {
        workoutPlan = parsed
      }
    } catch (e) {}
  }

  const hasPlan = !!profile?.current_week_plan

  const getFallbackPlan = () => {
    const goal = profile?.primary_goal || 'general_fitness'
    const daysPerWeek = profile?.workout_days_per_week || 3

    const workoutDays = new Set()
    if (daysPerWeek === 1) { workoutDays.add('Wednesday') }
    else if (daysPerWeek === 2) { workoutDays.add('Tuesday').add('Thursday') }
    else if (daysPerWeek === 3) { workoutDays.add('Monday').add('Wednesday').add('Friday') }
    else if (daysPerWeek === 4) { workoutDays.add('Monday').add('Tuesday').add('Thursday').add('Friday') }
    else if (daysPerWeek === 5) { workoutDays.add('Monday').add('Tuesday').add('Wednesday').add('Friday').add('Saturday') }
    else { workoutDays.add('Monday').add('Tuesday').add('Wednesday').add('Thursday').add('Friday').add('Saturday') }

    const plan = {}
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

    days.forEach((day, index) => {
      if (workoutDays.has(day)) {
        let focus = 'Full Body'
        let exercises = []

        if (goal === 'build_muscle') {
          if (day === 'Monday') {
            focus = 'Chest & Triceps'
            exercises = [
              { name: 'Bench Press', sets: 4, reps: '10', muscle: 'chest' },
              { name: 'Incline Dumbbell Press', sets: 3, reps: '12', muscle: 'chest' },
              { name: 'Tricep Pushdown', sets: 3, reps: '12', muscle: 'arms' }
            ]
          } else if (day === 'Wednesday') {
            focus = 'Back & Biceps'
            exercises = [
              { name: 'Deadlift', sets: 3, reps: '8', muscle: 'back' },
              { name: 'Pull-Ups', sets: 4, reps: '8', muscle: 'back' },
              { name: 'Dumbbell Curl', sets: 3, reps: '12', muscle: 'arms' }
            ]
          } else {
            focus = 'Legs & Shoulders'
            exercises = [
              { name: 'Barbell Squat', sets: 4, reps: '8', muscle: 'legs' },
              { name: 'Leg Press', sets: 3, reps: '12', muscle: 'legs' },
              { name: 'Overhead Press', sets: 3, reps: '10', muscle: 'shoulders' }
            ]
          }
        } else if (goal === 'lose_weight') {
          focus = index % 2 === 0 ? 'HIIT & Core' : 'Strength Circuit'
          exercises = [
            { name: 'Jump Squats', sets: 4, reps: '15', muscle: 'legs' },
            { name: 'Kettlebell Swings', sets: 4, reps: '20', muscle: 'fullbody' },
            { name: 'Plank Hold', sets: 3, reps: '45s', muscle: 'core' }
          ]
        } else {
          focus = 'Full Body Conditioning'
          exercises = [
            { name: 'Bodyweight Squats', sets: 3, reps: '15', muscle: 'legs' },
            { name: 'Push-Ups', sets: 3, reps: '12', muscle: 'chest' },
            { name: 'Dumbbell Rows', sets: 3, reps: '12', muscle: 'back' }
          ]
        }

        plan[day] = { type: 'workout', focus, exercises }
      } else {
        plan[day] = {
          type: 'rest',
          tip: index === 6
            ? 'Reflect on your week, prepare your meals, and sleep at least 8 hours.'
            : 'Stay hydrated, light stretching or a 20-minute walk is recommended.'
        }
      }
    })

    return plan
  }

  const activePlan = workoutPlan || (hasPlan ? getFallbackPlan() : null)

  const handleGenerate = () => {
    navigate('/chat', { state: { autoSendMessage: 'Generate my workout plan for this week. Make sure each day targets different muscle groups — no two consecutive days should train the same muscles.' } })
  }

  if (isLoading) {
    return (
      <>
        <div style={{ padding: '28px 32px', color: '#8b8fa8' }}>Loading workout plan...</div>
      </>
    )
  }

  return (
    <div style={{
      height: '100vh',
      overflowY: 'auto',
      overflowX: 'hidden',
      background: '#0f1117',
    }}>
      <div style={{ padding: '28px 32px', maxWidth: 1200 }}>

        {/* Page header */}
        <div style={{ marginBottom: 24, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div>
            <h2 style={{ fontSize: 22, fontWeight: 600, color: '#e8e9f0', lineHeight: 1.2 }}>Your Workout Plan</h2>
            <p style={{ fontSize: 13, color: '#8b8fa8', marginTop: 4 }}>This week's schedule</p>
          </div>
          {hasPlan && (
            <button
              onClick={handleGenerate}
              style={{
                background: '#7c6af7', color: 'white', border: 'none',
                padding: '9px 18px', borderRadius: 7, fontSize: 13, fontWeight: 500,
                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
                whiteSpace: 'nowrap', transition: 'background 0.15s',
              }}
              onMouseEnter={e => e.currentTarget.style.background = '#6b5ce7'}
              onMouseLeave={e => e.currentTarget.style.background = '#7c6af7'}
            >
              Generate New Plan
            </button>
          )}
        </div>

        {/* Grid or empty state */}
        {!hasPlan ? (
          <div style={{
            background: '#1a1d27', border: '1px solid #2a2d3e', borderRadius: 8,
            padding: 32, textAlign: 'center',
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            maxWidth: 480, gap: 12,
          }}>
            <div style={{ fontSize: 40 }}>🏋️</div>
            <h3 style={{ fontSize: 15, fontWeight: 600, color: '#e8e9f0' }}>No Workout Plan Yet</h3>
            <p style={{ fontSize: 13, color: '#8b8fa8', lineHeight: 1.6 }}>
              AroMi creates highly personalized workout plans based on your fitness goals, available equipment, and schedule.
            </p>
            <button
              onClick={handleGenerate}
              style={{
                background: '#7c6af7', color: 'white', border: 'none',
                padding: '10px 20px', borderRadius: 7, fontSize: 13, fontWeight: 600,
                cursor: 'pointer', transition: 'background 0.15s',
              }}
              onMouseEnter={e => e.currentTarget.style.background = '#6b5ce7'}
              onMouseLeave={e => e.currentTarget.style.background = '#7c6af7'}
            >
              Ask AroMi to generate your first plan
            </button>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: 12,
            marginTop: 20,
          }}>
            {weekDays.map((day) => {
              const dayData = activePlan?.[day.name] || activePlan?.[day.name.toLowerCase()]
              const isRest = dayData?.type === 'rest'

              return (
                <div
                  key={day.name}
                  style={{
                    background: '#1a1d27',
                    border: `1px solid ${day.isToday ? '#7c6af7' : '#2a2d3e'}`,
                    borderRadius: 8,
                    padding: 14,
                    minHeight: 140,
                  }}
                >
                  {/* Day header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                    <div>
                      <h4 style={{ fontSize: 14, fontWeight: 600, color: '#e8e9f0' }}>{day.name}</h4>
                      <p style={{ fontSize: 12, color: '#8b8fa8', marginTop: 2 }}>{day.dateStr}</p>
                    </div>
                    {day.isToday && (
                      <span style={{
                        background: '#7c6af7', color: 'white',
                        fontSize: 10, borderRadius: 20, padding: '2px 8px', fontWeight: 700,
                      }}>TODAY</span>
                    )}
                  </div>

                  {isRest ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 80, textAlign: 'center', gap: 6, padding: '6px 0' }}>
                      <span style={{ fontSize: 24 }}>☕</span>
                      <p style={{ fontSize: 13, fontWeight: 600, color: '#8b8fa8' }}>Rest & Recovery</p>
                      <p style={{ fontSize: 11, color: '#4a4d62', lineHeight: 1.4 }}>{dayData?.tip || 'Stay hydrated.'}</p>
                    </div>
                  ) : (
                    <div>
                      {/* Muscle tag */}
                      <span style={{
                        fontSize: 11, fontWeight: 600, color: '#a89cf7',
                        background: 'rgba(124,106,247,0.1)',
                        border: '1px solid rgba(124,106,247,0.2)',
                        borderRadius: 4, padding: '2px 7px',
                        display: 'inline-block', marginBottom: 10,
                        textTransform: 'uppercase', letterSpacing: '0.5px',
                      }}>{dayData?.focus || 'Workout'}</span>

                      {/* Exercise rows */}
                      <div>
                        {(dayData?.exercises || []).map((ex, idx) => (
                          <div key={idx} style={{
                            display: 'flex', justifyContent: 'space-between',
                            alignItems: 'center', padding: '7px 0',
                            borderBottom: idx < (dayData.exercises.length - 1) ? '1px solid #1f2235' : 'none',
                          }}>
                            <div>
                              <p style={{ fontSize: 13, fontWeight: 500, color: '#e8e9f0' }}>{ex.name}</p>
                              <p style={{ fontSize: 11, color: '#8b8fa8', marginTop: 1, textTransform: 'capitalize' }}>{ex.muscle || 'strength'}</p>
                            </div>
                            <span style={{
                              fontSize: 11, color: '#a89cf7',
                              background: '#1a1d27', border: '1px solid #2a2d3e',
                              borderRadius: 20, padding: '2px 8px',
                              whiteSpace: 'nowrap', flexShrink: 0,
                            }}>{ex.sets}×{ex.reps}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {/* Raw text backup — hidden per spec */}
        {/* display: none — intentionally omitted */}
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}
