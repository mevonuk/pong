from django.db import models
from django.utils import timezone
from user_management_app.models import CustomUser

class PongMatchHistory(models.Model):
	# auto incrementing primary key, unique identifyer for each match
	id = models.AutoField(primary_key=True)
	user = models.ForeignKey(
		CustomUser,
		on_delete=models.CASCADE, #if player is deleted all corresponding records are deleted
		null=True,
		related_name="matches" #access through user.matches
	)
	opponent = models.ForeignKey(
		CustomUser,
		on_delete=models.SET_NULL, #if opponet deleted sets to NULL
		null=True,
		related_name="opponent_matches"
	)
	user_score = models.IntegerField()
	opponent_score = models.IntegerField()
	played_at = models.DateTimeField(auto_now_add=True)

	# ensures most recent match is displayed first
	class Meta:
		ordering = ["-played_at"]


