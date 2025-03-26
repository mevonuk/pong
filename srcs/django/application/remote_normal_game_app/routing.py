from django.urls import re_path
from . import consumers

# WebSocket URL path ending in /pong/
websocket_urlpatterns = [
	re_path(r'ws/pong/$', consumers.PongConsumer.as_asgi()),
]
