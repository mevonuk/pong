import { EndNormalGamePage } from '../../pages/EndNormalGamePage.js';
import { EndGamePage } from '../../tournament/EndGamePage.js';
import { drawPaddle, ballStyle, drawDashedLine, drawGoalLine, displayScoreOne, displayScoreTwo, displayText, drawWalls } from './style.js';
let canvas = null;
let context = null;

class GameWebSocket {
	constructor(typeOfMatch, socketTournament, infoMatch) {
		canvas = document.getElementById("pongGame");
		context = canvas.getContext("2d");
		canvas.height = window.innerHeight * 0.8;
		canvas.width = canvas.height * (16/9);
		context.clearRect(0, 0, canvas.width, canvas.height);

		/* for tournament */
		this.typeOfMatch = typeOfMatch; // "normal" || "tournament"
		this.socketTournament = socketTournament; // null for normal || socket of tournament
		this.infoMatch = infoMatch; // null for normal || contains name of player for tournament
		/* end */

		this.matchId = null;
		this.pause = false;
		this.socket = null;
		this.isConnected = false;
		this.gameLoopInterval = null;
		this.gameState = null;
		this.keys = {
			w: false,
			s: false,
			ArrowUp: false,
			ArrowDown: false
		};
		this.setupKeyboardControls();
		this.connect();
		this.frameCount = 0;
		this.sendRate = 20;
	}

	setupKeyboardControls() {
		this.keyDownHandler = (e) => {
			if (this.keys.hasOwnProperty(e.key)) {
				this.keys[e.key] = true;
				e.preventDefault();
			}
		};

		this.keyUpHandler = (e) => {
			if (this.keys.hasOwnProperty(e.key)) {
				this.keys[e.key] = false;
				e.preventDefault();
			}
		};

		window.addEventListener('keydown', this.keyDownHandler);
		window.addEventListener('keyup', this.keyUpHandler);
	}

	updatePlayerPositions() {

		// Player 1 movement (W and S keys)
		if (this.keys.w && this.gameState.p1.y > 0) {
			this.sendMove("up", "p1")
		}
		if (this.keys.s && this.gameState.p1.y < canvas.height - this.gameState.p1.height) {
			this.sendMove("down", "p1")
		}

		// P 2 movement (Arrow keys)
		if (this.keys.ArrowUp && this.gameState.p2.y > 0) {
			this.sendMove("up", "p2")
		}
		if (this.keys.ArrowDown && this.gameState.p2.y < canvas.height - this.gameState.p2.height) {
			this.sendMove("down", "p2")
		}
	}

	sendMove(direction, player) {
		if (!this.isConnected) return;

		const updates = {
			type: "player.moved",
			"matchId": this.matchId,
			'player': player,
			'direction': direction,
		};
		this.sendMessage(updates);
	}

	connect() {
		try {
			const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
			const host = window.location.host;
			const wsUrl = `${protocol}//${host}/ws/game/`;

			// console.log("Attempting to connect:", wsUrl);
			this.socket = new WebSocket(wsUrl);

			this.socket.onopen = () => {
				// console.log("WebSocket connection established");
				this.isConnected = true;
				// this.sendInfoStarting();
			};

			this.socket.onmessage = (event) => {
				try {
					const data = JSON.parse(event.data);
					this.handleMessage(data);
				} catch (e) {
					console.error("Failed to parse message:", e);
				}
			};

			this.socket.onerror = (error) => {
				console.error("WebSocket error:", error);
			};

			this.socket.onclose = (event) => {
				// console.log("WebSocket connection closed:", event.code, event.reason);
				this.isConnected = false;
				this.stopGameLoop();
			};

		} catch (error) {
			console.error("WebSocket connection error:", error);
		}
	}

	startGameLoop() {
		if (this.gameLoopInterval) return;

		this.gameLoopInterval = setInterval(() => {
			this.updatePlayerPositions();

			this.drawGame();

			this.frameCount++;
			if (this.frameCount >= (60 / this.sendRate)) {
				this.frameCount = 0;
			}
		}, 1000 / 60);
	}

	sendPause() {
		if (!this.isConnected) return;

		const updates = {
			type: "player.pause",
			"matchId": this.matchId,
		};
		this.sendMessage(updates);
	}

	sendUnpause() {
		if (!this.isConnected) return;

		this.pause = false;
		const updates = {
			type: "player.unpause",
			"matchId": this.matchId,
		};
		this.sendMessage(updates);
	}


	drawPause() {
		this.pause = true;
		this.sendPause();
		const rectWidth = this.gameState.ball.size * 1.7;
		const rectHeight = this.gameState.ball.size * 10;
		context.fillStyle = "black";
		context.fillRect(canvas.width / 2 - 3 * this.gameState.ball.size, canvas.height / 2 - 5 * this.gameState.ball.size, rectWidth, rectHeight);
		context.fillRect(canvas.width / 2 + 1.5 * this.gameState.ball.size, canvas.height / 2 - 5 * this.gameState.ball.size, rectWidth, rectHeight);
	}

	stopGameLoop() {
		if (this.gameLoopInterval) {
			clearInterval(this.gameLoopInterval);
			this.gameLoopInterval = null;
		}
	}

	sendInfoStarting()
	{
		const data = {
			type: "game.starting",
			timestamp: Date.now(),
			start: {
				"matchId": this.matchId,
				"windowHeight": canvas.height,
				"windowWidth": canvas.width,
				"typeOfMatch": this.typeOfMatch,
			}
		};

		if (this.isConnected && this.socket) {
			this.socket.send(JSON.stringify(data));
		} else {
			console.warn("WebSocket not connected");
		}
	}

	sendMessage(data) {
		if (this.isConnected && this.socket) {
			this.socket.send(JSON.stringify(data));
		} else {
			console.warn("WebSocket not connected");
		}
	}

	handleMessage(data) {
		switch (data.type) {
			case "info":
				this.matchId = data.matchId;
				this.sendInfoStarting();
				break;
			case "game.state":
				if (this.pause == false)
				{
					this.getInfoFromBackend(data);
					this.startGameLoop();
				}
				break;
			case "game.result":
				this.getResult(data);
				break;
			case "error":
				console.error("Server error:", data.message);
				break;
			default:
				// console.log("Unhandled message type:", data.type);
		}
	}
//get result a modifier
	getResult(data) {
		if (this.typeOfMatch == "tournament") {
			if (data.winner == "Player 1")
			{
				stopGame();
				const end = new EndGamePage(this.infoMatch.playerOne, this.infoMatch.playerTwo, this.socketTournament, this.infoMatch);
				end.handle();
			}
			else if (data.winner == "Player 2")
			{
				stopGame();
				const end = new EndGamePage(this.infoMatch.playerTwo, this.infoMatch.playerOne, this.socketTournament, this.infoMatch);
				end.handle();
			}
		} else {
				if (data.winner == "Player 1")
				{
					stopGame();
					const end = new EndNormalGamePage(translationsData["Player1"],translationsData["Player2"]);
					end.handle();
				}
				else if (data.winner == "Player 2")
				{
					stopGame();
					const end = new EndNormalGamePage(translationsData["Player2"], translationsData["Player1"]);
					end.handle();
				}
		}
	}

	getInfoFromBackend(data)
	{
		if (data.matchId != this.matchId)
			return;
		this.gameState = {
			p1: {
				x: data.playerOne.x,
				y: data.playerOne.y,
				width: data.playerOne.width,
				height: data.playerOne.height,
				color: data.playerOne.color,
				score: data.playerOne.score
			},
			p2: {
				x: data.playerTwo.x,
				y: data.playerTwo.y,
				width: data.playerTwo.width,
				height: data.playerTwo.height,
				color: data.playerTwo.color,
				score: data.playerTwo.score
			},
			ball: {
				x: data.ball.x,
				y: data.ball.y,
				size: data.ball.size,
				color: data.ball.color,
				speed: data.ball.speed,
				accel: data.ball.accel,
				vx: data.ball.vx,
				vy: data.ball.vy
			},
			score: {
				scoreMax: data.scoreMax
			}
		}
	}

	drawGame() {
		context.clearRect(0, 0, canvas.width, canvas.height);
		drawWalls(context, canvas);
		drawPaddle(context, this.gameState.p1);
		drawPaddle(context, this.gameState.p2);
		ballStyle(context, this.gameState.ball);
		drawDashedLine(context, canvas, this.gameState.ball.size);
		drawGoalLine(context, canvas, this.gameState.ball.size, 0);
		drawGoalLine(context, canvas, this.gameState.ball.size, canvas.width);

		const scoreOne = this.gameState.p1.score ?? 0;
		const scoreTwo = this.gameState.p2.score ?? 0;

		displayScoreOne(context, scoreOne, canvas, this.gameState.ball.size);
		displayScoreTwo(context, scoreTwo, canvas, this.gameState.ball.size);
		displayText(context, canvas, this.gameState.ball.size, this.infoMatch);
	}

	cleanup() {
		window.removeEventListener('keydown', this.keyDownHandler);
		window.removeEventListener('keyup', this.keyUpHandler);
	}
}

let gameSocket = null;

export function normalMode(typeOfMatch, socketTournament, infoMatch) {
	if (!gameSocket) {
		gameSocket = new GameWebSocket(typeOfMatch, socketTournament, infoMatch);
	}
	if (gameSocket)
		return gameSocket;
}

export function stopGame() {
	if (gameSocket) {
		gameSocket.cleanup();
		gameSocket.stopGameLoop();
		gameSocket.socket.close();
		gameSocket = null;
	}
}
