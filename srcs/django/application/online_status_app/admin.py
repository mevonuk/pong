# django.contrib.admin - imports Django's built-in admin functionality
# to register models and customize the admin interface
from django.contrib import admin
from .models import OnlineStatus

# custom class extending admin.AdminModel
class OnlineStatusAdmin(admin.ModelAdmin):
	# list_display - defines the columns to display in the list view for OnlineStatus
	list_display = ('user', 'is_online', 'last_seen')

# admin.site.register() registers the OnlineStatus model with the Django admin interface
# along with the custom admin class (OnlineStatusAdmin)
# OnlineStatus instances can then be managed in the Django admin UI
# using the customized settings defined in OnlineStatusAdmin
admin.site.register(OnlineStatus, OnlineStatusAdmin)
