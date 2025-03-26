from channels.middleware import BaseMiddleware
from channels.auth import AuthMiddlewareStack
from django.contrib.auth.models import AnonymousUser
from django.db import close_old_connections
import jwt
from django.conf import settings
from django.contrib.auth import get_user_model
from django.contrib.sessions.backends.db import SessionStore
from channels.db import database_sync_to_async
import logging
logger = logging.getLogger(__name__)

class JWTAuthMiddleware(BaseMiddleware):
	async def __call__(self, scope, receive, send):
		close_old_connections()

		headers = dict(scope.get('headers', []))
		cookie_header = headers.get(b'cookie', b'').decode()
		cookies = {}
		if cookie_header:
			for item in cookie_header.split('; '):
				if '=' in item:
					name, value = item.split('=', 1)
					cookies[name] = value

		session_cookie = cookies.get(settings.SESSION_COOKIE_NAME)

		try:
			if session_cookie:
				jwt_data = jwt.decode(
					session_cookie,
					settings.JWT_SECRET_KEY,
					algorithms=["HS256"]
				)
				session_key = jwt_data.get('session_key')

				@database_sync_to_async
				def get_user_from_session():
					session_store = SessionStore(session_key)
					user_id = session_store.get('_auth_user_id')
					if user_id:
						User = get_user_model()
						return User.objects.get(id=user_id)
					return None

				user = await get_user_from_session()
				if user:
					scope['user'] = user
				else:
					scope['user'] = AnonymousUser()
			else:
				scope['user'] = AnonymousUser()
		except Exception as e:
			logger.error(f"Auth error: {str(e)}")
			scope['user'] = AnonymousUser()

		return await super().__call__(scope, receive, send)

def JWTAuthMiddlewareStack(inner):
	return JWTAuthMiddleware(AuthMiddlewareStack(inner))
