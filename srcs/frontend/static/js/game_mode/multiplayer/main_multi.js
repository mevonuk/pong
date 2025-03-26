import { EndNormalGamePage } from '../../pages/EndNormalGamePage.js';
import { multiPaddle, ballStyle, drawDashedLine, displayScoreOne, displayScoreTwo, displayScoreThree, displayPlayerName, drawWalls } from './style_multi.js';
let canvas = null;
let context = null;

class GameWebSocket {
	constructor() {
		canvas = document.getElementById("pongGame");
		context = canvas.getContext("2d");
		canvas.height = window.innerHeight * 0.8;
		canvas.width = canvas.height;
		context.clearRect(0, 0, canvas.width, canvas.height);

		this.matchId = null;
		this.pause = false;
		this.socket = null;
		this.isConnected = false;
		this.gameLoopInterval = null;
		this.gameState = null;
		this.keys = {
			w: false,
			s: false,
			b: false,
			n: false,
			ArrowRight: false,
			ArrowLeft: false
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
		// Player 1 (Flèches)
		if (this.keys.ArrowRight) {
			this.sendMove("neg", "p1")
		}
		if (this.keys.ArrowLeft) {
			this.sendMove("pos", "p1")
		}

		// Player 2 (W et S)
		if (this.keys.s) {
			this.sendMove("neg", "p2")
		}
		if (this.keys.w) {
			this.sendMove("pos", "p2")
		}

		// Player 3 (B et N)
		if (this.keys.b) {
			this.sendMove("neg", "p3")
		}
		if (this.keys.n) {
			this.sendMove("pos", "p3")
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
			const wsUrl = `${protocol}//${host}/ws/multi/`;

			// console.log("Attempting to connect:", wsUrl);
			this.socket = new WebSocket(wsUrl);

			this.socket.onopen = () => {
				// console.log("WebSocket connection established");
				this.isConnected = true;
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

	stopGameLoop() {
		if (this.gameLoopInterval) {
			clearInterval(this.gameLoopInterval);
			this.gameLoopInterval = null;
		}
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
		const rectWidth = this.gameState.canvas.size * 1.7;
		const rectHeight = this.gameState.canvas.size * 10;
		context.fillStyle = "black";
		context.fillRect(this.gameState.canvas.dim / 2 - 3 * this.gameState.canvas.size, this.gameState.canvas.dim / 2 - 5 * this.gameState.canvas.size, rectWidth, rectHeight);
		context.fillRect(this.gameState.canvas.dim / 2 + 1.5 * this.gameState.canvas.size, this.gameState.canvas.dim / 2 - 5 * this.gameState.canvas.size, rectWidth, rectHeight);
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

	getResult(data) {
		if (data.winner == "Player 1")
		{
			stopGame();
			const end = new EndNormalGamePage(translationsData["Player1"], translationsData["Player2 and Player3"]);
			end.handle();
		}
		else if (data.winner == "Player 1 and Player 2")
		{
			stopGame();
			const end = new EndNormalGamePage(translationsData["Player1 and Player2"], translationsData["Player3"]);
			end.handle();
		}
		else if (data.winner == "Player 1 and Player 3")
		{
			stopGame();
			const end = new EndNormalGamePage(translationsData["Player1 and Player3"], translationsData["Player2"]);
			end.handle();
		}
		else if (data.winner == "Player 2 and Player 3")
		{
			stopGame();
			const end = new EndNormalGamePage(translationsData["Player2 and Player3"], translationsData["Player1"]);
			end.handle();
		}
		else if (data.winner == "Player 2")
		{
			stopGame();
			const end = new EndNormalGamePage(translationsData["Player2"], translationsData["Player1 and Player3"]);
			end.handle();
		}
		else if (data.winner == "Player 3")
		{
			stopGame();
			const end = new EndNormalGamePage(translationsData["Player3"], translationsData["Player1 and Player2"]);
			end.handle();
		}
	}

	getInfoFromBackend(data)
	{
		this.gameState = {
			canvas: {
				dim: data.canvas.dim,
				centerX: data.canvas.centerX,
				centerY: data.canvas.centerY,
				radius: data.canvas.radius,
				size: data.canvas.size,
			},
			player1: {
				name: data.playerOne.name,
				color: data.playerOne.color,
				startAngle: data.playerOne.startAngle,
				endAngle:data.playerOne.endAngle,
				deltaAngle: data.playerOne.deltaAngle,
				startZone: data.playerOne.startZone,
				endZone: data.playerOne.endZone,
				width: data.playerOne.width,
				score: data.playerOne.score,
			},
			player2: {
				name: data.playerTwo.name,
				color: data.playerTwo.color,
				startAngle: data.playerTwo.startAngle,
				endAngle:data.playerTwo.endAngle,
				deltaAngle: data.playerTwo.deltaAngle,
				startZone: data.playerTwo.startZone,
				endZone: data.playerTwo.endZone,
				width: data.playerTwo.width,
				score: data.playerTwo.score,
			},
			player3: {
				name: data.playerThree.name,
				color: data.playerThree.color,
				startAngle: data.playerThree.startAngle,
				endAngle:data.playerThree.endAngle,
				deltaAngle: data.playerThree.deltaAngle,
				startZone: data.playerThree.startZone,
				endZone: data.playerThree.endZone,
				width: data.playerThree.width,
				score: data.playerThree.score,
			},
			ball: {
				x: data.ball.x,
				y: data.ball.y,
				size: data.ball.size,
				color: data.ball.color,
				speed: data.ball.speed,
				accel: data.ball.accel,
				vx: data.ball.vx,
				vy: data.ball.vy,
			}
		};
	}

	drawGame() {
		context.clearRect(0, 0, canvas.width, canvas.height);
		drawDashedLine(context,  this.gameState.canvas);
		drawWalls(context, this.gameState.canvas)
		multiPaddle(context, this.gameState.player1, this.gameState.canvas);
		multiPaddle(context, this.gameState.player2, this.gameState.canvas);
		multiPaddle(context, this.gameState.player3, this.gameState.canvas);
		ballStyle(context, this.gameState.ball);

		const scoreOne = this.gameState.player1.score ?? 0;
		const scoreTwo = this.gameState.player2.score ?? 0;
		const scoreThree = this.gameState.player3.score ?? 0;

		displayScoreOne(context, scoreOne,  this.gameState.canvas);
		displayScoreTwo(context, scoreTwo,  this.gameState.canvas);
		displayScoreThree(context, scoreThree,  this.gameState.canvas);

		displayPlayerName(context,  this.gameState.canvas);
	}

	cleanup() {
		window.removeEventListener('keydown', this.keyDownHandler);
		window.removeEventListener('keyup', this.keyUpHandler);
	}
}

let gameSocket = null;

export function multiMode() {
	if (!gameSocket) {
		gameSocket = new GameWebSocket();
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
