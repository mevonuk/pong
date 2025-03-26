# see consumer.py in local_ai_game for definitions of following:
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async

import uuid
import random
import json
import logging
import asyncio
import math

logger = logging.getLogger(__name__)

# multi
class GameMultiConsumer(AsyncWebsocketConsumer):

	infoMatch = {
		"match": []
	}
	#connection to the WebSocket
	async def connect(self):
		logger.info("WebSocket connection attempt")
		try:
			await self.accept()
			logger.info("WebSocket connection accepted")
		except Exception as e:
			logger.error(f"WebSocket connection failed: {e}")
		await self.createGame()

	#interrupt the Websocket
	async def disconnect(self, close_code):
		logger.info(f"WebSocket disconnected with code: {close_code}")
		m = next((m for m in self.infoMatch["match"] if m["client"] == self.scope["client"]), None)
		if m:
			self.infoMatch["match"].remove(m)

	#Manage the info receive
	async def receive(self, text_data):
		try:
			# Decode Json data
			data = json.loads(text_data)

			# search for the type of the message
			message_type = data.get("type")

			# Manage the type of the msg
			if message_type == "game.starting":
				matchId = await self.initialisation(data)
				asyncio.create_task(self.loop(matchId))
				return
			elif message_type == "player.moved":
				await self.movePlayer(data)
				return
			elif message_type == "player.pause":
				await self.pause(data)
				return
			elif message_type == "player.unpause":
				await self.unpause(data)
				return
			else:
				response = {
					"type": "error",
					"message": f"Unknown message type: {message_type}"
				}

			try:
				# Envoyer la réponse au client
				self.send(text_data=json.dumps(response))
			except:
				logger.info("ERROR socket probably closed.")

		except json.JSONDecodeError:
			logger.error("Error: Invalid JSON received")
			try:
				self.send(text_data=json.dumps({
					"type": "error",
					"message": "Invalid JSON format"
				}))
			except:
				logger.info("ERROR socket probably closed.")

	async def pause(self, data):
		matchId = data.get("matchId")
		m = next((m for m in self.infoMatch["match"] if m["matchId"] == matchId), None)
		if m:
			m["status"] = "pause"

	async def unpause(self, data):
		matchId = data.get("matchId")
		m = next((m for m in self.infoMatch["match"] if m["matchId"] == matchId), None)
		if m:
			m["status"] = "True"
		asyncio.create_task(self.loop(matchId))

	# create game object with three players, status is True
	async def createGame(self):
		obj = {
			'client': self.scope["client"],
			'matchId' : str(uuid.uuid4()),
			'status': "True",
			'playerOne': {
			},
			'playerTwo': {
			},
			'playerThree':{
			}
		}
		self.infoMatch['match'].append(obj)
		response = {
			"type": "info",
			"matchId": obj["matchId"],
		}
		try:
			await self.send(text_data=json.dumps(response))
		except:
			logger.info("problem here")

	# initialize all characteristics of players and ball
	# based on info of window size
	async def initialisation(self, data):
		start_data = data.get("start", {})
		matchId = start_data.get("matchId")
		m = next((m for m in self.infoMatch["match"] if m["matchId"] == matchId), None)
		if m:
			canvas_height = start_data.get("windowHeight", 0)
			canvas_width = start_data.get("windowWidth", 0)

			canvas_dim = min(canvas_height, canvas_width) * .8
			centerY = canvas_dim / 2
			radius = centerY - 10
			centerX = centerY

			#sizes of paddle and speed adjusted to canvas size
			size = int(canvas_dim  / 45)

			m["maxScore"] = 10
			m["lastTouch"] = None
			m["canvas"] = {"dim": canvas_dim, "centerX": centerX, "centerY": centerY, "radius": radius, "size": size}
			m["playerOne"].update({
				"name": "player1",
				"color": "red",
				"startAngle": 0,
				"endAngle": math.pi / 8,
				"deltaAngle": math.pi / 8,
				"startZone": 0,
				"endZone": 2 * math.pi / 3,
				"width": size,
				"score": 0
			})
			m["playerTwo"].update({
				"name": "player2",
				"color": "blue",
				"startAngle": 2 * math.pi / 3,
				"endAngle": 2 * math.pi / 3 + math.pi / 8,
				"deltaAngle": math.pi / 8,
				"startZone": 2 * math.pi / 3,
				"endZone": 4 * math.pi / 3,
				"width": size,
				"score": 0
			})
			m["playerThree"].update({
				"name": "player3",
				"color": "green",
				"startAngle": 4 * math.pi / 3,
				"endAngle": 4 * math.pi / 3 + math.pi / 8,
				"deltaAngle": math.pi / 8,
				"startZone": 4 * math.pi / 3,
				"endZone": 2 * math.pi,
				"width": size,
				"score": 0
			})
			m["ball"] = {
				"x": centerX,
				"y": centerY,
				"size": size,
				"color": "black",
				"speed": size,
				"accel": 1.05,
				"vx": 0,
				"vy": 0
			}
			# initialise ball velocity using resetBall function
			self.resetBall(matchId)
		return matchId

	# game loop, maintained until match status is False
	async def loop(self, matchId):
		m = next((m for m in self.infoMatch["match"] if m["matchId"] == matchId), None)
		if m:
			while (m["status"] == "True"):
				await asyncio.sleep(1 / 60)
				await self.calculBallMovement(matchId)
				await self.send_gamestate(matchId)

			if m and m["status"] == "False":
				self.infoMatch["match"].remove(m)

	# send game state to js at frontend
	async def send_gamestate(self, matchId):
		m = next((m for m in self.infoMatch["match"] if m["matchId"] == matchId), None)
		if m:
			
			response = {
				"type" : "game.state",
				"matchId": m["matchId"],
				"canvas": m["canvas"],
				"playerOne": m["playerOne"],
				"playerTwo": m["playerTwo"],
				"playerThree": m["playerThree"],
				"ball": m["ball"],
				"scoreMax": m["maxScore"]
			}
			if m["status"]:
				try:
					await self.send(text_data=json.dumps(response))
				except Exception as e:
					print(f"Erreur lors de l'envoi des données : {e}")
					m["status"] = "False"

	# continue ball at current velocity
	async def calculBallMovement(self, matchId):
		m = next((m for m in self.infoMatch["match"] if m["matchId"] == matchId), None)
		if m:
			
			m["ball"]["x"] += m["ball"]["vx"]
			m["ball"]["y"] += m["ball"]["vy"]
			await self.ballBounce(matchId)

	# angle of ball with respect to canvas center
	def getAngleOfBall(self, canvas, ball):
		bx = ball["x"] + ball["size"] / 2
		by = ball["y"] + ball["size"] / 2
		return math.atan2(canvas["centerY"] - by, canvas["centerX"] - bx) + math.pi

	# distance of ball from center of canvas
	def getBallDistanceFromCenter(self, canvas, ball):
		bx = ball["x"] + ball["size"] / 2
		by = ball["y"] + ball["size"] / 2
		return math.sqrt(math.pow(bx - canvas["centerX"], 2) + math.pow(by- canvas["centerY"], 2))

	# future distance of ball from canvas center
	def getBallNextDistanceFromCenter(self, canvas, ball):
		bx = ball["x"] + ball["size"] / 2
		by = ball["y"] + ball["size"] / 2
		newX = bx + ball["vx"]
		newY = by + ball["vy"]
		return math.sqrt(math.pow(newX - canvas["centerX"], 2) + math.pow(newY - canvas["centerY"], 2))

	# update ball velocities and last touch following strike
	def executeBallStrike(self, matchId, player):
		m = next((m for m in self.infoMatch["match"] if m["matchId"] == matchId), None)
		if m:
			ballangle = self.getAngleOfBall(m["canvas"], m["ball"])
			paddleCenter = player["endAngle"] - player["deltaAngle"] / 2
			relativeIntersect = (paddleCenter - ballangle) / player["deltaAngle"] / 2
			bounceAngle = relativeIntersect * math.pi / 3
			speed = math.sqrt(m["ball"]["vx"] * m["ball"]["vx"] + m["ball"]["vy"] * m["ball"]["vy"])
			# accelerate ball for each consecutive hit
			vx1 = -speed * math.cos(bounceAngle) * m["ball"]["accel"]
			vy1 = speed * math.sin(bounceAngle) * m["ball"]["accel"]
			m["ball"]["vx"] = vx1 * math.cos(ballangle) - vy1 * math.sin(ballangle)
			m["ball"]["vy"] = vx1 * math.sin(ballangle) + vy1 * math.cos(ballangle)
			m["lastTouch"] = player["name"]

	# check if location of ball overlaps location of paddle
	def inPaddle(self, player, matchId):
		m = next((m for m in self.infoMatch["match"] if m["matchId"] == matchId), None)
		if m:
			angleBall = self.getAngleOfBall(m["canvas"], m["ball"])
			angleButt = player["width"] / 2 * math.pi  / 180. #rounded end of paddle
			if (angleBall > player["startAngle"] - angleButt) and (angleBall < player["endAngle"] + angleButt):
				return True
			return False

	# bounce the ball off the paddles as necessary
	async def ballBounce(self, matchId):
		m = next((m for m in self.infoMatch["match"] if m["matchId"] == matchId), None)
		if m:
			angleBall = self.getAngleOfBall(m["canvas"], m["ball"])
			width = m["playerOne"]["width"] # change this if paddles take custom sizes
			distanceBall = self.getBallDistanceFromCenter(m["canvas"], m["ball"])
			nextBallDist = self.getBallNextDistanceFromCenter(m["canvas"], m["ball"])
			
			# is ball moving outwards?
			if nextBallDist > distanceBall:
				# check if ball is in the range of a paddle hit
				if distanceBall >= m["canvas"]["radius"] - width and distanceBall <= m["canvas"]["radius"]:
					# in range of PlayerOne's paddle
					if self.inPaddle(m["playerOne"], matchId):
						self.executeBallStrike(matchId, m["playerOne"])
					# in range of PlayerTwo's paddle
					elif self.inPaddle(m["playerTwo"], matchId):
						self.executeBallStrike(matchId, m["playerTwo"])
					# in range of PlayerThree's paddle
					elif self.inPaddle(m["playerThree"], matchId):
						self.executeBallStrike(matchId, m["playerThree"])
				# if ball has exited canvas, then change score
			if distanceBall > m["canvas"]["radius"] + 5 * m["canvas"]["size"]:
				self.manageScore(matchId)
				# check for a winner
				await self.checkScore(matchId)

	# check if ball angle is in the zone of a given player
	def inZone(self, player, matchId):
		m = next((m for m in self.infoMatch["match"] if m["matchId"] == matchId), None)
		if m:
			angleBall = self.getAngleOfBall(m["canvas"], m["ball"])
			if angleBall > player["startZone"] and angleBall < player["endZone"]:
				return True
			return False

	def manageScore(self, matchId):
		m = next((m for m in self.infoMatch["match"] if m["matchId"] == matchId), None)
		if m:
		# based on who last touched the ball, award points
			if m["lastTouch"] == "player1" and not self.inZone(m["playerOne"], matchId):
				m["playerOne"]["score"] += 1
			elif (m["lastTouch"] == "player1" or m["lastTouch"] == None) and self.inZone(m["playerOne"], matchId):
				m["playerTwo"]["score"] += 1
				m["playerThree"]["score"] += 1
			elif m["lastTouch"] == "player2" and not self.inZone(m["playerTwo"], matchId):
				m["playerTwo"]["score"] += 1
			elif (m["lastTouch"] == "player2" or m["lastTouch"] == None) and self.inZone(m["playerTwo"], matchId):
				m["playerOne"]["score"] += 1
				m["playerThree"]["score"] += 1
			elif m["lastTouch"] == "player3" and not self.inZone(m["playerThree"], matchId):
				m["playerThree"]["score"] += 1
			elif (m["lastTouch"] == "player3" or m["lastTouch"] == None) and self.inZone(m["playerThree"], matchId):
				m["playerOne"]["score"] += 1
				m["playerTwo"]["score"] += 1
			# place ball back in center of canvas
			self.resetBall(matchId)

	# check if any of the players have reached the max score
	# if so, change game status and send list of winners and losers
	async def checkScore(self, matchId):
		m = next((m for m in self.infoMatch["match"] if m["matchId"] == matchId), None)
		if m:
			winner = []
			loser = ["Player 1", "Player 2", "Player 3"]
			if m["playerOne"]["score"] == m["maxScore"] or m["playerTwo"]["score"] == m["maxScore"] or m["playerThree"]["score"] == m["maxScore"]:
				m["status"] = "False"
				if m["playerOne"]["score"] == m["maxScore"]:
					winner.append("Player 1")
					loser.remove("Player 1")
				if m["playerTwo"]["score"] == m["maxScore"]:
					winner.append("Player 2")
					loser.remove("Player 2")
				if m["playerThree"]["score"] == m["maxScore"]:
					winner.append("Player 3")
					loser.remove("Player 3")
				await self.sendMatchResult(winner, loser, matchId)

	# place ball in center of canvas and give it a random initial velocity
	def resetBall(self, matchId):
		m = next((m for m in self.infoMatch["match"] if m["matchId"] == matchId), None)
		if m:
			m["ball"]["x"] = m["canvas"]["centerX"]
			m["ball"]["y"] = m["canvas"]["centerY"]
			m["ball"]["speed"] = 4
			angle = random.random() * 2 * math.pi
			m["ball"]["vx"] = m["ball"]["speed"] * math.cos(angle)
			m["ball"]["vy"] = m["ball"]["speed"] * math.sin(angle)

	# guard against angles below startZone and above endZone - deltaAngle
	# to keep paddle within player's zone of movement
	def clampAngle(self,value, minVal, maxVal):
			return max(minVal, min(maxVal, value))

	# move the start position of the paddle
	# based on the direction of movement and the speed of movement
	# and bounded by the player's zone of movement
	def movePaddle(self, player, direction):
		dir = 0
		if direction == "pos":
			dir = 1
		elif direction == "neg":
			dir = -1
		angleSpeed = 0.025
		return self.clampAngle(player["startAngle"] + angleSpeed * dir, player["startZone"], player["endZone"] - player["deltaAngle"])

	# move paddles based on keyboard input sent from js frontend in data
	async def movePlayer(self, data):
		matchId = data.get("matchId", None)
		m = next((m for m in self.infoMatch["match"] if m["matchId"] == matchId), None)
		if m:
			player = data.get("player", None)
			direction = data.get("direction", None)
			if not player or not direction:
				return 0

			if player == "p1":
				m["playerOne"]["startAngle"] = self.movePaddle(m["playerOne"], direction)
				m["playerOne"]["endAngle"] = m["playerOne"]["startAngle"] + m["playerOne"]["deltaAngle"]
			elif player == "p2":
				m["playerTwo"]["startAngle"] = self.movePaddle(m["playerTwo"], direction)
				m["playerTwo"]["endAngle"] = m["playerTwo"]["startAngle"] + m["playerTwo"]["deltaAngle"]
			elif player == "p3":
				m["playerThree"]["startAngle"] = self.movePaddle(m["playerThree"], direction)
				m["playerThree"]["endAngle"] = m["playerThree"]["startAngle"] + m["playerThree"]["deltaAngle"]

	# send match results to main js file as strings given list of strings input
	async def sendMatchResult(self, winner, loser, matchId):
		m = next((m for m in self.infoMatch["match"] if m["matchId"] == matchId), None)
		if m:
			winner = " and ".join(winner)
			loser = " and ".join(loser)
			response = {
				"type": "game.result",
				"winner": winner,
				"loser": loser, 
			}
			try:
				await self.send(text_data=json.dumps(response))
			except:
				logger.info("ERROR socket probably closed.")