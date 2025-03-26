from django.contrib import admin
from django.contrib.auth.admin import UserAdmin

from .forms import CustomUserCreationForm, CustomUserChangeForm
from .models import CustomUser, EmailVerification

# custom admin class for the CustomUser model
# to extends the default UserAdmin provided by Django
class CustomUserAdmin(UserAdmin):
	add_form = CustomUserCreationForm
	form = CustomUserChangeForm

	model = CustomUser

	# fields to be displayed in the list view for users in the admin panel
	list_display = ('username', 'email', 'is_active',
					'is_staff', 'is_superuser', 'last_login')
	# filters of the list view
	list_filter = ('is_active', 'is_staff', 'is_superuser')
	# Defines how the user model is structured in the detail view
	fieldsets = (
		(None, {'fields': ('username', 'email', 'password',
		'wins', 'losses', 'totalGames', 'profile_image', 'friends')}),
		('Permissions', {'fields': ('is_staff', 'is_active',
			'is_superuser', 'groups', 'user_permissions')}),
		('Dates', {'fields': ('last_login', 'date_joined')})
	)
	# Defines the layout for the user creation form
	add_fieldsets = (
		(None, {
			'classes': ('wide',),
			'fields': ('username', 'email', 'password1', 'password2',
			'is_staff', 'is_active',
			'wins', 'losses', 'totalGames', 'profile_image', 'friends')}
			),
	)
	# allows searching for users by their username or email
	search_fields = ('username', 'email',)
	# Defines the default ordering of users in the admin list
	ordering = ('username',)

# custom admin class for the EmailVerification model
# to handle email verification data for users
class EmailVerificationAdmin(admin.ModelAdmin):
	list_display = ('user', 'verification_code', 'created_at', 'expires_at')
	search_fields = ('user__email',)
	ordering = ('-created_at',)

admin.site.register(CustomUser, CustomUserAdmin)
admin.site.register(EmailVerification, EmailVerificationAdmin)
