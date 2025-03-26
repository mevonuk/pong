# see comments for routing.py in loacl_ai_game
from django.urls import re_path
from . import consumers

websocket_urlpatterns = [
	re_path(r'ws/multi/$', consumers.GameMultiConsumer.as_asgi()),
]
