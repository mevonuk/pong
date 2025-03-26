import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend_project.settings')
django.setup()

from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.security.websocket import AllowedHostsOriginValidator
from channels.auth import AuthMiddlewareStack
from django.urls import path
from local_multi_game_app.routing import websocket_urlpatterns as local_multi_game_app_ws
from local_normal_game_app.routing import websocket_urlpatterns as local_normal_game_app_ws
from local_tournement_app.routing import websocket_urlpatterns as local_tournement_app_ws
from local_ai_game_app.routing import websocket_urlpatterns as local_ai_game_app_ws
from remote_normal_game_app.routing import websocket_urlpatterns as remote_normal_game_app_ws
from online_status_app.routing import websocket_urlpatterns as online_status_app_ws
from backend_project.middleware import JWTAuthMiddlewareStack

# application = ProtocolTypeRouter({
#     "http": get_asgi_application(),
#     "websocket": AllowedHostsOriginValidator(
#         URLRouter(websocket_urlpatterns)
#     ),
# })

application = ProtocolTypeRouter({
	"http": get_asgi_application(),
	"websocket": AllowedHostsOriginValidator(
		JWTAuthMiddlewareStack(
			URLRouter(
				local_multi_game_app_ws +
				local_normal_game_app_ws +
				local_tournement_app_ws +
				local_ai_game_app_ws +
				remote_normal_game_app_ws +
				online_status_app_ws
			)
		)
	),
})
