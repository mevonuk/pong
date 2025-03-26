import { firstPaddleSolo, ballSoloStyle, drawDashedLineSolo, drawGoalLine, drawWallsSolo, displayText } from './style.js';

//----------------------GLOBAL GAME ELEMENT----------------------------//

let canvasSolo;
let contextSolo;
let playerOneSolo;
let ballSolo;
let controllerSolo;
let isPaused = false;

function init_canvasSolo(){
	canvasSolo = document.getElementById("pongGame");
	contextSolo = canvasSolo.getContext("2d");
	canvasSolo.width = window.innerWidth;
	canvasSolo.height = window.innerWidth * (16/9);
	canvasSolo.size = Math.round(Math.min(canvasSolo.height, canvasSolo.width) / 45);

	//----------------------------OBJET--------------------------------//

	//paddle right side
	playerOneSolo = new Element({
		x: canvasSolo.width - 20,
		y: canvasSolo.height * 0.4,
		width: canvasSolo.size,
		height: canvasSolo.size * 9,
		color: "#808080",
		gravity: 2,
	})

	//ballSolo
	ballSolo = new Element({
		x: canvasSolo.width / 2,
		y: canvasSolo.height / 2,
		width: canvasSolo.size,
		height: canvasSolo.size,
		color: "#808080",
		speed: 8,
		accel: 1.05,
		vx: 0,
		vy: 0,
	})

	controllerSolo = {
		"ArrowUp": {pressedSolo: false, func: movePaddleUpP2Solo},
		"ArrowDown": {pressedSolo: false, func: movePaddleDownP2Solo},
		}

	resetBallSolo();
}

//----------------------------CLASS--------------------------------//

class Element{
	constructor(options){
		this.x = options.x;
		this.y = options.y;
		this.width = options.width;
		this.height = options.height;
		this.color = options.color;
		this.speed = options.speed || 2;
		this.accel = 1.05;
		this.gravity = options.gravity || 0;
		this.vx = options.vx || 0;
		this.vy = options.vy || 0;
	}
}

//----------------------------KEY MOVEMENT--------------------------------//

const keyDownHandlerSolo = (e) => {
	if (controllerSolo[e.key]) {
		controllerSolo[e.key].pressedSolo = true;
	}
}

const keyUpHandlerSolo = (e) => {
	if (controllerSolo[e.key]) {
		controllerSolo[e.key].pressedSolo = false;
	}
}

const executeMovesSolo = () => {
	Object.keys(controllerSolo).forEach(key=> {
		controllerSolo[key].pressedSolo && controllerSolo[key].func()
	})}

function movePaddleUpP2Solo() {
	if (controllerSolo["ArrowUp"].pressedSolo == true) {
		const nextY = playerOneSolo.y - playerOneSolo.gravity * 7;

		if (nextY > 10) {
			playerOneSolo.y = nextY;
		} else {
			playerOneSolo.y = 10;
		}
	}
}

function movePaddleDownP2Solo() {
	if (controllerSolo["ArrowDown"].pressedSolo == true) {
		const nextY = playerOneSolo.y + playerOneSolo.gravity * 7;

		if (nextY + playerOneSolo.height < canvasSolo.height - 10) {
			playerOneSolo.y = nextY;
		} else {
			playerOneSolo.y = canvasSolo.height - 10 - playerOneSolo.height; // 壁にぴったりつける
		}
	}
}


//----------------------------METHOD--------------------------------//

//make ballSolo bounce
function ballSoloBounce(){
	let nextX = ballSolo.x + ballSolo.speed;
	let nextY = ballSolo.y + ballSolo.vy;

	if(nextY <= 10 || nextY + ballSolo.height >= canvasSolo.height - 10){
		ballSolo.vy *= -1;
		if (nextY <= 10) {
			ballSolo.y = 10;
		}
		if (nextY + ballSolo.height >= canvasSolo.height - 10) {
			ballSolo.y = canvasSolo.height - 10 - ballSolo.height;
		}
	}

	if (nextX <= 10) {
		ballSolo.speed *= -1;
		ballSolo.x = 10;
	} else {
		ballSolo.x += ballSolo.speed;
	}

	ballSolo.y += ballSolo.vy;

	ballSoloWallCollision();
}

function ballSoloWallCollision(){
	if (ballSolo.x + ballSolo.width + ballSolo.speed >= playerOneSolo.x &&
		ballSolo.x <= playerOneSolo.x + playerOneSolo.width &&
		ballSolo.y + ballSolo.height >= playerOneSolo.y &&
		ballSolo.y <= playerOneSolo.y + playerOneSolo.height)
	{
		const paddleCenter = playerOneSolo.y + playerOneSolo.height / 2;
		const ballCenter = ballSolo.y + ballSolo.height / 2;
		const relativeIntersectY = (paddleCenter - ballCenter) / (playerOneSolo.height / 2);

		// calculate bounce angle depending on the position of the ball on the paddle
		const bounceAngle = relativeIntersectY * 0.75;

		const speed = Math.sqrt(ballSolo.speed * ballSolo.speed + ballSolo.vy * ballSolo.vy);
		ballSolo.speed = -speed * Math.cos(bounceAngle) * ballSolo.accel;
		ballSolo.vy = speed * Math.sin(bounceAngle) * ballSolo.accel;

		ballSolo.x = playerOneSolo.x - ballSolo.width;
	}

	if (ballSolo.x + ballSolo.speed > playerOneSolo.x + playerOneSolo.width)
	{
		resetBallSolo();
	}
	drawElementsSolo();
}

function resetBallSolo() {
	ballSolo.x = canvasSolo.width / 2;
	ballSolo.y = canvasSolo.height / 2;
	var angle = Math.random() * Math.PI / 3;
	const ran = Math.random();
	var direction = 1;
	if (ran > 0.5) {
		direction = -1;
	}
	angle = angle * direction;
	ballSolo.vx = ballSolo.speed * Math.cos(angle);
	ballSolo.vy = ballSolo.speed *  Math.sin(angle);
}

function drawElementsSolo(){
	if (isPaused)
	{
		contextSolo.clearRect(0, 0, canvasSolo.width, canvasSolo.height);
		displayPauseScreen();
	}
	else {
		contextSolo.clearRect(0, 0, canvasSolo.width, canvasSolo.height);
		drawWallsSolo(contextSolo, canvasSolo);
		firstPaddleSolo(contextSolo, playerOneSolo);
		ballSoloStyle(contextSolo, ballSolo);
		drawDashedLineSolo(contextSolo, canvasSolo);
		drawGoalLine(contextSolo, canvasSolo);
		displayText(contextSolo, canvasSolo);
	}
}

export function resetGameSolo()
{
	canvasSolo.height = window.innerHeight * 0.8;
	canvasSolo.width = canvasSolo.height * (16/9);
	canvasSolo.size = Math.round(Math.min(canvasSolo.height, canvasSolo.width) / 45);
	playerOneSolo.x = canvasSolo.width - 20;
	playerOneSolo.y = canvasSolo.height * 0.4;
	playerOneSolo.width = canvasSolo.size;
	playerOneSolo.height = canvasSolo.size * 9;
	playerOneSolo.gravity = 2;

	ballSolo.x = canvasSolo.width / 2;
	ballSolo.y = canvasSolo.height / 2;
	ballSolo.width = canvasSolo.size;
	ballSolo.height = canvasSolo.size;
	ballSolo.speed = 8;
	ballSolo.vx = 0;
	ballSolo.vy = 0;

	controllerSolo = {
		"ArrowUp": {pressedSolo: false, func: movePaddleUpP2Solo},
		"ArrowDown": {pressedSolo: false, func: movePaddleDownP2Solo},
		}
	window.addEventListener("keydown", keyDownHandlerSolo);
	window.addEventListener("keyup", keyUpHandlerSolo);
}

let animationId = null;

export function loopSolo(){
	ballSoloBounce();
	executeMovesSolo();
	animationId = requestAnimationFrame(loopSolo);
}

export function paused() {
	if (animationId)
	{
		cancelAnimationFrame(animationId);
		animationId = null;
	}
}

export function drawPause() {
	const rectWidth = canvasSolo.size * 1.7;
	const rectHeight = canvasSolo.size * 10;
	contextSolo.fillStyle = "black";
	contextSolo.fillRect(canvasSolo.width / 2 - 3 * canvasSolo.size, canvasSolo.height / 2 - 5 * canvasSolo.size, rectWidth, rectHeight);
	contextSolo.fillRect(canvasSolo.width / 2 + 1.5 * canvasSolo.size, canvasSolo.height / 2 - 5 * canvasSolo.size, rectWidth, rectHeight);
}

export function soloMode(){
	if (animationId)
	{
		cancelAnimationFrame(animationId);
		animationId = null;
	}
	init_canvasSolo();
	resetGameSolo();
	loopSolo();
}

export function stopGameSolo() {
	window.removeEventListener("keydown", keyDownHandlerSolo);
	window.removeEventListener("keyup", keyUpHandlerSolo);
	window.removeEventListener('resize', resizeCanvasSolo);
}
