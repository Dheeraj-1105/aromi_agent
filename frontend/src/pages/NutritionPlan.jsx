import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import apiClient from '../api/client'

export default function NutritionPlan() {
  const navigate = useNavigate()

  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: () => apiClient.get('/profile').then((r) => r.data),
  })

  const getCalculatedMacros = () => {
    if (!profile) return { calories: 2000, protein: 120, carbs: 220, fat: 65, bmr: 1500, tdee: 2000 }

    const weight = profile.current_weight_kg || 70
    const height = profile.height_cm || 170
    const age = profile.age || 30
    const gender = profile.gender || 'female'
    const goal = profile.primary_goal || 'general_fitness'

    let bmr = (10 * weight) + (6.25 * height) - (5 * age)
    if (gender === 'male') { bmr += 5 } else { bmr -= 161 }

    let activityMultiplier = 1.55
    if (profile.workout_days_per_week <= 2) activityMultiplier = 1.375
    else if (profile.workout_days_per_week >= 5) activityMultiplier = 1.725

    const tdee = Math.round(bmr * activityMultiplier)

    let calorieGoal = tdee
    if (goal === 'lose_weight') calorieGoal -= 500
    else if (goal === 'build_muscle') calorieGoal += 300

    let proteinPct = 0.3, carbsPct = 0.45, fatPct = 0.25
    if (goal === 'build_muscle') { proteinPct = 0.35; carbsPct = 0.45; fatPct = 0.20 }
    else if (goal === 'lose_weight') { proteinPct = 0.40; carbsPct = 0.35; fatPct = 0.25 }

    const protein_g = Math.round((calorieGoal * proteinPct) / 4)
    const carbs_g = Math.round((calorieGoal * carbsPct) / 4)
    const fat_g = Math.round((calorieGoal * fatPct) / 9)

    return { calories: calorieGoal, protein: protein_g, carbs: carbs_g, fat: fat_g, bmr: Math.round(bmr), tdee }
  }

  const targets = getCalculatedMacros()
  const hasMealPlan = !!profile?.current_week_plan || !!profile?.last_workout_summary

  const getMeals = () => {
    const goal = profile?.primary_goal || 'general_fitness'

    if (goal === 'build_muscle') {
      return [
        { name: 'Breakfast', time: '7:30 AM', items: '3 Scrambled Eggs, 2 slices Whole Wheat Toast, 1 Banana, Coffee', kcal: 480, protein: 32 },
        { name: 'Lunch', time: '1:00 PM', items: 'Grilled Chicken Breast (150g), Brown Rice (150g), Broccoli (100g), Olive Oil', kcal: 650, protein: 52 },
        { name: 'Snack', time: '4:30 PM', items: 'Whey Protein Shake (1 scoop), Almonds (30g), Greek Yogurt (150g)', kcal: 380, protein: 35 },
        { name: 'Dinner', time: '7:30 PM', items: 'Baked Salmon (180g), Sweet Potato (150g), Asparagus, Mixed Greens', kcal: 620, protein: 45 },
      ]
    } else if (goal === 'lose_weight') {
      return [
        { name: 'Breakfast', time: '8:00 AM', items: 'Greek Yogurt (200g) with Blueberries, Chia Seeds, and a drizzle of Honey', kcal: 310, protein: 24 },
        { name: 'Lunch', time: '1:30 PM', items: 'Large Tuna Salad wrap (whole wheat) with Avocado, Spinach, Tomato', kcal: 450, protein: 38 },
        { name: 'Snack', time: '5:00 PM', items: 'Apple slices with Peanut Butter (1.5 tbsp)', kcal: 220, protein: 8 },
        { name: 'Dinner', time: '8:00 PM', items: 'Grilled Turkey Patty, Roasted Cauliflower, Spinach Salad with Vinaigrette', kcal: 420, protein: 40 },
      ]
    } else {
      return [
        { name: 'Breakfast', time: '7:30 AM', items: 'Oatmeal (80g) cooked with Milk, Walnuts, and Strawberries', kcal: 410, protein: 16 },
        { name: 'Lunch', time: '1:00 PM', items: 'Lentil Soup (Dal), Basmati Rice (120g), Mixed Veg Sabzi, Raita', kcal: 540, protein: 20 },
        { name: 'Snack', time: '4:30 PM', items: 'Mixed Fruit Bowl, Roasted Chickpeas (50g)', kcal: 210, protein: 8 },
        { name: 'Dinner', time: '7:30 PM', items: 'Paneer Curry (150g), 2 Whole Wheat Chapatis, Cucumber Salad', kcal: 580, protein: 25 },
      ]
    }
  }

  const meals = getMeals()

  const handleGenerate = () => {
    navigate('/chat', { state: { autoSendMessage: 'Generate my meal plan for today' } })
  }

  const handleEditMeal = (mealName, mealItems) => {
    const msg = `Adjust my ${mealName} — ${mealItems}`
    localStorage.setItem('prefillMessage', msg)
    navigate('/chat')
  }

  if (isLoading) {
    return (
      <>
        <div style={{ padding: '28px 32px', color: '#8b8fa8' }}>Loading nutrition stats...</div>
      </>
    )
  }

  const StatCard = ({ icon, label, value, unit, sub }) => (
    <div style={{ background: '#1a1d27', border: '1px solid #2a2d3e', borderRadius: 8, padding: 16 }}>
      <div style={{ fontSize: 20, marginBottom: 8 }}>{icon}</div>
      <p style={{ fontSize: 10, color: '#4a4d62', letterSpacing: '0.8px', textTransform: 'uppercase', fontWeight: 600, marginBottom: 6 }}>{label}</p>
      <p style={{ fontSize: 28, fontWeight: 700, color: '#e8e9f0', lineHeight: 1 }}>
        {value}<span style={{ fontSize: 12, color: '#8b8fa8', fontWeight: 400, marginLeft: 4 }}>{unit}</span>
      </p>
      {sub && <p style={{ fontSize: 12, color: '#8b8fa8', marginTop: 4 }}>{sub}</p>}
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
        <div style={{ marginBottom: 24, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div>
            <h2 style={{ fontSize: 22, fontWeight: 600, color: '#e8e9f0', lineHeight: 1.2 }}>Your Nutrition Plan</h2>
            <p style={{ fontSize: 13, color: '#8b8fa8', marginTop: 4 }}>Personalized caloric & macronutrient targets</p>
          </div>
          {hasMealPlan && (
            <button
              onClick={handleGenerate}
              style={{
                background: '#7c6af7', color: 'white', border: 'none',
                padding: '9px 18px', borderRadius: 7, fontSize: 13, fontWeight: 500,
                cursor: 'pointer', whiteSpace: 'nowrap', transition: 'background 0.15s',
              }}
              onMouseEnter={e => e.currentTarget.style.background = '#6b5ce7'}
              onMouseLeave={e => e.currentTarget.style.background = '#7c6af7'}
            >
              Generate Meal Plan
            </button>
          )}
        </div>

        {/* Macro stat cards — 4 columns */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 20 }}>
          <StatCard icon="🔥" label="Calories" value={targets.calories} unit="kcal" sub="Daily energy budget" />
          <StatCard icon="🥩" label="Protein" value={targets.protein} unit="g" sub="Muscle building & repair" />
          <StatCard icon="🌾" label="Carbs" value={targets.carbs} unit="g" sub="Primary energy source" />
          <StatCard icon="🧈" label="Fat" value={targets.fat} unit="g" sub="Hormones & cellular health" />
        </div>

        {/* Macro distribution bars */}
        <div style={{ background: '#1a1d27', border: '1px solid #2a2d3e', borderRadius: 8, padding: '18px 20px', marginBottom: 20 }}>
          <h4 style={{ fontSize: 14, fontWeight: 600, color: '#e8e9f0', marginBottom: 16 }}>Macro Distribution Targets</h4>

          {[
            { name: `Protein (${targets.protein}g)`, pct: Math.round((targets.protein * 4 / targets.calories) * 100), color: '#7c6af7' },
            { name: `Carbohydrates (${targets.carbs}g)`, pct: Math.round((targets.carbs * 4 / targets.calories) * 100), color: '#22c55e' },
            { name: `Fat (${targets.fat}g)`, pct: Math.round((targets.fat * 9 / targets.calories) * 100), color: '#f59e0b' },
          ].map(bar => (
            <div key={bar.name} style={{ marginBottom: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: 13, color: '#e8e9f0' }}>{bar.name}</span>
                <span style={{ fontSize: 13, color: '#8b8fa8' }}>{bar.pct}%</span>
              </div>
              <div style={{ height: 6, background: '#0f1117', borderRadius: 3 }}>
                <div style={{ height: '100%', borderRadius: 3, background: bar.color, width: `${bar.pct}%` }} />
              </div>
            </div>
          ))}
        </div>

        {/* Meal cards */}
        {!hasMealPlan ? (
          <div style={{
            background: '#1a1d27', border: '1px solid #2a2d3e', borderRadius: 8,
            padding: 32, textAlign: 'center', display: 'flex', flexDirection: 'column',
            alignItems: 'center', maxWidth: 480, gap: 12,
          }}>
            <div style={{ fontSize: 40 }}>🍎</div>
            <h3 style={{ fontSize: 15, fontWeight: 600, color: '#e8e9f0' }}>No Meal Plan Generated</h3>
            <p style={{ fontSize: 13, color: '#8b8fa8', lineHeight: 1.6 }}>
              Ask AroMi to generate a fully customized meal plan matching your diet restrictions and fitness goals.
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
              Generate my meal plan for today
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
            {meals.map((meal) => (
              <div key={meal.name} style={{
                background: '#1a1d27', border: '1px solid #2a2d3e',
                borderRadius: 8, padding: 16, minHeight: 160,
                display: 'flex', flexDirection: 'column',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                  <h5 style={{ fontSize: 15, fontWeight: 600, color: '#e8e9f0' }}>{meal.name}</h5>
                  <button
                    onClick={() => handleEditMeal(meal.name, meal.items)}
                    style={{
                      fontSize: 11, color: '#8b8fa8',
                      border: '1px solid #2a2d3e', borderRadius: 4,
                      padding: '3px 9px', background: 'transparent', cursor: 'pointer',
                      transition: 'all 0.15s',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = '#7c6af7'; e.currentTarget.style.color = '#a89cf7' }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = '#2a2d3e'; e.currentTarget.style.color = '#8b8fa8' }}
                  >Adjust</button>
                </div>
                <p style={{ fontSize: 12, color: '#8b8fa8', marginBottom: 10 }}>{meal.time}</p>
                <p style={{ fontSize: 13, color: '#e8e9f0', lineHeight: 1.5, flex: 1 }}>{meal.items}</p>
                <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                  <span style={{
                    background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)',
                    color: '#fca5a5', borderRadius: 20, padding: '3px 10px',
                    fontSize: 11, fontWeight: 600,
                  }}>{meal.kcal} kcal</span>
                  <span style={{
                    background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)',
                    color: '#86efac', borderRadius: 20, padding: '3px 10px',
                    fontSize: 11, fontWeight: 600,
                  }}>{meal.protein}g protein</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
