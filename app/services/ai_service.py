from typing import List, Dict
from app.models.daily_log import DailyLog, MoodEnum

class AIService:
    @staticmethod
    def analyze_performance(logs: List[DailyLog]) -> Dict:
        if not logs:
            return {
                "pattern_observations": "No data available for analysis.",
                "performance_risks": "N/A",
                "improvement_suggestions": "Start logging your days to get insights.",
                "motivational_insight": "The journey of a thousand miles begins with a single step."
            }

        # Calculate averages
        total_sleep = sum(log.sleep_hours for log in logs)
        avg_sleep = total_sleep / len(logs)
        
        total_focus = sum(log.focus for log in logs)
        avg_focus = total_focus / len(logs)
        
        # Simple heuristics for "AI" analysis
        observations = []
        risks = []
        suggestions = []
        
        if avg_sleep < 6:
            observations.append("Sleep duration is consistently low.")
            risks.append("Risk of burnout and reduced cognitive function.")
            suggestions.append("Try to get at least 7 hours of sleep. Establish a bedtime routine.")
        elif avg_sleep > 9:
            observations.append("Sleep duration is high.")
            suggestions.append("Ensure you are not oversleeping, which can cause grogginess.")
            
        if avg_focus < 5:
            observations.append("Focus levels are reported as low.")
            suggestions.append("Try the Pomodoro technique or meditation to improve concentration.")
            
        # Mock response based on data
        return {
            "pattern_observations": " ".join(observations) if observations else "Your metrics look stable.",
            "performance_risks": " ".join(risks) if risks else "No immediate risks detected.",
            "improvement_suggestions": " ".join(suggestions) if suggestions else "Keep up the good work! Consistency is key.",
            "motivational_insight": "Success is the sum of small efforts, repeated day in and day out."
        }

    @staticmethod
    def generate_weekly_report(logs: List[DailyLog]) -> Dict:
        if not logs:
            return {
                "performance_overview": "No data available for this week.",
                "key_strengths": "N/A",
                "risk_signals": "N/A",
                "optimization_strategy": "Start logging to get insights.",
                "focused_challenge": "Log every day next week."
            }

        # Calculate averages for report
        avg_sleep = sum(log.sleep_hours for log in logs) / len(logs)
        avg_focus = sum(log.focus for log in logs) / len(logs)
        avg_productivity = sum(log.productivity for log in logs) / len(logs)
        workout_days = sum(1 for log in logs if log.workout)
        avg_life_score = sum(log.life_score for log in logs if log.life_score) / len(logs) if logs else 0

        # Logic for report content
        overview = f"This week, you averaged {avg_sleep:.1f} hours of sleep with a focus level of {avg_focus:.1f}/10. Your Life Score average was {int(avg_life_score)}."
        
        strengths = []
        if avg_sleep >= 7: strengths.append("Consistent sleep schedule.")
        if workout_days >= 3: strengths.append("Strong workout frequency.")
        if avg_focus >= 7: strengths.append("High focus levels.")
        if not strengths: strengths.append("Consistent logging habit.")

        risks = []
        if avg_sleep < 6: risks.append("Sleep deprivation impacting cognitive load.")
        if avg_productivity < 5: risks.append("Productivity dip observed mid-week.")
        if workout_days == 0: risks.append("Sedentary lifestyle risk.")

        strategy = "Focus on maintaining your sleep schedule."
        if avg_focus < 6: strategy = "Implement deep work sessions in the morning."
        if avg_productivity < 5 and avg_sleep < 6: strategy = "Fix sleep first; productivity will follow."

        challenge = "Hit the gym 3 times next week." if workout_days < 3 else "Maintain a 8/10 focus streak for 3 days."

        return {
            "performance_overview": overview,
            "key_strengths": ", ".join(strengths),
            "risk_signals": ", ".join(risks) if risks else "None detected.",
            "optimization_strategy": strategy,
            "focused_challenge": challenge
        }
