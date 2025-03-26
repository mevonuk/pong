# re_path allows URL patterns to be defined using regular expressions
from django.urls import re_path
# imports consumer module where WebSocket connections logic resides
from . import consumers

# list for the URL routing for the WebSocket connections
websocket_urlpatterns = [
	# r'ws/ai/$' - regular expression specifying path must end in /ai/
	# ws stands for WebSocket connection
	# as_asgi() method converts consumer tinto an ASGI application, 
	# as needed for asynchronous WebSocket connections
	re_path(r'ws/ai/$', consumers.GameAiConsumer.as_asgi()),
]
