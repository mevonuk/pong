from django.http import JsonResponse
from django.contrib.auth.decorators import login_required
from .models import PongMatchHistory
from django.db import models

import logging
import json

logger = logging.getLogger(__name__)

# retrieves the match history of the currently logged-in user and returns relevant statistics
def get_user_matches(request):
	try:
		user = request.user #get current user
		all_matches = PongMatchHistory.objects.filter(user=user)
		total_games = all_matches.count()

		# count wins and losses to get win_percent
		wins = all_matches.filter(user_score__gt=models.F('opponent_score')).count()
		losses = total_games - wins
		win_percent = round((wins / total_games * 100) if total_games > 0 else 0, 1)

		# retrieve 10 most recent matches
		recent_matches = PongMatchHistory.objects.filter(user=user).order_by('-played_at')[:10]

		matches_data = []
		for match in recent_matches:
			if match.opponent: #check if opponent exists
				opponent_username = match.opponent.username
				opponent_profile_image = match.opponent.profile_image.url if match.opponent.profile_image else None
			else:
				opponent_username = 'Deleted User'
				opponent_profile_image = None

			#add match details
			matches_data.append({
				'id': match.id,
				'opponent': {
					'username': opponent_username,
					'profile_image': opponent_profile_image
				},
				'user_score': match.user_score,
				'opponent_score': match.opponent_score,
				'played_at': match.played_at,
				'result': 'Win' if match.user_score > match.opponent_score else 'Loss'
			})

		return JsonResponse({
			'status': 'success',
			'data': {
				'total_games': total_games,
				'wins': wins,
				'losses': losses,
				'win_percent': win_percent,
				'matches': matches_data
			}
		})

	except Exception as e:
		logger.error(f"Error in get_user_matches: {str(e)}")
		return JsonResponse({
			'status': 'error',
			'message': str(e)
		}, status=500)

@login_required #user must be logged in to record a responce
# handles the recording of a new match between the logged-in user and an opponent
def record_match(request):
	if request.method != 'POST':
		return JsonResponse({
			'status': 'error',
			'message': 'Invalid request method'
		}, status=405)

	try:
		data = json.loads(request.body)
		opponent_id = data.get('opponent_id')
		user_score = data.get('user_score')
		opponent_score = data.get('opponent_score')

		# Record match from user's perspective
		PongMatchHistory.objects.create(
			user=request.user,
			opponent_id=opponent_id,
			user_score=user_score,
			opponent_score=opponent_score
		)

		# Record match from opponent's perspective
		PongMatchHistory.objects.create(
			user_id=opponent_id,
			opponent=request.user,
			user_score=opponent_score,
			opponent_score=user_score
		)

		return JsonResponse({
			'status': 'success',
			'message': 'Match recorded successfully'
		})

	except Exception as e:
		return JsonResponse({
			'status': 'error',
			'message': str(e)
		}, status=500)
