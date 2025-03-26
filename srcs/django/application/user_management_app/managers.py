from django.contrib.auth.base_user import BaseUserManager
from django.utils.translation import gettext as _

class CustomUserManager(BaseUserManager):

	# create a regular user (not a superuser)
	def create_user(self, email, password, **extra_fields):
		# ensure the email is in a canonical format
		email = self.normalize_email(email)
		user = self.model(email=email, **extra_fields)
		# hash the password before saving the user
		user.set_password(password)
		# persists the user in the database
		user.save()
		return user

	# create a superuser (admin user)
	def create_superuser(self, email, password, **extra_fields):
		extra_fields.setdefault('is_staff', True)
		extra_fields.setdefault('is_superuser', True)
		extra_fields.setdefault('is_active', True)

		# make sure user is set to staff and superuser
		if extra_fields.get('is_staff') is not True:
			raise ValueError(_('Superuser must have is_staff=True.'))
		if extra_fields.get('is_superuser') is not True:
			raise ValueError(_('Superuser must have is_superuser=True.'))
		return self.create_user(email, password, **extra_fields)

