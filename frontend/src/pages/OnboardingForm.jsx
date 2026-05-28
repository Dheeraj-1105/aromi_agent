import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import apiClient from "../api/client";

const STEPS = [
  { id: "goal", title: "What's your main goal?", emoji: "🎯", sub: "Choose the focus for your personalized plan" },
  { id: "stats", title: "Tell us about yourself", emoji: "📊", sub: "We'll use this to tailor your experience" },
  { id: "fitness", title: "Your fitness background", emoji: "🏋️", sub: "Help us calibrate your starting point" },
  { id: "diet", title: "Dietary preferences", emoji: "🥗", sub: "Almost done — last step!" },
];

const GOALS = [
  { value: "lose_weight", label: "Lose Weight", emoji: "🔥", desc: "Burn fat, feel lighter" },
  { value: "build_muscle", label: "Build Muscle", emoji: "💪", desc: "Gain strength & size" },
  { value: "endurance", label: "Endurance", emoji: "🏃", desc: "Run farther, last longer" },
  { value: "general_fitness", label: "Stay Fit", emoji: "⭐", desc: "Overall health & energy" },
];

const FITNESS_LEVELS = [
  { value: "beginner", label: "Beginner", emoji: "🌱", desc: "New to working out" },
  { value: "intermediate", label: "Intermediate", emoji: "🌿", desc: "1–2 years experience" },
  { value: "advanced", label: "Advanced", emoji: "🌳", desc: "3+ years, consistent" },
];

const EQUIPMENT_LIST = [
  "bodyweight", "dumbbells", "barbell", "resistance_bands",
  "gym", "kettlebells", "pull_up_bar",
];

export default function OnboardingForm() {
  const [step, setStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState("");
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Form state
  const [primaryGoal, setPrimaryGoal] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [heightCm, setHeightCm] = useState("");
  const [currentWeightKg, setCurrentWeightKg] = useState("");
  const [targetWeightKg, setTargetWeightKg] = useState("");
  const [fitnessLevel, setFitnessLevel] = useState("");
  const [equipment, setEquipment] = useState([]);
  const [workoutDays, setWorkoutDays] = useState("3");
  const [workoutDuration, setWorkoutDuration] = useState("45");
  const [injuries, setInjuries] = useState("");
  const [dietaryRestrictions, setDietaryRestrictions] = useState("");

  const [stepError, setStepError] = useState("");

  const toggleEquipment = (eq) => {
    setEquipment((prev) =>
      prev.includes(eq) ? prev.filter((e) => e !== eq) : [...prev, eq]
    );
  };

  const validateStep = () => {
    setStepError("");
    if (step === 0 && !primaryGoal) {
      setStepError("Please select a goal to continue");
      return false;
    }
    if (step === 1) {
      if (!age || !gender || !heightCm || !currentWeightKg) {
        setStepError("Please fill in all required fields");
        return false;
      }
      if (parseInt(age) < 13 || parseInt(age) > 100) {
        setStepError("Age must be between 13 and 100");
        return false;
      }
    }
    if (step === 2 && !fitnessLevel) {
      setStepError("Please select your fitness level");
      return false;
    }
    return true;
  };

  const nextStep = () => {
    if (validateStep()) {
      setStep((s) => Math.min(s + 1, STEPS.length - 1));
    }
  };

  const prevStep = () => {
    setStepError("");
    setStep((s) => Math.max(s - 1, 0));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setServerError("");
    try {
      const payload = {
        primary_goal: primaryGoal,
        age: age ? parseInt(age) : null,
        gender,
        height_cm: heightCm ? parseFloat(heightCm) : null,
        current_weight_kg: currentWeightKg ? parseFloat(currentWeightKg) : null,
        target_weight_kg: targetWeightKg ? parseFloat(targetWeightKg) : null,
        fitness_level: fitnessLevel,
        available_equipment: equipment,
        workout_days_per_week: parseInt(workoutDays),
        preferred_workout_duration_min: parseInt(workoutDuration),
        dietary_restrictions: dietaryRestrictions,
        injuries_or_conditions: injuries,
      };
      await apiClient.put("/profile", payload);
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      navigate("/chat");
    } catch (err) {
      setServerError(
        err.response?.data?.detail || "Failed to save profile. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ─── Inline Styles ─── */

  const wrap = {
    position: "fixed",
    inset: 0,
    background: "#0a0b10",
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "center",
    padding: "20px",
    overflowY: "auto",
    zIndex: 50,
    fontFamily: "'Inter', -apple-system, sans-serif",
  };

  const orb1 = {
    position: "absolute", top: "-140px", right: "-140px",
    width: "420px", height: "420px", borderRadius: "50%",
    background: "radial-gradient(circle, rgba(124,106,247,0.12) 0%, transparent 70%)",
    pointerEvents: "none",
  };

  const orb2 = {
    position: "absolute", bottom: "-100px", left: "-100px",
    width: "350px", height: "350px", borderRadius: "50%",
    background: "radial-gradient(circle, rgba(34,197,94,0.08) 0%, transparent 70%)",
    pointerEvents: "none",
  };

  const center = {
    width: "100%", maxWidth: "520px",
    position: "relative", zIndex: 1,
  };

  const logoBox = {
    width: "58px", height: "58px", borderRadius: "16px",
    background: "#13151e",
    border: "1px solid rgba(124,106,247,0.35)",
    display: "flex", alignItems: "center", justifyContent: "center",
    margin: "0 auto 12px",
    boxShadow: "0 0 32px rgba(124,106,247,0.14)",
  };

  const ring = {
    width: "26px", height: "26px", borderRadius: "50%",
    border: "2.5px solid #7c6af7",
    display: "flex", alignItems: "center", justifyContent: "center",
  };

  const dot = {
    width: "8px", height: "8px", borderRadius: "50%",
    background: "#7c6af7",
  };

  const card = {
    background: "rgba(19,21,30,0.92)",
    border: "1px solid #1f2235",
    borderRadius: "16px",
    padding: "32px",
    boxShadow: "0 8px 48px rgba(0,0,0,0.55)",
    backdropFilter: "blur(12px)",
  };

  const labelS = {
    display: "block",
    fontSize: "11px", fontWeight: "600",
    color: "#8b8fa8", letterSpacing: "0.9px",
    textTransform: "uppercase", marginBottom: "7px",
  };

  const inputBase = {
    width: "100%", background: "#0a0b10",
    borderWidth: "1px", borderStyle: "solid", borderColor: "#2a2d3e",
    borderRadius: "8px", padding: "11px 14px",
    color: "#e8e9f0", fontSize: "14px", outline: "none",
    boxSizing: "border-box", fontFamily: "inherit",
    transition: "border-color 0.15s, box-shadow 0.15s",
  };

  const selectBase = {
    ...inputBase,
    background: "#0a0b10",
    cursor: "pointer",
    appearance: "none",
    WebkitAppearance: "none",
    backgroundImage: `url("data:image/svg+xml,%3Csvg width='10' height='6' viewBox='0 0 10 6' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%234a4d62' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
    backgroundRepeat: "no-repeat",
    backgroundPosition: "right 12px center",
    paddingRight: "32px",
  };

  const btnPrimary = {
    background: "linear-gradient(135deg, #7c6af7 0%, #6b5ce7 100%)",
    color: "white", border: "none", borderRadius: "8px",
    padding: "12px 24px", fontSize: "14px", fontWeight: "600",
    cursor: "pointer", fontFamily: "inherit",
    display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
    boxShadow: "0 4px 22px rgba(124,106,247,0.38)",
    transition: "all 0.2s",
  };

  const btnSecondary = {
    background: "transparent",
    color: "#8b8fa8", border: "1px solid #2a2d3e", borderRadius: "8px",
    padding: "12px 20px", fontSize: "14px", fontWeight: "600",
    cursor: "pointer", fontFamily: "inherit",
    transition: "all 0.2s",
  };

  const errorBanner = {
    background: "rgba(239,68,68,0.09)",
    border: "1px solid rgba(239,68,68,0.22)",
    borderRadius: "8px", padding: "11px 14px",
    marginBottom: "18px", fontSize: "13px", color: "#fca5a5",
    display: "flex", alignItems: "center", gap: "8px",
  };

  /* ─── Step Progress Dots ─── */
  const renderProgress = () => (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "center",
      gap: "0", marginBottom: "24px", position: "relative",
    }}>
      {STEPS.map((s, idx) => {
        const isActive = idx === step;
        const isCompleted = idx < step;
        const isLast = idx === STEPS.length - 1;
        return (
          <div key={s.id} style={{ display: "flex", alignItems: "center" }}>
            <div style={{
              width: "32px", height: "32px", borderRadius: "50%",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "12px", fontWeight: "700",
              background: isCompleted
                ? "#22c55e"
                : isActive
                ? "#7c6af7"
                : "#1a1d27",
              border: `2px solid ${
                isCompleted ? "#22c55e" : isActive ? "#7c6af7" : "#2a2d3e"
              }`,
              color: isCompleted || isActive ? "white" : "#4a4d62",
              boxShadow: isActive
                ? "0 0 12px rgba(124,106,247,0.4)"
                : isCompleted
                ? "0 0 8px rgba(34,197,94,0.3)"
                : "none",
              transition: "all 0.3s",
              flexShrink: 0,
            }}>
              {isCompleted ? "✓" : idx + 1}
            </div>
            {!isLast && (
              <div style={{
                width: "48px", height: "2px",
                background: idx < step ? "#22c55e" : "#2a2d3e",
                transition: "background 0.3s",
              }} />
            )}
          </div>
        );
      })}
    </div>
  );

  /* ─── Goal Card (Step 0) ─── */
  const renderGoalCard = (goal) => {
    const isSelected = primaryGoal === goal.value;
    return (
      <button
        key={goal.value}
        type="button"
        onClick={() => setPrimaryGoal(goal.value)}
        style={{
          display: "flex", flexDirection: "column",
          alignItems: "center", gap: "6px",
          padding: "20px 12px",
          background: isSelected ? "rgba(124,106,247,0.1)" : "#0f1117",
          border: `1.5px solid ${isSelected ? "#7c6af7" : "#2a2d3e"}`,
          borderRadius: "12px",
          cursor: "pointer", textAlign: "center",
          transition: "all 0.2s",
          boxShadow: isSelected ? "0 0 16px rgba(124,106,247,0.15)" : "none",
          fontFamily: "inherit",
        }}
      >
        <span style={{ fontSize: "28px" }}>{goal.emoji}</span>
        <span style={{
          fontSize: "13px", fontWeight: "600",
          color: isSelected ? "#e8e9f0" : "#c0c3d4",
        }}>{goal.label}</span>
        <span style={{ fontSize: "11px", color: "#6b7280" }}>{goal.desc}</span>
      </button>
    );
  };

  /* ─── Fitness Level Card (Step 2) ─── */
  const renderFitnessCard = (level) => {
    const isSelected = fitnessLevel === level.value;
    return (
      <button
        key={level.value}
        type="button"
        onClick={() => setFitnessLevel(level.value)}
        style={{
          display: "flex", alignItems: "center", gap: "14px",
          padding: "14px 16px",
          background: isSelected ? "rgba(124,106,247,0.1)" : "#0f1117",
          border: `1.5px solid ${isSelected ? "#7c6af7" : "#2a2d3e"}`,
          borderRadius: "10px",
          cursor: "pointer", textAlign: "left",
          transition: "all 0.2s",
          boxShadow: isSelected ? "0 0 12px rgba(124,106,247,0.12)" : "none",
          width: "100%", fontFamily: "inherit",
        }}
      >
        <span style={{ fontSize: "24px", flexShrink: 0 }}>{level.emoji}</span>
        <div>
          <div style={{
            fontSize: "13px", fontWeight: "600",
            color: isSelected ? "#e8e9f0" : "#c0c3d4",
          }}>{level.label}</div>
          <div style={{ fontSize: "11px", color: "#6b7280" }}>{level.desc}</div>
        </div>
      </button>
    );
  };

  /* ─── Equipment Tag (Step 2) ─── */
  const renderEquipmentTag = (eq) => {
    const isSelected = equipment.includes(eq);
    return (
      <button
        key={eq}
        type="button"
        onClick={() => toggleEquipment(eq)}
        style={{
          padding: "7px 14px",
          borderRadius: "20px",
          fontSize: "12px", fontWeight: "600",
          background: isSelected ? "#7c6af7" : "#0f1117",
          border: `1px solid ${isSelected ? "#7c6af7" : "#2a2d3e"}`,
          color: isSelected ? "white" : "#8b8fa8",
          cursor: "pointer",
          transition: "all 0.2s",
          textTransform: "capitalize",
          fontFamily: "inherit",
          boxShadow: isSelected ? "0 2px 8px rgba(124,106,247,0.25)" : "none",
        }}
      >
        {eq.replace(/_/g, " ")}
      </button>
    );
  };

  /* ─── Step Content ─── */
  const renderStepContent = () => {
    switch (step) {
      case 0:
        return (
          <div style={{
            display: "grid", gridTemplateColumns: "1fr 1fr",
            gap: "12px",
          }}>
            {GOALS.map(renderGoalCard)}
          </div>
        );

      case 1:
        return (
          <div style={{
            display: "grid", gridTemplateColumns: "1fr 1fr",
            gap: "14px",
          }}>
            <div>
              <label style={labelS}>Age *</label>
              <input
                type="number" value={age}
                onChange={(e) => setAge(e.target.value)}
                placeholder="25"
                style={inputBase}
              />
            </div>
            <div>
              <label style={labelS}>Gender *</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                style={selectBase}
              >
                <option value="">Select...</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="non-binary">Non-binary</option>
                <option value="prefer_not_to_say">Prefer not to say</option>
              </select>
            </div>
            <div>
              <label style={labelS}>Height (cm) *</label>
              <input
                type="number" value={heightCm}
                onChange={(e) => setHeightCm(e.target.value)}
                placeholder="170" step="0.1"
                style={inputBase}
              />
            </div>
            <div>
              <label style={labelS}>Weight (kg) *</label>
              <input
                type="number" value={currentWeightKg}
                onChange={(e) => setCurrentWeightKg(e.target.value)}
                placeholder="70" step="0.1"
                style={inputBase}
              />
            </div>
            <div style={{ gridColumn: "1 / -1" }}>
              <label style={labelS}>Target Weight (kg) — optional</label>
              <input
                type="number" value={targetWeightKg}
                onChange={(e) => setTargetWeightKg(e.target.value)}
                placeholder="65" step="0.1"
                style={inputBase}
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
            {/* Fitness level */}
            <div>
              <label style={labelS}>Fitness Level *</label>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {FITNESS_LEVELS.map(renderFitnessCard)}
              </div>
            </div>

            {/* Equipment */}
            <div>
              <label style={labelS}>Available Equipment</label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                {EQUIPMENT_LIST.map(renderEquipmentTag)}
              </div>
            </div>

            {/* Workout prefs */}
            <div style={{
              display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px",
            }}>
              <div>
                <label style={labelS}>Workout Days / Week</label>
                <select
                  value={workoutDays}
                  onChange={(e) => setWorkoutDays(e.target.value)}
                  style={selectBase}
                >
                  {[2, 3, 4, 5, 6].map((n) => (
                    <option key={n} value={n}>{n} days</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={labelS}>Session Duration</label>
                <select
                  value={workoutDuration}
                  onChange={(e) => setWorkoutDuration(e.target.value)}
                  style={selectBase}
                >
                  {[20, 30, 45, 60, 75, 90].map((n) => (
                    <option key={n} value={n}>{n} min</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Injuries */}
            <div>
              <label style={labelS}>Injuries or Conditions — optional</label>
              <input
                type="text" value={injuries}
                onChange={(e) => setInjuries(e.target.value)}
                placeholder="e.g. bad knee, lower back pain"
                style={inputBase}
              />
            </div>
          </div>
        );

      case 3:
        return (
          <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
            <div>
              <label style={labelS}>Dietary Restrictions — optional</label>
              <input
                type="text" value={dietaryRestrictions}
                onChange={(e) => setDietaryRestrictions(e.target.value)}
                placeholder="e.g. vegetarian, lactose intolerant, no nuts"
                style={inputBase}
              />
            </div>

            {/* Ready card */}
            <div style={{
              background: "#0f1117",
              border: "1px solid #2a2d3e",
              borderRadius: "12px", padding: "28px 20px",
              textAlign: "center",
              display: "flex", flexDirection: "column",
              alignItems: "center", gap: "10px",
            }}>
              <div style={{ fontSize: "36px" }}>🚀</div>
              <h4 style={{
                fontSize: "16px", fontWeight: "700",
                color: "#e8e9f0", margin: 0,
              }}>You're almost ready!</h4>
              <p style={{
                fontSize: "13px", color: "#8b8fa8",
                lineHeight: "1.5", maxWidth: "320px", margin: 0,
              }}>
                AroMi will use your profile to create personalized workout
                and nutrition plans just for you. You can always update
                these through settings or chat.
              </p>
            </div>

            {serverError && <div style={errorBanner}>⚠️ {serverError}</div>}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div style={wrap}>
      <div style={orb1} />
      <div style={orb2} />
      <div style={center}>

        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: "24px" }}>
          <div style={logoBox}>
            <div style={ring}><div style={dot} /></div>
          </div>
          <div style={{
            fontSize: "26px", fontWeight: "700", color: "#e8e9f0",
            letterSpacing: "-0.5px", lineHeight: 1.2,
          }}>AroMi</div>
          <div style={{
            fontSize: "12px", color: "#6b7280", marginTop: "4px",
          }}>Let's personalize your experience</div>
        </div>

        {/* Card */}
        <div style={card}>

          {/* Progress dots */}
          {renderProgress()}

          {/* Step header */}
          <div style={{ textAlign: "center", marginBottom: "22px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
              <span style={{ fontSize: "20px" }}>{STEPS[step].emoji}</span>
              <h1 style={{
                fontSize: "20px", fontWeight: "700",
                color: "#e8e9f0", margin: 0,
              }}>{STEPS[step].title}</h1>
            </div>
            <p style={{
              fontSize: "13px", color: "#6b7280", margin: "4px 0 0",
            }}>{STEPS[step].sub}</p>
          </div>

          {/* Validation error */}
          {stepError && <div style={errorBanner}>⚠️ {stepError}</div>}

          {/* Step content */}
          {renderStepContent()}

          {/* Navigation */}
          <div style={{
            display: "flex", alignItems: "center",
            justifyContent: "space-between",
            borderTop: "1px solid #1f2235",
            paddingTop: "20px", marginTop: "24px",
          }}>
            {step > 0 ? (
              <button type="button" onClick={prevStep} style={btnSecondary}>
                ← Back
              </button>
            ) : (
              <div />
            )}

            {step < STEPS.length - 1 ? (
              <button type="button" onClick={nextStep} style={btnPrimary}>
                Continue <span style={{ fontSize: "16px" }}>→</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                style={{
                  ...btnPrimary,
                  opacity: isSubmitting ? 0.6 : 1,
                  cursor: isSubmitting ? "not-allowed" : "pointer",
                }}
              >
                {isSubmitting ? (
                  <>
                    <span style={{
                      width: "16px", height: "16px",
                      border: "2px solid rgba(255,255,255,0.3)",
                      borderTopColor: "white", borderRadius: "50%",
                      display: "inline-block",
                      animation: "ob-spin 0.7s linear infinite",
                    }} />
                    Saving...
                  </>
                ) : (
                  <>Start My Journey 🎉</>
                )}
              </button>
            )}
          </div>

          {/* Step indicator text */}
          <div style={{
            textAlign: "center", marginTop: "14px",
            fontSize: "11px", color: "#3a3d52",
          }}>
            Step {step + 1} of {STEPS.length}
          </div>
        </div>

        {/* Footer */}
        <div style={{
          textAlign: "center", marginTop: "18px",
          fontSize: "12px", color: "#3a3d52",
        }}>🔒 Protected by AroMi • Your data stays private</div>
      </div>

      <style>{`
        @keyframes ob-spin { to { transform: rotate(360deg); } }
        input::placeholder, select { color: #3a3d52 !important; }
        input:focus, select:focus {
          border-color: #7c6af7 !important;
          box-shadow: 0 0 0 3px rgba(124,106,247,0.13) !important;
        }
        select option {
          background: #0f1117;
          color: #e8e9f0;
        }
      `}</style>
    </div>
  );
}
