from django.contrib import admin
from .models import PongMatchHistory

# customizes the display and functionality of the PongMatchHistory model in the admin interface
class PongMatchHistoryAdmin(admin.ModelAdmin):
	# defines the fields that will be displayed in the list view of the model in the admin panel
	list_display = ("user", "opponent", "user_score", "opponent_score", "played_at")
	# allows filtering of records in the list view based on time match was played
	list_filter = ("played_at",)
	# enables search functionality in the admin interface
	search_fields = ("user__username", "opponent__username")
# registers the PongMatchHistory model with the Django admin interface
# using the custom PongMatchHistoryAdmin class
admin.site.register(PongMatchHistory, PongMatchHistoryAdmin)
