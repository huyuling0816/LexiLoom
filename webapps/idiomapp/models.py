from django.db import models
from django.contrib.auth.models import AbstractUser


class User(AbstractUser):
    username = models.CharField(max_length=100)
    email = models.EmailField(max_length=100, unique=True)
    password = models.CharField(max_length=100)
    avatar = models.URLField(max_length=300, blank=True, null=True)
    current_session_key = models.CharField(max_length=100, blank=True, null=True)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']

    def get_avatar_url(self):
        """Return the correct avatar URL (either Google picture or uploaded file)."""
        if self.avatar and self.avatar.startswith("http"):
            return self.avatar  # Google profile picture
        elif self.avatar:
            return f"/static/profile_images/{self.avatar}"  # Local file avatar URL
        return "/static/profile_images/default_avatar.png"  # Default avatar

class Idiom(models.Model):
    """
    Stores Chinese Idiom.
    """
    idiom = models.CharField(max_length=100)  # Idiom (Chinese)
    pronunciation = models.CharField(max_length=50)  # Pinyin of the idiom
    translation = models.CharField(max_length=100)  # Direct translation of the idiom
    explanation = models.TextField()  # Explanation of the idiom
    updated_time = models.DateTimeField(auto_now=True)  # Last update timestamp


class BattleSession(models.Model):
    """
    Represents a real-time idiom battle session
    """
    player_1 = models.ForeignKey(User, on_delete=models.PROTECT, related_name="battle_1")
    player_2 = models.ForeignKey(User, on_delete=models.PROTECT, related_name="battle_2")
    start_time = models.DateTimeField()  # When the game started
    winner_id = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    player_1_score = models.IntegerField(null=True, blank=True)  # Score of player 1
    player_2_score = models.IntegerField(null=True, blank=True)  # Score of player 2
    player_1_time = models.IntegerField(null=True, blank=True)  # Time to complete for player 1 (in milliseconds)
    player_2_time = models.IntegerField(null=True, blank=True)  # Time to complete for player 2 (in milliseconds)
    status = models.CharField(max_length=20)  # Status of the session (e.g., "completed", "cancelled")


class TestSession(models.Model):
    """
    Stores the details of a user's self-testing session
    """
    test_user = models.ForeignKey(User, on_delete=models.PROTECT)
    start_time = models.DateTimeField()  # When the self-test started
    end_time = models.DateTimeField(null=True, blank=True)  # When the self-test ended
    score = models.IntegerField(null=True, blank=True)  # User's score in the session (Number of correct answers)


class Question(models.Model):
    """
    Stores game questions and answers.
    """
    question = models.CharField(max_length=100)  # Question content
    answer = models.CharField(max_length=100)  # Correct answer
    option_1 = models.CharField(max_length=100)  # First answer option
    option_2 = models.CharField(max_length=100)  # Second answer option
    option_3 = models.CharField(max_length=100)  # Third answer option


class Collection(models.Model):
    """
    Stores user-collected idioms.
    """
    user_id = models.ForeignKey(User, on_delete=models.PROTECT)
    idiom_id = models.ForeignKey(Idiom, on_delete=models.PROTECT)


class Character(models.Model):
    """
    Stores a single Chinese character and its corresponding English translation.
    """
    character = models.CharField(max_length=1, unique=True, help_text="A single Chinese character")
    translation = models.CharField(max_length=255, help_text="English translation of the character")
