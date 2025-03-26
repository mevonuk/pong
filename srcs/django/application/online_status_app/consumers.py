from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
# used for handling time-related operations
from django.utils import timezone
from .models import OnlineStatus

class UserStatusConsumer(AsyncWebsocketConsumer): #will handle WebSockets asynchonoously
	async def connect(self):
		user = self.scope["user"]
		# if user is not authenticated, websocket is closed immediately
		if not user.is_authenticated:
			await self.close()
			return

		# connection is accepted, client is connected
		await self.accept()
		await self.update_user_status(True)

	# called when WebSocket connection is closed
	async def disconnect(self, close_code):
		if self.scope["user"].is_authenticated:
			await self.update_user_status(False)

	# @database_sync_to_async - decorator to ensure the database operation is run in separate thread
	# can then safely use Django's ORM (which is synchronous) in the asynchronous consumer
	@database_sync_to_async
	def update_user_status(self, is_online):
		try:
			if not self.scope["user"].is_authenticated:
				return
			user = self.scope["user"]
			# get_or_create - retrieves the OnlineStatus object for the user if it exists
			online_status, created = OnlineStatus.objects.get_or_create(
				user=user,
				defaults={'is_online': False, 'last_seen': timezone.now()}
			)
			online_status.update_status(is_online)
		except Exception as e:
			print(f"Error updating user status: {e}")
