import { useState, useEffect } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { Settings as SettingsIcon, User, ShieldAlert, LogOut, Check } from 'lucide-react'
import apiClient from '../api/client'
import useAuth from '../store/useAuth'

export default function Settings() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { user, logout } = useAuth()

  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: () => apiClient.get('/profile').then((r) => r.data),
  })

  // Form states
  const [fullName, setFullName] = useState('')
  const [age, setAge] = useState('')
  const [gender, setGender] = useState('')
  const [height, setHeight] = useState('')
  const [currentWeight, setCurrentWeight] = useState('')
  const [targetWeight, setTargetWeight] = useState('')
  const [primaryGoal, setPrimaryGoal] = useState('')
  const [fitnessLevel, setFitnessLevel] = useState('')
  const [availableEquipment, setAvailableEquipment] = useState([])
  const [workoutDays, setWorkoutDays] = useState(3)
  const [preferredDuration, setPreferredDuration] = useState(45)
  const [dietaryRestrictions, setDietaryRestrictions] = useState('')
  const [injuries, setInjuries] = useState('')

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  // Sync profile data to local state
  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || user?.full_name || '')
      setAge(profile.age || '')
      setGender(profile.gender || '')
      setHeight(profile.height_cm || '')
      setCurrentWeight(profile.current_weight_kg || '')
      setTargetWeight(profile.target_weight_kg || '')
      setPrimaryGoal(profile.primary_goal || '')
      setFitnessLevel(profile.fitness_level || '')
      setAvailableEquipment(profile.available_equipment || [])
      setWorkoutDays(profile.workout_days_per_week || 3)
      setPreferredDuration(profile.preferred_workout_duration_min || 45)
      setDietaryRestrictions(profile.dietary_restrictions || '')
      setInjuries(profile.injuries_or_conditions || '')
    }
  }, [profile, user])

  const handleEquipmentToggle = (eq) => {
    setAvailableEquipment((prev) =>
      prev.includes(eq) ? prev.filter((item) => item !== eq) : [...prev, eq]
    )
  }

  const handleLogout = () => {
    logout()
    window.location.href = '/'
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    setErrorMsg('')
    setSaveSuccess(false)

    try {
      const payload = {
        full_name: fullName,
        age: age ? parseInt(age) : null,
        gender: gender || null,
        height_cm: height ? parseFloat(height) : null,
        current_weight_kg: currentWeight ? parseFloat(currentWeight) : null,
        target_weight_kg: targetWeight ? parseFloat(targetWeight) : null,
        primary_goal: primaryGoal || null,
        fitness_level: fitnessLevel || null,
        available_equipment: availableEquipment,
        workout_days_per_week: parseInt(workoutDays),
        preferred_workout_duration_min: parseInt(preferredDuration),
        dietary_restrictions: dietaryRestrictions || '',
        injuries_or_conditions: injuries || '',
      }

      await apiClient.put('/profile', payload)
      
      // Invalidate queries so sidebar updates immediately
      queryClient.invalidateQueries({ queryKey: ['profile'] })
      
      // If full name changed, update auth store local state
      if (user) {
        useAuth.setState({ user: { ...user, full_name: fullName } })
      }

      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 3000)
    } catch (err) {
      setErrorMsg(err.response?.data?.detail || 'Failed to update profile. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <>
        <div className="loading-container">
          <div className="spinner" />
          <p>Loading settings...</p>
        </div>
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
      <div style={{ padding: '28px 32px', maxWidth: 1200, color: '#e8e9f0' }}>
        {/* Title */}
        <div style={{ marginBottom: 24 }}>
          <h2 style={{ fontSize: 22, fontWeight: 600, color: '#e8e9f0', lineHeight: 1.2 }}>Settings</h2>
          <p style={{ fontSize: 13, color: '#8b8fa8', marginTop: 4 }}>Manage your profile, goals, and account settings</p>
        </div>

        <form onSubmit={handleSave} style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 20, alignItems: 'start' }}>
          {/* Left Column: Profile Details */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {/* Profile Stats Card */}
            <div style={{ background: '#1a1d27', border: '1px solid #2a2d3e', borderRadius: 8, padding: '20px 22px', marginBottom: 16 }}>
              <h3 className="card-section-title">
                <User size={18} />
                <span>Profile Details</span>
              </h3>

              <div className="form-inputs-grid">
                <div className="form-group span-2">
                  <label className="input-label" htmlFor="settings-name">Full Name</label>
                  <input
                    id="settings-name"
                    type="text"
                    className="form-input"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="input-label" htmlFor="settings-age">Age (years)</label>
                  <input
                    id="settings-age"
                    type="number"
                    className="form-input"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    min="13"
                    max="100"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="input-label" htmlFor="settings-gender">Gender</label>
                  <select
                    id="settings-gender"
                    className="form-input select-input"
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    required
                  >
                    <option value="">Select...</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="non-binary">Non-binary</option>
                    <option value="prefer_not_to_say">Prefer not to say</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="input-label" htmlFor="settings-height">Height (cm)</label>
                  <input
                    id="settings-height"
                    type="number"
                    className="form-input"
                    value={height}
                    onChange={(e) => setHeight(e.target.value)}
                    step="0.1"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="input-label" htmlFor="settings-weight">Weight (kg)</label>
                  <input
                    id="settings-weight"
                    type="number"
                    className="form-input"
                    value={currentWeight}
                    onChange={(e) => setCurrentWeight(e.target.value)}
                    step="0.1"
                    required
                  />
                </div>

                <div className="form-group span-2">
                  <label className="input-label" htmlFor="settings-target">Target Weight (kg)</label>
                  <input
                    id="settings-target"
                    type="number"
                    className="form-input"
                    value={targetWeight}
                    onChange={(e) => setTargetWeight(e.target.value)}
                    step="0.1"
                  />
                </div>
              </div>
            </div>

            {/* Primary Goal Selector */}
            <div style={{ background: '#1a1d27', border: '1px solid #2a2d3e', borderRadius: 8, padding: '20px 22px', marginBottom: 16 }}>
              <h3 className="card-section-title">Goal & Fitness Background</h3>
              
              <div className="form-group">
                <label className="input-label">Primary Goal</label>
                <div className="goal-grid">
                  {[
                    { value: 'lose_weight', label: 'Lose Weight', emoji: '🔥', desc: 'Burn fat & get lean' },
                    { value: 'build_muscle', label: 'Build Muscle', emoji: '💪', desc: 'Gain strength & size' },
                    { value: 'endurance', label: 'Endurance', emoji: '🏃', desc: 'Conditioning & stamina' },
                    { value: 'general_fitness', label: 'Stay Fit', emoji: '⭐', desc: 'Overall health & energy' },
                  ].map((goal) => (
                    <div
                      key={goal.value}
                      className={`goal-card ${primaryGoal === goal.value ? 'selected' : ''}`}
                      onClick={() => setPrimaryGoal(goal.value)}
                    >
                      <span className="goal-emoji">{goal.emoji}</span>
                      <span className="goal-label">{goal.label}</span>
                      <span className="goal-desc">{goal.desc}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="form-group" style={{ marginTop: '20px' }}>
                <label className="input-label">Fitness Level</label>
                <div className="fitness-level-row">
                  {[
                    { value: 'beginner', label: 'Beginner', emoji: '🌱' },
                    { value: 'intermediate', label: 'Intermediate', emoji: '🌿' },
                    { value: 'advanced', label: 'Advanced', emoji: '🌳' },
                  ].map((level) => (
                    <div
                      key={level.value}
                      className={`level-pill ${fitnessLevel === level.value ? 'selected' : ''}`}
                      onClick={() => setFitnessLevel(level.value)}
                    >
                      <span>{level.emoji}</span>
                      <span>{level.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Schedule & Preferences */}
            <div style={{ background: '#1a1d27', border: '1px solid #2a2d3e', borderRadius: 8, padding: '20px 22px', marginBottom: 16 }}>
              <h3 className="card-section-title">Schedule & Preferences</h3>
              
              <div className="form-group">
                <div className="slider-label-row">
                  <label className="input-label">Workout Days Per Week</label>
                  <span className="slider-value-badge">{workoutDays} days</span>
                </div>
                <input
                  type="range"
                  min="2"
                  max="6"
                  className="form-slider"
                  value={workoutDays}
                  onChange={(e) => setWorkoutDays(parseInt(e.target.value))}
                />
              </div>

              <div className="form-group" style={{ marginTop: '20px' }}>
                <label className="input-label" htmlFor="settings-duration">Preferred Duration (minutes)</label>
                <select
                  id="settings-duration"
                  className="form-input select-input"
                  value={preferredDuration}
                  onChange={(e) => setPreferredDuration(parseInt(e.target.value))}
                >
                  {[20, 30, 45, 60, 75, 90].map((n) => (
                    <option key={n} value={n}>{n} minutes</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Save Buttons & Status Messages */}
            <div className="save-status-row">
              {errorMsg && (
                <div className="error-banner">
                  <span>⚠️ {errorMsg}</span>
                </div>
              )}
              {saveSuccess && (
                <div className="success-banner">
                  <Check size={16} />
                  <span>Changes saved successfully!</span>
                </div>
              )}

              <button type="submit" className="save-changes-btn" disabled={isSubmitting}>
                {isSubmitting ? 'Saving changes...' : 'Save Changes'}
              </button>
            </div>
          </div>

          {/* Right Column: Equipment, Diet & Account */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {/* Equipment Card */}
            <div style={{ background: '#1a1d27', border: '1px solid #2a2d3e', borderRadius: 8, padding: '20px 22px', marginBottom: 16 }}>
              <h3 className="card-section-title">Available Equipment</h3>
              <p className="card-section-subtitle">Select what you have access to</p>
              
              <div className="equipment-checkboxes">
                {[
                  { value: 'bodyweight', label: 'Bodyweight Only' },
                  { value: 'dumbbells', label: 'Dumbbells' },
                  { value: 'barbell', label: 'Barbell' },
                  { value: 'resistance_bands', label: 'Resistance Bands' },
                  { value: 'kettlebells', label: 'Kettlebells' },
                  { value: 'pull_up_bar', label: 'Pull Up Bar' },
                  { value: 'gym', label: 'Full Gym Access' },
                ].map((eq) => (
                  <label key={eq.value} className="checkbox-label">
                    <input
                      type="checkbox"
                      className="form-checkbox"
                      checked={availableEquipment.includes(eq.value)}
                      onChange={() => handleEquipmentToggle(eq.value)}
                    />
                    <span className="checkbox-text">{eq.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Health & Diet Restrictions */}
            <div style={{ background: '#1a1d27', border: '1px solid #2a2d3e', borderRadius: 8, padding: '20px 22px', marginBottom: 16 }}>
              <h3 className="card-section-title">Diet & Injuries</h3>
              
              <div className="form-group">
                <label className="input-label" htmlFor="settings-diet">Dietary Restrictions</label>
                <input
                  id="settings-diet"
                  type="text"
                  className="form-input"
                  placeholder="e.g. vegetarian, gluten-free, no peanuts"
                  value={dietaryRestrictions}
                  onChange={(e) => setDietaryRestrictions(e.target.value)}
                />
              </div>

              <div className="form-group" style={{ marginTop: '16px' }}>
                <label className="input-label" htmlFor="settings-injuries">Injuries or Conditions</label>
                <input
                  id="settings-injuries"
                  type="text"
                  className="form-input"
                  placeholder="e.g. lower back pain, knee injury"
                  value={injuries}
                  onChange={(e) => setInjuries(e.target.value)}
                />
              </div>
            </div>

            {/* Account Info */}
            <div style={{ background: '#1a1d27', border: '1px solid #2a2d3e', borderRadius: 8, padding: '20px 22px', marginBottom: 16 }}>
              <h3 className="card-section-title">Account Details</h3>
              <div className="form-group">
                <label className="input-label">Email Address</label>
                <input
                  type="text"
                  className="form-input disabled-input"
                  value={user?.email || ''}
                  disabled
                  readOnly
                />
                <p className="input-tip">Email address cannot be changed</p>
              </div>
            </div>
            {/* Danger Zone */}
            <div style={{ background: 'rgba(239,68,68,0.02)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 8, padding: '20px 22px', marginBottom: 16 }}>
              <h3 className="card-section-title danger-text">
                <ShieldAlert size={18} />
                <span>Danger Zone</span>
              </h3>
              <p className="danger-desc">Log out of your session on this device.</p>
              <button type="button" className="danger-action-btn" onClick={handleLogout}>
                <LogOut size={14} />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </form>
      </div>

      <style>{`
        .settings-container {
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 24px;
          height: 100%;
          overflow-y: auto;
          background: #0f1117;
          color: #e8e9f0;
        }

        .page-heading {
          font-size: 22px;
          font-weight: 600;
          color: #e8e9f0;
        }

        .page-subheading {
          font-size: 13px;
          color: #8b8fa8;
          margin-top: 4px;
        }

        .settings-form-layout {
          display: grid;
          grid-template-columns: 3fr 2fr;
          gap: 24px;
          align-items: start;
        }

        @media (max-width: 1024px) {
          .settings-form-layout {
            grid-template-columns: 1fr;
          }
        }

        .form-main-col, .form-side-col {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .settings-card {
          background: #1a1d27;
          border: 1px solid #2a2d3e;
          border-radius: 8px;
          padding: 20px;
          margin-bottom: 16px;
        }

        .card-section-title {
          font-size: 15px;
          font-weight: 600;
          margin-bottom: 16px;
          display: flex;
          align-items: center;
          gap: 8px;
          color: #e8e9f0;
        }

        .card-section-subtitle {
          font-size: 12px;
          color: #8b8fa8;
          margin-top: -12px;
          margin-bottom: 16px;
        }

        .form-inputs-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .form-group.span-2 {
          grid-column: span 2;
        }

        @media (max-width: 480px) {
          .form-inputs-grid {
            grid-template-columns: 1fr;
          }
          .form-group.span-2 {
            grid-column: span 1;
          }
        }

        .input-label {
          font-size: 12px;
          font-weight: 600;
          color: #8b8fa8;
        }

        .form-input {
          width: 100%;
          background: #0f1117;
          border: 1px solid #2a2d3e;
          border-radius: 6px;
          padding: 10px 14px;
          color: #e8e9f0;
          font-size: 14px;
          transition: border-color 0.15s ease;
          outline: none;
        }

        .form-input:focus {
          border-color: #7c6af7;
        }

        select.form-input {
          appearance: none;
          background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%238b8fa8' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
          background-repeat: no-repeat;
          background-position: right 14px center;
          background-size: 16px;
          padding-right: 40px;
        }

        .disabled-input {
          background: #0f1117;
          border-color: #2a2d3e;
          color: #4a4d62;
          cursor: not-allowed;
        }

        .input-tip {
          font-size: 11px;
          color: #4a4d62;
          margin-top: 2px;
        }

        /* Slider */
        .slider-label-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .slider-value-badge {
          background: rgba(124, 106, 247, 0.15);
          border: 1px solid rgba(124, 106, 247, 0.3);
          color: #a89cf7;
          font-size: 12px;
          font-weight: 600;
          padding: 2px 8px;
          border-radius: 20px;
        }

        .form-slider {
          -webkit-appearance: none;
          width: 100%;
          height: 6px;
          border-radius: 3px;
          background: #0f1117;
          outline: none;
          margin-top: 10px;
        }

        .form-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: #7c6af7;
          cursor: pointer;
          transition: background-color 0.15s;
        }

        .form-slider::-webkit-slider-thumb:hover {
          background: #6b5ce7;
        }

        /* Goal Selection */
        .goal-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }

        @media (max-width: 580px) {
          .goal-grid {
            grid-template-columns: 1fr;
          }
        }

        .goal-card {
          border: 1px solid #2a2d3e;
          border-radius: 8px;
          padding: 16px;
          text-align: center;
          cursor: pointer;
          transition: all 0.15s ease;
          background: #1a1d27;
        }

        .goal-card:hover {
          border-color: #7c6af7;
          background: #1e2130;
        }

        .goal-card.selected {
          border-color: #7c6af7;
          background: rgba(124, 106, 247, 0.08);
        }

        .goal-emoji {
          font-size: 20px;
          display: block;
          margin-bottom: 4px;
        }

        .goal-label {
          font-size: 14px;
          font-weight: 600;
          color: #e8e9f0;
          display: block;
        }

        .goal-desc {
          font-size: 11px;
          color: #8b8fa8;
          display: block;
          margin-top: 2px;
        }

        /* Level Selection */
        .fitness-level-row {
          display: flex;
          gap: 12px;
        }

        .level-pill {
          flex: 1;
          padding: 10px;
          border: 1px solid #2a2d3e;
          border-radius: 6px;
          text-align: center;
          cursor: pointer;
          transition: all 0.15s ease;
          background: #1a1d27;
          font-size: 13px;
          font-weight: 500;
          color: #8b8fa8;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
        }

        .level-pill:hover {
          background: #1e2130;
          color: #e8e9f0;
        }

        .level-pill.selected {
          background: #7c6af7;
          border-color: #7c6af7;
          color: white;
        }

        /* Checkboxes */
        .equipment-checkboxes {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .checkbox-label {
          display: flex;
          align-items: center;
          gap: 10px;
          cursor: pointer;
          font-size: 13px;
          color: #e8e9f0;
        }

        .form-checkbox {
          appearance: none;
          -webkit-appearance: none;
          width: 16px;
          height: 16px;
          border: 1px solid #2a2d3e;
          border-radius: 4px;
          background: #0f1117;
          cursor: pointer;
          position: relative;
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }

        .form-checkbox:checked {
          background: #7c6af7;
          border-color: #7c6af7;
        }

        .form-checkbox:checked::after {
          content: "✓";
          color: white;
          font-size: 11px;
          font-weight: bold;
        }

        /* Save & Status Row */
        .save-status-row {
          display: flex;
          flex-direction: column;
          gap: 12px;
          align-items: flex-end;
          margin-top: 10px;
        }

        .save-changes-btn {
          background: #7c6af7;
          color: white;
          border: none;
          padding: 10px 24px;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: background 0.15s ease;
        }

        .save-changes-btn:hover:not(:disabled) {
          background: #6b5ce7;
        }

        .save-changes-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .success-banner {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #22c55e;
          background: rgba(34, 197, 94, 0.1);
          border: 1px solid rgba(34, 197, 94, 0.2);
          padding: 8px 16px;
          border-radius: 6px;
          font-size: 13px;
        }

        .error-banner {
          color: #ef4444;
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.2);
          padding: 8px 16px;
          border-radius: 6px;
          font-size: 13px;
        }

        /* Danger Zone */
        .danger-card {
          border-color: rgba(239, 68, 68, 0.3) !important;
          background: rgba(239, 68, 68, 0.03) !important;
        }

        .danger-text {
          color: #ef4444 !important;
        }

        .danger-desc {
          font-size: 12px;
          color: #8b8fa8;
          margin: 0 0 16px;
          line-height: 1.5;
        }

        .danger-action-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          border: 1px solid rgba(239, 68, 68, 0.4);
          background: transparent;
          color: #ef4444;
          border-radius: 6px;
          padding: 8px 20px;
          cursor: pointer;
          transition: background 0.15s ease;
          font-size: 13px;
          font-weight: 500;
        }

        .danger-action-btn:hover {
          background: rgba(239, 68, 68, 0.1);
        }

        .loading-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 300px;
          gap: 12px;
          color: #8b8fa8;
        }

        .spinner {
          width: 32px;
          height: 32px;
          border: 3px solid rgba(255,255,255,0.1);
          border-top-color: #7c6af7;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}
