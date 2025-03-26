from django.urls import path
from django.conf import settings
from . import views
from django.conf.urls.static import static

urlpatterns = [
	path('register', views.register_user),
	path('send_email_verification', views.send_email_verification, name='send_email_verification'),
	path('login', views.login_user),
	path('logout', views.logout_user),
	path('delete_account', views.delete_account, name='delete_account'),
	path('csrf', views.get_csrf_token),
	path('profile/update', views.update_profile, name='update_profile'),
	path('profile/get', views.get_profile, name='get_profile'),
	path('user', views.get_user, name='get_user'),
	path('search_user', views.search_user, name='search_user'),
	path('add_friend', views.add_friend, name='add_friend'),
	path('remove_friend', views.remove_friend, name='remove_friend'),
	path('verify_email', views.verify_email, name='verify_email'),
	path('resend_verification', views.resend_verification, name='resend_verification'),
]

if settings.DEBUG:
	urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
