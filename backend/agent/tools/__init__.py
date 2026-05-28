"""
All 6 tool definitions for Groq API (OpenAI-compatible format).
Tools are declared as dicts with type: "function" and JSON Schema parameters.
"""

GROQ_TOOLS = [
    {
        "type": "function",
        "function": {
            "name": "generate_workout_plan",
            "description": "Generate a personalised workout plan for the user.",
            "parameters": {
                "type": "object",
                "properties": {
                    "focus": {
                        "type": "string",
                        "description": "Target muscle group or session type. Examples: 'full body', 'upper body', 'legs', 'cardio', 'rest day'",
                    },
                    "duration_min": {
                        "type": "integer",
                        "description": "Target session duration in minutes. Default 45.",
                    },
                    "difficulty_adjustment": {
                        "type": "string",
                        "description": "Intensity vs last session. One of: 'easier', 'same', 'harder'. Default 'same'.",
                    },
                },
                "required": ["focus"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "log_workout",
            "description": "Save a completed workout session to the database.",
            "parameters": {
                "type": "object",
                "properties": {
                    "workout_type": {
                        "type": "string",
                        "description": "Type of workout. Examples: 'chest', 'legs', 'cardio', 'full body'.",
                    },
                    "duration_min": {
                        "type": "integer",
                        "description": "How long the session lasted in minutes.",
                    },
                    "exercises": {
                        "type": "string",
                        "description": 'JSON string of exercise list, each with name, sets, reps or duration. Example: \'[{"name":"Push-ups","sets":3,"reps":15}]\'. Optional.',
                    },
                    "perceived_difficulty": {
                        "type": "integer",
                        "description": "User's effort rating from 1 (easy) to 10 (extreme).",
                    },
                    "notes": {
                        "type": "string",
                        "description": "Optional notes — injuries, skipped sets, how it felt. Default ''.",
                    },
                },
                "required": ["workout_type", "duration_min", "perceived_difficulty"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "get_progress_summary",
            "description": "Retrieve the user's recent workout history and progress trends.",
            "parameters": {
                "type": "object",
                "properties": {
                    "days": {
                        "type": "integer",
                        "description": "How many days back to look. Default 14.",
                    },
                },
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "generate_meal_plan",
            "description": "Generate a personalised meal plan matching dietary restrictions and goals.",
            "parameters": {
                "type": "object",
                "properties": {
                    "meals_per_day": {
                        "type": "integer",
                        "description": "Number of meals per day. Default 3.",
                    },
                    "days": {
                        "type": "integer",
                        "description": "Number of days to plan. Default 1.",
                    },
                    "focus": {
                        "type": "string",
                        "description": "Nutritional focus. Examples: 'high protein', 'low carb', 'vegetarian', 'balanced'. Default 'balanced'.",
                    },
                },
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "lookup_food",
            "description": "Look up estimated nutritional info for a specific food or meal.",
            "parameters": {
                "type": "object",
                "properties": {
                    "query": {
                        "type": "string",
                        "description": "Food to look up. Examples: '100g chicken breast', '1 cup oats', '2 eggs'.",
                    },
                },
                "required": ["query"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "update_profile",
            "description": "Update a field in the user profile after learning new information.",
            "parameters": {
                "type": "object",
                "properties": {
                    "field": {
                        "type": "string",
                        "description": "Profile field name. Valid options: primary_goal, target_weight_kg, age, gender, height_cm, current_weight_kg, fitness_level, available_equipment, workout_days_per_week, preferred_workout_duration_min, injuries_or_conditions, dietary_restrictions, daily_calorie_target, last_workout_summary, current_week_plan, notes_for_agent.",
                    },
                    "value": {
                        "type": "string",
                        "description": "New value as a string (JSON-encode lists/dicts if needed).",
                    },
                },
                "required": ["field", "value"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "calculate_bmr",
            "description": "Calculate Basal Metabolic Rate (BMR) using Mifflin-St Jeor formula.",
            "parameters": {
                "type": "object",
                "properties": {
                    "weight_kg": {
                        "type": "number",
                        "description": "Weight in kilograms.",
                    },
                    "height_cm": {
                        "type": "number",
                        "description": "Height in centimeters.",
                    },
                    "age": {
                        "type": "integer",
                        "description": "Age in years.",
                    },
                    "gender": {
                        "type": "string",
                        "description": "Gender: 'male' or 'female'.",
                    },
                },
                "required": ["weight_kg", "height_cm", "age", "gender"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "calculate_tdee",
            "description": "Calculate Total Daily Energy Expenditure (TDEE) based on BMR and activity level.",
            "parameters": {
                "type": "object",
                "properties": {
                    "bmr": {
                        "type": "number",
                        "description": "Basal Metabolic Rate in calories.",
                    },
                    "activity_level": {
                        "type": "string",
                        "description": "Activity level. One of: 'sedentary', 'light', 'moderate', 'active', 'very_active'.",
                    },
                },
                "required": ["bmr", "activity_level"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "calculate_calorie_goal",
            "description": "Calculate target daily calorie intake based on TDEE and health goal.",
            "parameters": {
                "type": "object",
                "properties": {
                    "tdee": {
                        "type": "integer",
                        "description": "Total Daily Energy Expenditure in calories.",
                    },
                    "goal": {
                        "type": "string",
                        "description": "Fitness goal. One of: 'lose_weight', 'maintain', 'build_muscle'.",
                    },
                },
                "required": ["tdee", "goal"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "calculate_macros",
            "description": "Calculate target daily macronutrient split (protein, carbs, fat) in grams.",
            "parameters": {
                "type": "object",
                "properties": {
                    "calorie_goal": {
                        "type": "integer",
                        "description": "Target daily calories.",
                    },
                    "goal": {
                        "type": "string",
                        "description": "Fitness goal. One of: 'lose_weight', 'maintain', 'build_muscle'.",
                    },
                },
                "required": ["calorie_goal", "goal"],
            },
        },
    },
]


def get_groq_tools():
    """Return the list of tool definitions in Groq/OpenAI format."""
    return GROQ_TOOLS
