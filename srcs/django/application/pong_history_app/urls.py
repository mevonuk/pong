from django.urls import path
from . import views

urlpatterns = [
	# user_history/ calls get_user_matches to get the user's match history
	path('user_history/', views.get_user_matches, name='get_user_matches'),
	# record_match/ calls record_match to handle the action of recording a new match
	path('record_match/', views.record_match, name='record_match'),
]
