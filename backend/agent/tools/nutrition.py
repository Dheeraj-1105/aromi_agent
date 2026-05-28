"""
Nutrition tool functions — generate_meal_plan and lookup_food.

generate_meal_plan returns a COMPLETE, fully-formatted meal plan string with
realistic food items, portions, and macro estimates so the agent can copy it
verbatim into chat without any further reasoning.
"""
import random
from typing import Any


# ---------------------------------------------------------------------------
# Meal templates keyed by focus and dietary restriction
# ---------------------------------------------------------------------------

_HIGH_PROTEIN_MEALS = {
    "breakfast": [
        {"name": "Scrambled eggs (3) + whole wheat toast + black coffee",
         "kcal": 420, "protein": 30, "carbs": 32, "fat": 16},
        {"name": "Greek yogurt (200g) + banana + almonds (20g)",
         "kcal": 380, "protein": 26, "carbs": 44, "fat": 10},
        {"name": "Oats (80g) + whey protein shake + boiled egg (2)",
         "kcal": 510, "protein": 42, "carbs": 50, "fat": 12},
    ],
    "lunch": [
        {"name": "Grilled chicken breast (150g) + steamed rice (150g) + salad",
         "kcal": 620, "protein": 52, "carbs": 58, "fat": 10},
        {"name": "Tuna wrap (whole wheat) + cottage cheese (100g)",
         "kcal": 580, "protein": 48, "carbs": 52, "fat": 12},
        {"name": "Egg white omelette (4 eggs) + brown rice + sautéed veggies",
         "kcal": 540, "protein": 44, "carbs": 55, "fat": 8},
    ],
    "dinner": [
        {"name": "Baked salmon (180g) + sweet potato + broccoli",
         "kcal": 620, "protein": 48, "carbs": 45, "fat": 18},
        {"name": "Paneer curry (200g) + 2 rotis + dal (1 cup)",
         "kcal": 670, "protein": 38, "carbs": 65, "fat": 22},
        {"name": "Grilled chicken thighs (150g) + quinoa + spinach salad",
         "kcal": 590, "protein": 46, "carbs": 48, "fat": 14},
    ],
    "snack": [
        {"name": "Peanut butter (2 tbsp) + apple + protein shake",
         "kcal": 320, "protein": 22, "carbs": 28, "fat": 12},
        {"name": "Boiled eggs (2) + mixed nuts (30g)",
         "kcal": 280, "protein": 18, "carbs": 6, "fat": 20},
        {"name": "Cottage cheese (150g) + berries",
         "kcal": 220, "protein": 20, "carbs": 18, "fat": 4},
    ],
}

_BALANCED_MEALS = {
    "breakfast": [
        {"name": "Poha (200g) + chai + fruit",
         "kcal": 360, "protein": 10, "carbs": 60, "fat": 8},
        {"name": "Whole wheat toast (2 slices) + peanut butter + orange juice",
         "kcal": 400, "protein": 14, "carbs": 58, "fat": 12},
        {"name": "Idli (3) + sambar + coconut chutney",
         "kcal": 320, "protein": 12, "carbs": 56, "fat": 6},
    ],
    "lunch": [
        {"name": "Dal + rice (150g) + sabzi + curd",
         "kcal": 560, "protein": 22, "carbs": 80, "fat": 10},
        {"name": "Chicken sandwich (whole wheat) + mixed salad",
         "kcal": 520, "protein": 30, "carbs": 58, "fat": 14},
        {"name": "Rajma (1 cup) + rice + salad",
         "kcal": 540, "protein": 20, "carbs": 82, "fat": 8},
    ],
    "dinner": [
        {"name": "Chapati (2) + paneer sabzi + dal",
         "kcal": 560, "protein": 24, "carbs": 68, "fat": 16},
        {"name": "Grilled fish (150g) + roti (2) + sabzi",
         "kcal": 580, "protein": 38, "carbs": 58, "fat": 16},
        {"name": "Pasta (whole wheat, 80g dry) + tomato sauce + veggies",
         "kcal": 520, "protein": 18, "carbs": 76, "fat": 10},
    ],
    "snack": [
        {"name": "Fruit bowl + roasted chana (50g)",
         "kcal": 260, "protein": 10, "carbs": 42, "fat": 4},
        {"name": "Masala chai + digestive biscuits (4)",
         "kcal": 200, "protein": 4, "carbs": 34, "fat": 6},
        {"name": "Mixed nuts (30g) + banana",
         "kcal": 280, "protein": 6, "carbs": 34, "fat": 14},
    ],
}

_LOW_CARB_MEALS = {
    "breakfast": [
        {"name": "3-egg omelette with cheese + avocado (half) + black coffee",
         "kcal": 430, "protein": 28, "carbs": 6, "fat": 34},
        {"name": "Greek yogurt (200g) + almonds (30g) + berries",
         "kcal": 340, "protein": 22, "carbs": 18, "fat": 18},
        {"name": "Paneer bhurji (150g) + 1 roti (small)",
         "kcal": 380, "protein": 24, "carbs": 16, "fat": 24},
    ],
    "lunch": [
        {"name": "Grilled chicken (180g) + salad + olive oil dressing",
         "kcal": 420, "protein": 48, "carbs": 8, "fat": 20},
        {"name": "Egg salad (3 eggs) + cucumber + feta",
         "kcal": 360, "protein": 26, "carbs": 6, "fat": 26},
        {"name": "Soya chunks (100g dry) + stir-fried veggies",
         "kcal": 380, "protein": 36, "carbs": 22, "fat": 12},
    ],
    "dinner": [
        {"name": "Baked fish (180g) + roasted cauliflower",
         "kcal": 380, "protein": 42, "carbs": 12, "fat": 16},
        {"name": "Chicken stir-fry with bell peppers and broccoli",
         "kcal": 420, "protein": 44, "carbs": 14, "fat": 18},
        {"name": "Paneer tikka (200g) + raita",
         "kcal": 440, "protein": 30, "carbs": 12, "fat": 30},
    ],
    "snack": [
        {"name": "Boiled eggs (2) + string cheese",
         "kcal": 220, "protein": 18, "carbs": 2, "fat": 16},
        {"name": "Mixed nuts (30g) + dark chocolate (20g)",
         "kcal": 280, "protein": 6, "carbs": 14, "fat": 22},
        {"name": "Celery + peanut butter (2 tbsp)",
         "kcal": 180, "protein": 8, "carbs": 8, "fat": 14},
    ],
}

_VEGETARIAN_MEALS = {
    "breakfast": [
        {"name": "Besan chilla (2) + green chutney + curd",
         "kcal": 380, "protein": 18, "carbs": 44, "fat": 12},
        {"name": "Moong dal dosa (2) + sambar",
         "kcal": 340, "protein": 16, "carbs": 52, "fat": 8},
        {"name": "Paneer paratha (1) + curd (150g)",
         "kcal": 440, "protein": 20, "carbs": 50, "fat": 18},
    ],
    "lunch": [
        {"name": "Rajma (1 cup) + brown rice (150g) + salad",
         "kcal": 560, "protein": 22, "carbs": 82, "fat": 8},
        {"name": "Palak paneer (150g) + 2 rotis + dal",
         "kcal": 620, "protein": 28, "carbs": 68, "fat": 22},
        {"name": "Chole (1 cup) + rice + raita",
         "kcal": 580, "protein": 20, "carbs": 84, "fat": 10},
    ],
    "dinner": [
        {"name": "Dal makhani (1 cup) + 2 rotis + sabzi",
         "kcal": 600, "protein": 22, "carbs": 72, "fat": 18},
        {"name": "Tofu stir-fry (200g) + quinoa (100g)",
         "kcal": 520, "protein": 26, "carbs": 56, "fat": 18},
        {"name": "Mixed veg curry + 2 chapatis + curd",
         "kcal": 540, "protein": 16, "carbs": 76, "fat": 14},
    ],
    "snack": [
        {"name": "Roasted makhana (50g) + chai",
         "kcal": 200, "protein": 8, "carbs": 34, "fat": 4},
        {"name": "Peanut butter (2 tbsp) + banana",
         "kcal": 280, "protein": 10, "carbs": 36, "fat": 10},
        {"name": "Sprouts chaat (100g)",
         "kcal": 160, "protein": 10, "carbs": 26, "fat": 2},
    ],
}

_MEAL_TIMES = {
    "breakfast": "🌅 Breakfast (7:00 AM)",
    "lunch": "☀️ Lunch (1:00 PM)",
    "dinner": "🌙 Dinner (7:30 PM)",
    "snack": "🍎 Snack (4:30 PM)",
}

_FOCUS_MAP = {
    "high protein": _HIGH_PROTEIN_MEALS,
    "high-protein": _HIGH_PROTEIN_MEALS,
    "low carb": _LOW_CARB_MEALS,
    "low-carb": _LOW_CARB_MEALS,
    "vegetarian": _VEGETARIAN_MEALS,
    "vegan": _VEGETARIAN_MEALS,
    "balanced": _BALANCED_MEALS,
}


def _pick(options: list) -> dict:
    """Pick a random meal from the options list."""
    return random.choice(options)


def generate_meal_plan(
    tool_input: dict[str, Any],
    profile: dict[str, Any],
) -> str:
    """
    Generate and return a COMPLETE, fully-formatted meal plan string.
    The agent copies this verbatim into chat — no further reasoning needed.
    """
    meals_per_day = int(tool_input.get("meals_per_day", 3))
    days = int(tool_input.get("days", 1))
    focus_raw = tool_input.get("focus", "balanced").lower().strip()
    restrictions = (profile.get("dietary_restrictions") or "none").lower()
    goal = profile.get("primary_goal", "general_fitness")

    # Apply dietary restriction override
    if any(v in restrictions for v in ("vegetarian", "vegan", "no meat")):
        meals = _VEGETARIAN_MEALS
        focus_label = "vegetarian"
    else:
        meals = _FOCUS_MAP.get(focus_raw, _BALANCED_MEALS)
        focus_label = focus_raw

    # Calorie target from profile or sensible defaults
    calorie_target = profile.get("daily_calorie_target")
    if not calorie_target:
        if goal == "lose_weight":
            calorie_target = 1900
        elif goal == "build_muscle":
            calorie_target = 2600
        else:
            calorie_target = 2100

    lines = []
    day_label = "tomorrow" if days == 1 else f"the next {days} days"
    lines.append(f"Here is your **{focus_label} meal plan** for {day_label}:\n")

    for day_num in range(1, days + 1):
        if days > 1:
            lines.append(f"### Day {day_num}\n")

        # Choose which meal slots to include based on meals_per_day
        slots = ["breakfast", "lunch", "dinner"]
        if meals_per_day >= 4:
            slots.append("snack")

        total_kcal = 0
        total_protein = 0
        total_carbs = 0
        total_fat = 0

        for slot in slots:
            chosen = _pick(meals.get(slot, meals["breakfast"]))
            label = _MEAL_TIMES.get(slot, slot.capitalize())
            lines.append(
                f"**{label}** — {chosen['kcal']} kcal | {chosen['protein']}g protein\n"
                f"  {chosen['name']}\n"
            )
            total_kcal += chosen["kcal"]
            total_protein += chosen["protein"]
            total_carbs += chosen["carbs"]
            total_fat += chosen["fat"]

        lines.append(
            f"📊 **Day Total: {total_kcal} kcal | "
            f"{total_protein}g protein | "
            f"{total_carbs}g carbs | "
            f"{total_fat}g fat**\n"
        )

    # Guidance note
    lines.append(
        "_Portions are estimates — adjust to your hunger and energy levels. "
        "Drink plenty of water throughout the day._"
    )

    return "\n".join(lines)


def lookup_food(tool_input: dict[str, Any], profile: dict[str, Any]) -> str:
    """
    Return a prompt instructing the agent to use its built-in nutrition knowledge.
    """
    query = tool_input.get("query", "")
    return (
        f"Nutrition lookup for: '{query}'. "
        "Use your knowledge of standard nutrition databases to provide accurate estimates "
        "for calories, protein (g), carbohydrates (g), and fat (g). "
        "State the serving size clearly. Note that these are estimates."
    )
