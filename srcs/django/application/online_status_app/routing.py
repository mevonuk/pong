from django.urls import re_path
from online_status_app.consumers import UserStatusConsumer

# URL routing for the WebSocket connections, must end in /user_status/
websocket_urlpatterns = [
	re_path(r'ws/user_status/$', UserStatusConsumer.as_asgi()),
]
