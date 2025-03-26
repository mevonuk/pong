from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from pong_history_app.models import PongMatchHistory
from user_management_app.models import CustomUser

import json
import uuid
import logging
import random
import asyncio
import math

logger = logging.getLogger(__name__)

# remote
class PongConsumer(AsyncWebsocketConsumer):
	# hold player ids and client numbers to list unique clients connected
	infoPlayer = {
		"players": []
	}
	# holds info concerning each match between clients
	infoMatch = {
		"match": []
	}

	game_group_name = "game_group"
	players = {}

	# connect a new or returning player
	async def connect(self):
		self.player_id = self.scope["user"].id
		# if are reconnecting just return
		if await self.reconnect() == 0:
			return
		await self.accept()
		# create a new player id - client number pair (if new player)
		obj = {
			'player_id': self.player_id,
			'client': self.scope["client"]
		}
		# add new player to player list
		self.infoPlayer['players'].append(obj)
		await self.channel_layer.group_add(self.game_group_name, self.channel_name)
		# if there are an even number of players, start games
		if len(self.infoPlayer["players"]) % 2 == 0:
			try:
				await self.send(
					text_data=json.dumps({
						"type": "playerId", "playerId": self.player_id,
					})
				)
				await self.createGame()
			except:
				logger.info("ERROR socket probably closed.")
		else:
			try:
				await self.send(
					text_data=json.dumps({
						"type": "playerId", "playerId": self.player_id,
						'message': 'Waiting for Opponent',
					})
				)
			except:
				logger.info("ERROR socket probably closed.")

	# reconnect a player, set paddle back to black, update client number
	async def reconnect(self):
		# need to update the client number because it changes when you reconnect
		for c in self.infoPlayer["players"]:
			if c["player_id"] == self.player_id:
				c["client"] = self.scope["client"]
		# go to the match that the player is in and send info to frontend
		# based on whether it is player1 or 2
		for match in self.infoMatch["match"]:
			if match["playerOne"]["id"] == self.player_id:
				await self.accept()
				await self.channel_layer.group_add(self.game_group_name, self.channel_name)
				match["playerOne"]["color"] = "black"
				match["playerOne"]["connected"] = True
				response = {
					"type": "reconnection",
					"matchId" : match["matchId"],
					"me" : match["playerOne"],
					"opponent" : match["playerTwo"],
					"id" : match["playerOne"]["id"],
					"ball": match["ball"],
					"side": "left",
					"ctrlUp": "w",
					"ctrlDown": "s"
				}
				try:
					await self.send(text_data=json.dumps(response))
				except:
					logger.info("ERROR socket probably closed.")
				return 0
			elif match["playerTwo"]["id"] == self.player_id:
				await self.accept()
				await self.channel_layer.group_add(self.game_group_name, self.channel_name)
				match["playerTwo"]["color"] = "black"
				match["playerTwo"]["connected"] = True
				response = {
					"type": "reconnection",
					"matchId" : match["matchId"],
					"me" : match["playerTwo"],
					"opponent" : match["playerOne"],
					"id" : match["playerTwo"]["id"],
					"ball": match["ball"],
					"side": "right",
					"ctrlUp": "ArrowUp",
					"ctrlDown": "ArrowDown"
				}
				try:
					await self.send(text_data=json.dumps(response))
				except:
					logger.info("ERROR socket probably closed.")
				return 0
		return 1

	# client has disconnected
	async def disconnect(self, close_code):
		client = self.scope["client"]
		# find the client in the player list
		toRemove = next((c for c in self.infoPlayer["players"] if c["client"] == client), None)

		findMatch = None
		
		# if the disconnected player is found, identify its match
		if (toRemove):
			findMatch = next(
			(m for m in self.infoMatch["match"] 
				if m["playerOne"]["id"] == toRemove["player_id"] 
				or m["playerTwo"]["id"] == toRemove["player_id"]), 
			None)

		#change the color of the player who has disconnected
		if findMatch and findMatch["playerOne"]["id"] == toRemove["player_id"]:
			findMatch["playerOne"]["connected"] = False
			findMatch["playerOne"]["color"] = "red"

		elif findMatch and findMatch["playerTwo"]["id"] == toRemove["player_id"]:
			findMatch["playerOne"]["connected"] = False
			findMatch["playerTwo"]["color"] = "red"

		# if both players disconnect, set match status to false - game over
		if findMatch and findMatch["playerOne"]["connected"] == False and findMatch["playerTwo"]["connected"] == False:
			findMatch["status"] = False

	# recieve info from frontend
	async def receive(self, text_data):
		try:
			data = json.loads(text_data)
			message_type = data.get("type")

			if message_type == "game.starting":
				matchId = await self.initialisation(data)
				asyncio.create_task(self.loop(matchId))
				return
			elif message_type == "player.moved":
				await self.movePaddle(data)
				return
			else:
				response = {
					"type": "error",
					"message": f"Unknown message type: {message_type}"
				}

			# Envoyer la réponse au client
			try:
				await self.send(text_data=json.dumps(response))
			except:
				logger.info("ERROR socket probably closed.")

		except json.JSONDecodeError:
			try:
				await self.send(text_data=json.dumps({
					"type": "error",
					"message": "Invalid JSON format"
				}))
			except:
				logger.info("ERROR socket probably closed.")

	####################### INIT MATCH ############################

	#send to all players
	async def createGame(self):
		newPlayers = self.infoPlayer["players"][-2:]
		# set up two plaayers specifying their side of the board and their controls
		obj = {
			'status': True,
			'matchId' : str(uuid.uuid4()),
			'playerOne': {
				"connected" : True,
				"id": newPlayers[0]['player_id'],
				"side": "left",
				"ctrlUp": "w",
				"ctrlDown": "s"
			},
			'playerTwo': {
				"connected" : True,
				"id": newPlayers[1]['player_id'],
				"side": "right",
				"ctrlUp": "ArrowUp",
				"ctrlDown": "ArrowDown"
			}
		}
		self.infoMatch['match'].append(obj)
		await self.channel_layer.group_send(
			self.game_group_name,
			{
				"type": "game_init",
				"message": obj
			}
		)

	# tell frontend to start game
	async def game_init(self, event):
		try:
			await self.send(text_data=json.dumps({
				"type": "game.init",
				"message": event["message"]
			}))
		except:
			logger.info("ERROR socket probably closed.")

	######################## GAME LOOP #############################

	# continue match until match status is False
	async def loop(self, matchId):
		m = next((m for m in self.infoMatch["match"] if m["matchId"] == matchId), None)

		if m:
			while (m["status"]):
				await asyncio.sleep(1 / 60)
				await self.calculBallMovement(matchId)
				await self.send_gamestate(matchId)

		if m["status"] == False:
			if m in self.infoMatch["match"]:
				self.infoMatch["match"].remove(m)

	################### GAME SEND GAMESTATE ########################

	async def send_gamestate(self, matchId):
		matchPlayed = next((m for m in self.infoMatch["match"] if m["matchId"] == matchId), None)

		if matchPlayed:
			response = {
				"matchId": matchPlayed["matchId"],
				"playerOne": matchPlayed["playerOne"],
				"playerTwo": matchPlayed["playerTwo"],
				"ball": matchPlayed["ball"],
				"scores": matchPlayed["scores"]
			}
			if matchPlayed["status"]:
				try:
					await self.channel_layer.group_send(
					self.game_group_name,
					{
						"type": "game_state",
						"message": response
					})
				except Exception as e:
					print(f"Erreur lors de l'envoi des données : {e}")

	async def game_state(self, event):
		try:
			await self.send(text_data=json.dumps({
				"type": "game_state",
				"message": event["message"]
			}))
		except:
			logger.info("ERROR socket probably closed.")

	####################### GAME LOGIC #############################
	#m = match
	async def calculBallMovement(self, matchId):
		m = next((m for m in self.infoMatch["match"] if m["matchId"] == matchId), None)

		if m:
			if (m["ball"]["y"] + m["ball"]["vy"] <= 0
				or m["ball"]["y"] + m["ball"]["size"] + m["ball"]["vy"]
				>=  m["canvas"]["canvas_height"]):
				m["ball"]["vy"] *= -1
			m["ball"]["x"] += m["ball"]["vx"]
			m["ball"]["y"] += m["ball"]["vy"]
			await self.ballWallCollision(m)

	async def ballWallCollision(self, m):
		try :
			if (m["ball"]["y"] + m["ball"]["vy"] <= m["playerTwo"]["y"] + m["playerTwo"]["height"]
				and m["ball"]["x"] + m["ball"]["size"] + m["ball"]["vx"] >= m["playerTwo"]["x"]
				and m["ball"]["y"] + m["ball"]["vy"] > m["playerTwo"]["y"]):

				paddleCenter = m["playerTwo"]["y"] + m["playerTwo"]["height"] / 2
				ballCenter = m["ball"]["y"] + m["ball"]["size"] / 2
				relativeIntersectY = (paddleCenter - ballCenter) / (m["playerTwo"]["height"] / 2)

				bounceAngle = relativeIntersectY * 0.75

				speed = math.sqrt(m["ball"]["vx"] * m["ball"]["vx"] + m["ball"]["vy"] * m["ball"]["vy"])
				m["ball"]["vx"] = -speed * math.cos(bounceAngle) * m["ball"]["accel"]
				m["ball"]["vy"] = speed * math.sin(bounceAngle) * m["ball"]["accel"]
				m["ball"]["x"] = m["playerTwo"]["x"] - m["ball"]["size"]

			elif (m["ball"]["y"] + m["ball"]["vy"] >= m["playerOne"]["y"]
				and m["ball"]["y"] + m["ball"]["vy"] <= m["playerOne"]["y"] + m["playerOne"]["height"]
				and m["ball"]["x"] + m["ball"]["vx"] <= m["playerOne"]["x"] + m["playerOne"]["width"]):

				paddleCenter = m["playerOne"]["y"] + m["playerOne"]["height"] / 2
				ballCenter = m["ball"]["y"] + m["ball"]["size"] / 2
				relativeIntersectY = (paddleCenter - ballCenter) / (m["playerOne"]["height"] / 2)

				bounceAngle = relativeIntersectY * 0.75

				speed = math.sqrt(m["ball"]["vx"] * m["ball"]["vx"] + m["ball"]["vy"] * m["ball"]["vy"])
				m["ball"]["vx"] = speed * math.cos(bounceAngle)
				m["ball"]["vy"] = speed * math.sin(bounceAngle)
				m["ball"]["x"] = m["playerOne"]["x"] + m["ball"]["size"]

			elif (m["ball"]["x"] + m["ball"]["vx"] < m["playerOne"]["x"]):
				m["playerTwo"]["score"] += 1
				self.resetBall(m)
				await self.checkScore(m)

			elif (m["ball"]["x"] + m["ball"]["vx"] > m["playerTwo"]["x"] + m["playerTwo"]["width"]):
				m["playerOne"]["score"] += 1
				self.resetBall(m)
				await self.checkScore(m)
		except:
			return

	async def checkScore(self, m):
		try:
			if (m["playerOne"]["score"] == 10):
				m["status"] = False
				await self.sendMatchResult(m, m["playerOne"], m["playerTwo"])
				await self.cleanArray(m)
				# Record match history directly
				await self.record_match_history(
					user_id=m["playerOne"]["id"],
					opponent_id=m["playerTwo"]["id"],
					user_score=m["playerOne"]["score"],
					opponent_score=m["playerTwo"]["score"]
				)
			elif (m["playerTwo"]["score"] == 10):
				m["status"] = False
				await self.sendMatchResult(m, m["playerTwo"], m["playerOne"])
				await self.cleanArray(m)
				# Record match history directly
				await self.record_match_history(
					user_id=m["playerOne"]["id"],
					opponent_id=m["playerTwo"]["id"],
					user_score=m["playerOne"]["score"],
					opponent_score=m["playerTwo"]["score"]
				)
		except:
			return

	async def record_match_history(self, user_id, opponent_id, user_score, opponent_score):
		@database_sync_to_async
		def save_match_history():
			user = CustomUser.objects.get(id=user_id)
			opponent = CustomUser.objects.get(id=opponent_id)

			# Record match from user's perspective
			PongMatchHistory.objects.create(
				user=user,
				opponent=opponent,
				user_score=user_score,
				opponent_score=opponent_score
			)

			# Record match from opponent's perspective
			PongMatchHistory.objects.create(
				user=opponent,
				opponent=user,
				user_score=opponent_score,
				opponent_score=user_score
			)

		try:
			await save_match_history()
		except Exception as e:
			logger.error(f"Failed to record match history: {str(e)}")

	async def cleanArray(self, m):
		try:
			p1 = next((p for p in self.infoPlayer["players"] if p["player_id"] == m["playerOne"]["id"]), None)
			if p1 in self.infoPlayer["players"]:
				self.infoPlayer["players"].remove(p1)

			p2 = next((p for p in self.infoPlayer["players"] if p["player_id"] == m["playerTwo"]["id"]), None)
			if p2 in self.infoPlayer["players"]:
				self.infoPlayer["players"].remove(p2)
			if m in self.infoMatch["match"]:
				self.infoMatch["match"].remove(m)
		except:
			return

	#################### SEND VICTORY ##########################

	async def sendMatchResult(self, m, winner, loser):
		try:
			response = {
				"matchId": m["matchId"],
				"winner": winner,
				"loser": loser, 
			}
			await self.channel_layer.group_send(
			self.game_group_name,
			{
				"type": "game_result",
				"message": response
			})
		except:
			return

	async def game_result(self, event):
		try:
			await self.send(text_data=json.dumps({
				"type": "game_result",
				"message": event["message"]
			}))
		except:
			logger.info("ERROR socket probably closed.")

	#################### PLAYER MOVE ##########################

	async def movePaddle(self, data):
		matchId = data.get("matchId", None)
		ma = next((m for m in self.infoMatch["match"] if m["matchId"] == matchId), None)

		if ma:
			playerId = data.get("playerId")
			if (ma["playerOne"]["id"] == playerId):
				direction = data.get("direction")
				if (direction == "up" and ma["playerOne"]["y"] > 0):
					ma["playerOne"]["y"] -= ma["playerOne"]["step"]
				elif (direction == "down" and ma["playerOne"]["y"] < ma["canvas"]["canvas_height"] - ma["playerOne"]["height"]):
					ma["playerOne"]["y"] += ma["playerOne"]["step"]
			elif (ma["playerTwo"]["id"] == playerId):
				direction = data.get("direction")
				if (direction == "up" and ma["playerTwo"]["y"] > 0):
					ma["playerTwo"]["y"] -= ma["playerTwo"]["step"]
				elif (direction == "down" and ma["playerTwo"]["y"] < ma["canvas"]["canvas_height"] - ma["playerOne"]["height"]):
					ma["playerTwo"]["y"] += ma["playerTwo"]["step"]

	##################### INITIALISATION ##########################

	async def initialisation(self, data):
		matchId = data.get("matchId", None)
		matchPlaying = next((m for m in self.infoMatch["match"] if m["matchId"] == matchId), None)

		if matchPlaying:
			canvas = data.get("canvas", {})
			playerId = data.get("playerId")

			aspect = 16/9
			canvas_height = 100
			canvas_width = canvas_height * aspect
			size = canvas_height  / 45 #size of ball
			step = 100/60 #size of paddle step

			matchPlaying["canvas"] = {"canvas_height": canvas_height, "canvas_width": canvas_width}
			if (matchPlaying["playerOne"]["id"] == playerId):
				matchPlaying["playerOne"].update({
					"id": playerId,
					"side": "left",
					"x": size,
					"y": canvas_height * 0.4,
					"width": size,
					"height": size * 9,
					"color": "black",
					"step": step,
					"score": 0
					})
			elif (matchPlaying["playerTwo"]["id"] == playerId):
				matchPlaying["playerTwo"].update({
					"id": playerId,
					"side": "right",
					"x": canvas_width - 2*size,
					"y": canvas_height * 0.4,
					"width": size,
					"height": size * 9,
					"color": "black",
					"step": step,
					"score": 0
					})
			matchPlaying["ball"] = {
				"x": canvas_width / 2,
				"y": canvas_height / 2,
				"size": size,
				"color": "black",
				"speed": 1,
				"accel": 1.05,
				"vx": 1,
				"vy": 2 / 5
				}
			matchPlaying["scores"] = {"scoreMax": 10}

			return matchId
	
	# place ball in center of canvas and give it a random initial velocity
	def resetBall(self, m):
		try:
			m["ball"]["x"] = m["canvas"]["canvas_width"] / 2
			m["ball"]["y"] = m["canvas"]["canvas_height"]  / 2

			angle = random.random() * math.pi / 3
			ran = random.random()
			direction = 1
			if ran > 0.5:
				direction = -1
			ran = random.random()
			phase = math.pi
			if ran > 0.5:
				phase = 0
			angle = direction * angle + phase
			m["ball"]["vx"] = m["ball"]["speed"] * math.cos(angle)
			m["ball"]["vy"] = m["ball"]["speed"] * math.sin(angle)
		except:
			return
