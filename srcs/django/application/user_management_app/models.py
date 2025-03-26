
from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils.translation import gettext as _
from .managers import CustomUserManager
from django.utils import timezone
from datetime import timedelta

class CustomUser(AbstractUser):
	# unique identifier for the user is email
	email = models.EmailField(_('email address'), unique=True)
	username = models.CharField(
		_('username'),
		max_length=150,
		unique=False,
		help_text=_('Required. 150 characters or fewer.'),
		error_messages={
			'max_length': _("This username is too long."),
		},
	)

	profile_image = models.ImageField(
		upload_to="profile_images/",
		null=True,
		blank=True,
	)

	friends = models.ManyToManyField('self', blank=True)
	wins = models.IntegerField(default=0)
	totalGames = models.IntegerField(default=0)
	losses = models.IntegerField(default=0)

	USERNAME_FIELD = 'email'
	REQUIRED_FIELDS = ('username',)

	objects = CustomUserManager()

	def __str__(self):
		return self.email

# creates verification code
class EmailVerification(models.Model):
	user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
	verification_code = models.CharField(max_length=6)
	created_at = models.DateTimeField(auto_now_add=True)
	expires_at = models.DateTimeField()

	def save(self, *args, **kwargs):
		if not self.expires_at:
			self.expires_at = timezone.now() + timedelta(minutes=10) # set to 10 min by default
		super().save(*args, **kwargs)

	def __str__(self):
		return f"EmailVerification for {self.user.email}"
