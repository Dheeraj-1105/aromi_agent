"""
Coaching tool — generate_workout_plan returns a COMPLETE, fully-formatted
workout plan string with every exercise, sets, reps, and rest time so
the agent can copy it verbatim into chat.
"""
from typing import Any

# ---------------------------------------------------------------------------
# Exercise templates keyed by focus and fitness level
# ---------------------------------------------------------------------------

_BODYWEIGHT_EXERCISES = {
    "beginner": {
        "full body": [
            {"name": "Push-Ups", "sets": 3, "reps": "10", "rest": "60s"},
            {"name": "Bodyweight Squats", "sets": 3, "reps": "15", "rest": "60s"},
            {"name": "Glute Bridge", "sets": 3, "reps": "15", "rest": "45s"},
            {"name": "Plank Hold", "sets": 3, "reps": "30s", "rest": "45s"},
            {"name": "Mountain Climbers", "sets": 3, "reps": "20", "rest": "60s"},
        ],
        "upper body": [
            {"name": "Push-Ups", "sets": 4, "reps": "10", "rest": "60s"},
            {"name": "Diamond Push-Ups", "sets": 3, "reps": "8", "rest": "60s"},
            {"name": "Pike Push-Ups", "sets": 3, "reps": "8", "rest": "60s"},
            {"name": "Tricep Dips (chair)", "sets": 3, "reps": "10", "rest": "60s"},
        ],
        "legs": [
            {"name": "Bodyweight Squats", "sets": 4, "reps": "20", "rest": "60s"},
            {"name": "Reverse Lunges", "sets": 3, "reps": "12/leg", "rest": "60s"},
            {"name": "Glute Bridge", "sets": 3, "reps": "20", "rest": "45s"},
            {"name": "Calf Raises", "sets": 3, "reps": "25", "rest": "30s"},
        ],
        "cardio": [
            {"name": "Jumping Jacks", "sets": 4, "reps": "30s", "rest": "30s"},
            {"name": "High Knees", "sets": 4, "reps": "30s", "rest": "30s"},
            {"name": "Burpees", "sets": 3, "reps": "8", "rest": "60s"},
            {"name": "Jump Rope (simulated)", "sets": 3, "reps": "1 min", "rest": "45s"},
        ],
    },
    "intermediate": {
        "full body": [
            {"name": "Push-Ups", "sets": 4, "reps": "15", "rest": "45s"},
            {"name": "Jump Squats", "sets": 4, "reps": "15", "rest": "60s"},
            {"name": "Burpees", "sets": 3, "reps": "12", "rest": "60s"},
            {"name": "Plank Hold", "sets": 3, "reps": "45s", "rest": "30s"},
            {"name": "Mountain Climbers", "sets": 3, "reps": "30", "rest": "45s"},
            {"name": "Tricep Dips (chair)", "sets": 3, "reps": "15", "rest": "45s"},
        ],
        "upper body": [
            {"name": "Wide Push-Ups", "sets": 4, "reps": "15", "rest": "45s"},
            {"name": "Diamond Push-Ups", "sets": 4, "reps": "12", "rest": "45s"},
            {"name": "Pike Push-Ups", "sets": 4, "reps": "12", "rest": "45s"},
            {"name": "Tricep Dips (chair)", "sets": 3, "reps": "15", "rest": "45s"},
            {"name": "Plank Shoulder Taps", "sets": 3, "reps": "20", "rest": "30s"},
        ],
        "legs": [
            {"name": "Jump Squats", "sets": 4, "reps": "15", "rest": "60s"},
            {"name": "Bulgarian Split Squats", "sets": 3, "reps": "10/leg", "rest": "60s"},
            {"name": "Reverse Lunges", "sets": 3, "reps": "15/leg", "rest": "45s"},
            {"name": "Single-Leg Glute Bridge", "sets": 3, "reps": "12/leg", "rest": "45s"},
            {"name": "Calf Raises", "sets": 3, "reps": "30", "rest": "30s"},
        ],
        "cardio": [
            {"name": "Burpees", "sets": 4, "reps": "15", "rest": "45s"},
            {"name": "High Knees", "sets": 4, "reps": "45s", "rest": "30s"},
            {"name": "Jump Squats", "sets": 3, "reps": "20", "rest": "30s"},
            {"name": "Mountain Climbers", "sets": 3, "reps": "40", "rest": "30s"},
        ],
    },
    "advanced": {
        "full body": [
            {"name": "Clapping Push-Ups", "sets": 4, "reps": "12", "rest": "45s"},
            {"name": "Pistol Squats (assisted)", "sets": 3, "reps": "8/leg", "rest": "60s"},
            {"name": "Burpees with Push-Up", "sets": 4, "reps": "15", "rest": "45s"},
            {"name": "L-Sit Hold", "sets": 3, "reps": "20s", "rest": "45s"},
            {"name": "Hollow Body Hold", "sets": 3, "reps": "30s", "rest": "30s"},
            {"name": "Plyometric Lunges", "sets": 3, "reps": "12/leg", "rest": "45s"},
        ],
        "upper body": [
            {"name": "Archer Push-Ups", "sets": 4, "reps": "10/side", "rest": "45s"},
            {"name": "Pike Push-Ups (feet elevated)", "sets": 4, "reps": "12", "rest": "45s"},
            {"name": "Diamond Push-Ups", "sets": 4, "reps": "15", "rest": "45s"},
            {"name": "Plank to Down Dog", "sets": 3, "reps": "15", "rest": "30s"},
        ],
        "legs": [
            {"name": "Pistol Squats (assisted)", "sets": 4, "reps": "8/leg", "rest": "60s"},
            {"name": "Plyometric Lunges", "sets": 4, "reps": "15/leg", "rest": "45s"},
            {"name": "Nordic Curl (assisted)", "sets": 3, "reps": "6", "rest": "90s"},
            {"name": "Box Jumps", "sets": 3, "reps": "12", "rest": "60s"},
        ],
        "cardio": [
            {"name": "Burpees with Tuck Jump", "sets": 5, "reps": "15", "rest": "30s"},
            {"name": "High Knees", "sets": 5, "reps": "1 min", "rest": "30s"},
            {"name": "Plyo Push-Ups", "sets": 4, "reps": "12", "rest": "30s"},
            {"name": "Bear Crawl", "sets": 3, "reps": "30s", "rest": "30s"},
        ],
    },
}

_GYM_EXERCISES = {
    "beginner": {
        "full body": [
            {"name": "Barbell Squat", "sets": 3, "reps": "10", "rest": "90s"},
            {"name": "Bench Press", "sets": 3, "reps": "10", "rest": "90s"},
            {"name": "Lat Pulldown", "sets": 3, "reps": "12", "rest": "60s"},
            {"name": "Dumbbell Shoulder Press", "sets": 3, "reps": "10", "rest": "60s"},
            {"name": "Cable Row", "sets": 3, "reps": "12", "rest": "60s"},
            {"name": "Plank Hold", "sets": 3, "reps": "30s", "rest": "30s"},
        ],
        "upper body": [
            {"name": "Bench Press", "sets": 4, "reps": "10", "rest": "90s"},
            {"name": "Incline Dumbbell Fly", "sets": 3, "reps": "12", "rest": "60s"},
            {"name": "Lat Pulldown", "sets": 4, "reps": "12", "rest": "60s"},
            {"name": "Dumbbell Bicep Curl", "sets": 3, "reps": "12", "rest": "45s"},
            {"name": "Tricep Pushdown", "sets": 3, "reps": "12", "rest": "45s"},
        ],
        "legs": [
            {"name": "Leg Press", "sets": 4, "reps": "12", "rest": "90s"},
            {"name": "Leg Extension", "sets": 3, "reps": "15", "rest": "60s"},
            {"name": "Leg Curl", "sets": 3, "reps": "15", "rest": "60s"},
            {"name": "Calf Raises (machine)", "sets": 3, "reps": "20", "rest": "45s"},
            {"name": "Dumbbell Lunge", "sets": 3, "reps": "10/leg", "rest": "60s"},
        ],
        "chest": [
            {"name": "Flat Barbell Bench Press", "sets": 4, "reps": "10", "rest": "90s"},
            {"name": "Incline Dumbbell Press", "sets": 3, "reps": "12", "rest": "60s"},
            {"name": "Cable Fly", "sets": 3, "reps": "15", "rest": "45s"},
            {"name": "Push-Ups (superset)", "sets": 3, "reps": "15", "rest": "45s"},
        ],
        "back": [
            {"name": "Deadlift", "sets": 3, "reps": "8", "rest": "120s"},
            {"name": "Lat Pulldown", "sets": 4, "reps": "12", "rest": "60s"},
            {"name": "Seated Cable Row", "sets": 3, "reps": "12", "rest": "60s"},
            {"name": "Dumbbell Row", "sets": 3, "reps": "12/side", "rest": "60s"},
        ],
        "cardio": [
            {"name": "Treadmill (moderate pace)", "sets": 1, "reps": "20 min", "rest": "-"},
            {"name": "Jump Rope", "sets": 5, "reps": "1 min", "rest": "30s"},
            {"name": "Battle Ropes", "sets": 4, "reps": "30s", "rest": "30s"},
            {"name": "Rowing Machine", "sets": 1, "reps": "10 min", "rest": "-"},
        ],
    },
    "intermediate": {
        "full body": [
            {"name": "Barbell Squat", "sets": 4, "reps": "8", "rest": "90s"},
            {"name": "Deadlift", "sets": 4, "reps": "6", "rest": "120s"},
            {"name": "Bench Press", "sets": 4, "reps": "8", "rest": "90s"},
            {"name": "Pull-Ups", "sets": 3, "reps": "8–10", "rest": "60s"},
            {"name": "Dumbbell Shoulder Press", "sets": 3, "reps": "10", "rest": "60s"},
            {"name": "Cable Row", "sets": 3, "reps": "12", "rest": "60s"},
            {"name": "Ab Wheel Rollout", "sets": 3, "reps": "10", "rest": "45s"},
        ],
        "upper body": [
            {"name": "Incline Barbell Press", "sets": 4, "reps": "8", "rest": "90s"},
            {"name": "Pull-Ups", "sets": 4, "reps": "8–10", "rest": "60s"},
            {"name": "Dumbbell Shoulder Press", "sets": 4, "reps": "10", "rest": "60s"},
            {"name": "Barbell Curl", "sets": 3, "reps": "10", "rest": "45s"},
            {"name": "Skull Crushers", "sets": 3, "reps": "10", "rest": "45s"},
            {"name": "Lateral Raises", "sets": 3, "reps": "15", "rest": "30s"},
        ],
        "legs": [
            {"name": "Barbell Squat", "sets": 5, "reps": "8", "rest": "120s"},
            {"name": "Romanian Deadlift", "sets": 4, "reps": "10", "rest": "90s"},
            {"name": "Leg Press", "sets": 3, "reps": "12", "rest": "90s"},
            {"name": "Walking Lunges", "sets": 3, "reps": "12/leg", "rest": "60s"},
            {"name": "Calf Raises", "sets": 4, "reps": "20", "rest": "45s"},
        ],
        "chest": [
            {"name": "Flat Barbell Bench Press", "sets": 5, "reps": "8", "rest": "90s"},
            {"name": "Incline Dumbbell Press", "sets": 4, "reps": "10", "rest": "60s"},
            {"name": "Cable Fly", "sets": 3, "reps": "15", "rest": "45s"},
            {"name": "Dips (weighted)", "sets": 3, "reps": "10", "rest": "60s"},
        ],
        "back": [
            {"name": "Deadlift", "sets": 4, "reps": "6", "rest": "120s"},
            {"name": "Bent Over Row", "sets": 4, "reps": "10", "rest": "90s"},
            {"name": "Pull-Ups", "sets": 4, "reps": "8–10", "rest": "60s"},
            {"name": "Face Pulls", "sets": 3, "reps": "15", "rest": "45s"},
        ],
        "cardio": [
            {"name": "HIIT on Treadmill", "sets": 8, "reps": "30s sprint / 30s walk", "rest": "-"},
            {"name": "Rowing Machine", "sets": 1, "reps": "15 min", "rest": "-"},
            {"name": "Battle Ropes", "sets": 5, "reps": "30s", "rest": "30s"},
        ],
    },
    "advanced": {
        "full body": [
            {"name": "Barbell Back Squat", "sets": 5, "reps": "5", "rest": "120s"},
            {"name": "Deadlift", "sets": 5, "reps": "5", "rest": "120s"},
            {"name": "Weighted Pull-Ups", "sets": 4, "reps": "6–8", "rest": "90s"},
            {"name": "Dumbbell Bench Press", "sets": 4, "reps": "8", "rest": "90s"},
            {"name": "Barbell Hip Thrust", "sets": 4, "reps": "10", "rest": "90s"},
            {"name": "Weighted Plank", "sets": 3, "reps": "45s", "rest": "45s"},
        ],
        "upper body": [
            {"name": "Weighted Pull-Ups", "sets": 5, "reps": "6", "rest": "90s"},
            {"name": "Close Grip Bench Press", "sets": 4, "reps": "8", "rest": "90s"},
            {"name": "Arnold Press", "sets": 4, "reps": "10", "rest": "60s"},
            {"name": "Barbell Curl (21s)", "sets": 4, "reps": "21", "rest": "60s"},
            {"name": "Overhead Tricep Extension", "sets": 3, "reps": "10", "rest": "45s"},
        ],
        "legs": [
            {"name": "Front Squat", "sets": 5, "reps": "5", "rest": "120s"},
            {"name": "Romanian Deadlift", "sets": 4, "reps": "8", "rest": "90s"},
            {"name": "Hack Squat", "sets": 4, "reps": "10", "rest": "90s"},
            {"name": "Single Leg Press", "sets": 3, "reps": "12/leg", "rest": "60s"},
            {"name": "Standing Calf Raises (heavy)", "sets": 5, "reps": "15", "rest": "45s"},
        ],
    },
}

_WARM_UP = [
    "Light jog in place — 2 min",
    "Arm circles (10 each direction)",
    "Leg swings (10 each side)",
    "Hip circles (10 each direction)",
    "Cat-cow stretch — 30s",
]

_COOL_DOWN = [
    "Seated hamstring stretch — 30s each side",
    "Pigeon pose — 30s each side",
    "Child's pose — 1 min",
    "Shoulder cross stretch — 20s each side",
    "Belly breathing — 1 min",
]


def generate_workout_plan(
    tool_input: dict[str, Any],
    profile: dict[str, Any],
) -> str:
    """
    Generate and return a COMPLETE, fully-formatted workout plan string.
    The agent copies this verbatim into chat — no further reasoning needed.
    """
    focus_raw = tool_input.get("focus", "full body").lower().strip()
    raw_duration = tool_input.get("duration_min") or profile.get("preferred_workout_duration_min") or 45
    duration_min = int(raw_duration)

    fitness_level = (profile.get("fitness_level") or "beginner").lower()
    if fitness_level not in ("beginner", "intermediate", "advanced"):
        fitness_level = "beginner"

    equipment_raw = profile.get("available_equipment", "bodyweight")
    if isinstance(equipment_raw, list):
        equipment_str = ", ".join(equipment_raw).lower()
    else:
        equipment_str = (str(equipment_raw) or "bodyweight").lower()

    injuries = profile.get("injuries_or_conditions") or "none"

    # Choose exercise bank based on equipment
    has_gym = any(k in equipment_str for k in ("gym", "barbell", "machine", "cable", "rack"))
    bank = _GYM_EXERCISES if has_gym else _BODYWEIGHT_EXERCISES

    # Resolve focus
    level_bank = bank.get(fitness_level, bank["beginner"])
    exercises = level_bank.get(focus_raw, level_bank.get("full body", []))

    # Determine session style and exercise count based on duration
    if duration_min <= 20:
        # Circuit style — 4-5 compound exercises, minimal rest
        max_exercises = 5
        exercises = exercises[:max_exercises]
        # Override rest to minimal for circuit style
        circuit_exercises = []
        for ex in exercises:
            circuit_exercises.append({**ex, "sets": 3, "reps": ex["reps"], "rest": "15s"})
        exercises = circuit_exercises
        session_style = "circuit"
        rest_note = "🔄 **Circuit Style** — move from exercise to exercise with minimal rest. Rest 60s between rounds."
        difficulty_label = "High Intensity"
    elif duration_min <= 30:
        # Moderate session — 5-6 exercises, 30s rest
        max_exercises = 6
        exercises = exercises[:max_exercises]
        short_exercises = []
        for ex in exercises:
            short_exercises.append({**ex, "rest": "30s"})
        exercises = short_exercises
        session_style = "short"
        rest_note = "⏱️ **Focused Session** — 30 seconds rest between sets to keep heart rate elevated."
        difficulty_label = "Moderate–High"
    else:
        # Normal workout — full rest periods
        max_exercises = max(4, duration_min // 7)
        exercises = exercises[:max_exercises]
        session_style = "normal"
        rest_note = ""
        difficulty_label = fitness_level.title()

    # Build the formatted plan
    focus_display = focus_raw.title()
    equipment_display = "Gym" if has_gym else "Bodyweight"
    lines = [
        f"Here is your **{focus_display} Workout** ({duration_min} min · {difficulty_label} · {equipment_display}):\n"
    ]

    if rest_note:
        lines.append(rest_note)
        lines.append("")

    # Warm-up (skip for very short sessions to save time)
    if duration_min > 15:
        lines.append("🔥 **Warm-Up (3 min)**")
        for item in _WARM_UP[:3]:
            lines.append(f"  - {item}")
        lines.append("")

    # Main workout
    main_duration = duration_min - (5 if duration_min > 15 else 0)
    lines.append(f"💪 **Main Workout ({main_duration} min)**")
    for i, ex in enumerate(exercises, 1):
        reps_label = f"{ex['reps']} reps" if not any(c.isalpha() for c in str(ex['reps'])) else ex['reps']
        lines.append(
            f"  {i}. **{ex['name']}** — {ex['sets']} sets × {reps_label} | Rest: {ex['rest']}"
        )

    # Injury notice
    if injuries and injuries.lower() not in ("none", "none."):
        lines.append(f"\n⚠️ _Note: Avoiding movements that stress {injuries}._")

    lines.append("")

    # Cool-down
    lines.append("🧘 **Cool-Down (2 min)**")
    for item in _COOL_DOWN[:2]:
        lines.append(f"  - {item}")

    lines.append("")
    lines.append("_Log your session after you're done! Let me know how it felt._")

    return "\n".join(lines)

