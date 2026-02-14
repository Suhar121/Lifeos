from app.models.daily_log import DailyLog, MoodEnum

class LifeScoreService:
    @staticmethod
    def calculate_score(log: DailyLog) -> int:
        """
        Calculate Life Score (0-100) based on:
        - Sleep (20%): 7-9 hours = 100%, else linear drop
        - Focus (20%): 1-10 scale -> 10 = 100%
        - Productivity (20%): 1-10 scale -> 10 = 100%
        - Mood (20%): Happy/Calm = 100%, Neutral = 70%, Sad/Anxious = 40%
        - Workout (20%): Yes = 100%, No = 0%
        """
        score = 0
        
        # 1. Sleep (Target: 7-9 hours)
        if 7 <= log.sleep_hours <= 9:
            sleep_score = 100
        elif log.sleep_hours > 9:
            sleep_score = max(0, 100 - (log.sleep_hours - 9) * 10)
        else:
            sleep_score = max(0, 100 - (7 - log.sleep_hours) * 15)
        score += sleep_score * 0.2

        # 2. Focus (1-10)
        focus_score = log.focus * 10
        score += focus_score * 0.2

        # 3. Productivity (1-10)
        productivity_score = log.productivity * 10
        score += productivity_score * 0.2

        # 4. Mood
        mood_map = {
            MoodEnum.happy: 100,
            MoodEnum.calm: 100,
            MoodEnum.neutral: 70,
            MoodEnum.sad: 40,
            MoodEnum.anxious: 40
        }
        mood_score = mood_map.get(log.mood, 50)
        score += mood_score * 0.2

        # 5. Workout
        workout_score = 100 if log.workout else 0
        score += workout_score * 0.2

        return int(score)
