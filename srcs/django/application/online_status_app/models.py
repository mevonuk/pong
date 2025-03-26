from django.db import models
from django.conf import settings
from django.utils import timezone

class OnlineStatus(models.Model):
	user		= models.OneToOneField(
		settings.AUTH_USER_MODEL,
		# when the related User instance is deleted, 
		# the corresponding OnlineStatus instance will be deleted automatically
		on_delete=models.CASCADE
	)
	is_online	= models.BooleanField(default=False)
	# not in use(use last_login of user model instead)
	last_seen	= models.DateTimeField(default=timezone.now)

	# Update online status and last seen time
	def update_status(self, is_online):
		self.is_online = is_online
		self.last_seen = timezone.now()
		self.save()

	def __str__(self):
		return f"{self.user.username} - {'Online' if self.is_online else 'Offline'}"
