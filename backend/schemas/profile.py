"""
Pydantic schemas for UserProfile — onboarding and update flows.
"""
from pydantic import BaseModel


class ProfileUpdateRequest(BaseModel):
    full_name: str | None = None
    primary_goal: str | None = None  # "lose_weight"|"build_muscle"|"endurance"|"general_fitness"
    target_weight_kg: float | None = None
    age: int | None = None
    gender: str | None = None
    height_cm: float | None = None
    current_weight_kg: float | None = None
    fitness_level: str | None = None  # "beginner"|"intermediate"|"advanced"
    available_equipment: list[str] | None = None
    workout_days_per_week: int | None = None
    preferred_workout_duration_min: int | None = None
    injuries_or_conditions: str | None = None
    dietary_restrictions: str | None = None
    daily_calorie_target: int | None = None
    notes_for_agent: str | None = None


class ProfileResponse(BaseModel):
    id: str
    user_id: str
    full_name: str | None = None
    primary_goal: str | None
    target_weight_kg: float | None
    age: int | None
    gender: str | None
    height_cm: float | None
    current_weight_kg: float | None
    fitness_level: str | None
    available_equipment: list[str] | None
    workout_days_per_week: int | None
    preferred_workout_duration_min: int | None
    injuries_or_conditions: str | None
    dietary_restrictions: str | None
    daily_calorie_target: int | None
    last_workout_summary: str | None
    current_week_plan: str | None
    notes_for_agent: str | None
    is_complete: bool = False  # computed

    model_config = {"from_attributes": True}

    def model_post_init(self, __context) -> None:
        # Profile is "complete" if the core onboarding fields are filled
        self.is_complete = all(
            [self.primary_goal, self.age, self.height_cm, self.current_weight_kg, self.fitness_level]
        )
