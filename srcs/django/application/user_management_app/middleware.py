import time
from importlib import import_module

from django.conf import settings
from django.contrib.sessions.backends.base import UpdateError
from django.contrib.sessions.exceptions import SessionInterrupted
from django.utils.cache import patch_vary_headers
from django.utils.deprecation import MiddlewareMixin
from django.utils.http import http_date
from django.contrib.sessions.middleware import SessionMiddleware
from datetime import datetime, timezone, timedelta
import time, jwt

class CustomSessionMiddleware(SessionMiddleware):
	# intercepts incoming requests and checks for a session key in the cookies
	def process_request(self, request):
		tmp_session_key = request.COOKIES.get(settings.SESSION_COOKIE_NAME)
		session_key = tmp_session_key
		try:
			if tmp_session_key is not None:
				# jwt.decode() function is used to decode the JWT token
				# stored in the session cookie (tmp_session_key)
				jwt_decode = jwt.decode(
					tmp_session_key,
					getattr(settings, "JWT_SECRET_KEY", ""),
					leeway=5,
					algorithms=["HS256"]
				)
				session_key = jwt_decode["session_key"]
		except jwt.ExpiredSignatureError:
			print("JWT expired")
			session_key = None
			pass
		except jwt.exceptions.DecodeError:
			print("JWT decode error")
			session_key = None
			pass
		request.session = self.SessionStore(session_key)

	# processes the outgoing response and handles saving session data to the cookie
	def process_response(self, request, response):
		"""
		If request.session was modified, or if the configuration is to save the
		session every time, save the changes and set a session cookie or delete
		the session cookie if the session has been emptied.
		"""
		try:
			accessed = request.session.accessed
			modified = request.session.modified
			empty = request.session.is_empty()
		except AttributeError:
			return response
		# First check if we need to delete this cookie.
		# The session should be deleted only if the session is entirely empty.
		if settings.SESSION_COOKIE_NAME in request.COOKIES and empty:
			response.delete_cookie(
				settings.SESSION_COOKIE_NAME,
				path=settings.SESSION_COOKIE_PATH,
				domain=settings.SESSION_COOKIE_DOMAIN,
				samesite=settings.SESSION_COOKIE_SAMESITE,
			)
			patch_vary_headers(response, ('Cookie',))
		else:
			if accessed:
				patch_vary_headers(response, ('Cookie',))
			if (modified or settings.SESSION_SAVE_EVERY_REQUEST) and not empty:
				if request.session.get_expire_at_browser_close():
					max_age = None
					expires = None
				else:
					max_age = request.session.get_expiry_age()
					expires_time = time.time() + max_age
					expires = http_date(expires_time)
				# Save the session data and refresh the client cookie.
				# Skip session save for 500 responses, refs #3881.
				if response.status_code != 500:
					try:
						request.session.save()
					except UpdateError:
						raise SessionInterrupted(
							"The request's session was deleted before the "
							"request completed. The user may have logged "
							"out in a concurrent request, for example."
						)
					jwt_session_key = jwt.encode(
						{
							"session_key": request.session.session_key,
							"exp": datetime.now(timezone.utc) + timedelta(seconds=14400), # 4 hours
							"iat": datetime.now(timezone.utc),
						},
						getattr(settings, "JWT_SECRET_KEY", ""),
						algorithm="HS256"
					)
					response.set_cookie(
						settings.SESSION_COOKIE_NAME,
						# request.session.session_key,
						jwt_session_key,
						max_age=max_age,
						expires=expires, domain=settings.SESSION_COOKIE_DOMAIN,
						path=settings.SESSION_COOKIE_PATH,
						secure=settings.SESSION_COOKIE_SECURE or None,
						httponly=settings.SESSION_COOKIE_HTTPONLY or None,
						samesite=settings.SESSION_COOKIE_SAMESITE,
					)
		return response
