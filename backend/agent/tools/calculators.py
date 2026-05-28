"""
Calculators for BMR, TDEE, Calorie Goal, and Macronutrient splits.
These can be called by the agent to compute targets.
"""

def calculate_bmr(weight_kg: float, height_cm: float, age: int, gender: str) -> float:
    # Mifflin-St Jeor formula
    if gender == "male":
        return (10 * weight_kg) + (6.25 * height_cm) - (5 * age) + 5
    else:
        return (10 * weight_kg) + (6.25 * height_cm) - (5 * age) - 161

def calculate_tdee(bmr: float, activity_level: str) -> int:
    multipliers = {
        "sedentary": 1.2,
        "light": 1.375,
        "moderate": 1.55,
        "active": 1.725,
        "very_active": 1.9
    }
    return round(bmr * multipliers.get(activity_level, 1.55))

def calculate_calorie_goal(tdee: int, goal: str) -> int:
    adjustments = {
        "lose_weight": -500,
        "maintain": 0,
        "build_muscle": 300
    }
    return tdee + adjustments.get(goal, 0)

def calculate_macros(calorie_goal: int, goal: str) -> dict:
    if goal == "build_muscle":
        protein_pct, carbs_pct, fat_pct = 0.35, 0.45, 0.20
    elif goal == "lose_weight":
        protein_pct, carbs_pct, fat_pct = 0.40, 0.35, 0.25
    else:
        protein_pct, carbs_pct, fat_pct = 0.30, 0.45, 0.25

    return {
        "protein_g": round((calorie_goal * protein_pct) / 4),
        "carbs_g": round((calorie_goal * carbs_pct) / 4),
        "fat_g": round((calorie_goal * fat_pct) / 9),
        "calories": calorie_goal
    }
