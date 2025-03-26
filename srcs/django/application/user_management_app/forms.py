from django.contrib.auth.forms import UserCreationForm, UserChangeForm

from .models import CustomUser

# user creation process
class CustomUserCreationForm(UserCreationForm):

	class Meta:
		model = CustomUser
		fields = ('username', 'email', 'profile_image')

# updating an existing CustomUser
class CustomUserChangeForm(UserChangeForm):

	class Meta:
		model = CustomUser
		fields = ('username', 'email', 'profile_image')
