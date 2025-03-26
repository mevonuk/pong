//----------------------------COLOR/STYLE--------------------------------//

//raquette playerOne
export function firstPaddleSolo(contextSolo, elementSolo)
{
	contextSolo.fillStyle = "black";
	contextSolo.shadowColor = "rgba(52, 152, 219, 0.7)";
	contextSolo.shadowOffsetX = -3;
	contextSolo.shadowOffsetY = 1;
	contextSolo.shadowBlur = 6;

	contextSolo.fillRect(elementSolo.x, elementSolo.y, elementSolo.width, elementSolo.height);
	resetStyleSolo(contextSolo);
}

//ballSolo -> ronde + couleur + ombre
export function ballSoloStyle(contextSolo, elementSolo)
{
	contextSolo.fillStyle = "#000000";
	contextSolo.shadowOffsetX = 0;
	contextSolo.shadowOffsetY = 0;
	contextSolo.shadowBlur = 6;

	contextSolo.beginPath();
	contextSolo.arc(
		elementSolo.x + elementSolo.width / 2, // Centre X
		elementSolo.y + elementSolo.height / 2, // Centre Y
		elementSolo.width / 1.5, // Rayon
		0, // Début de l'angle
		Math.PI * 2 // Fin de l'angle (cercle complet)
	);
	contextSolo.fill();
	resetStyleSolo(contextSolo);
}

export function drawDashedLineSolo(contextSolo, canvasSolo) {
	const dashLength = canvasSolo.size;
	const spaceLength = canvasSolo.size * 0.8;
	const centerX = canvasSolo.width / 2;
	const startY = 0;
	const endY = canvasSolo.height;

	contextSolo.strokeStyle = "#808080";  // Changed to darker gray
	contextSolo.lineWidth = 2;

	let currentY = startY;
	contextSolo.beginPath();

	while (currentY < endY) {
		contextSolo.moveTo(centerX, currentY);
		contextSolo.lineTo(centerX, currentY + dashLength);
		currentY += dashLength + spaceLength;
	}

	contextSolo.stroke();
}

export function drawGoalLine(contextSolo, canvasSolo) {
	const dashLength = canvasSolo.size / 2;
	const spaceLength = canvasSolo.size / 2;
	const centerX = canvasSolo.width;
	const startY = 0;
	const endY = canvasSolo.height;

	contextSolo.strokeStyle = "#808080";  // Changed to darker gray
	contextSolo.lineWidth = 1;

	let currentY = startY;
	contextSolo.beginPath();

	while (currentY < endY) {
		contextSolo.moveTo(centerX, currentY);
		contextSolo.lineTo(centerX, currentY + dashLength);
		currentY += dashLength + spaceLength;
	}

	contextSolo.stroke();
}

export function drawWallsSolo(contextSolo, canvasSolo) {
	contextSolo.fillStyle = "#808080";  // Changed to darker gray
	contextSolo.shadowColor = "rgba(128, 128, 128, 0.7)";  // Matching shadow
	contextSolo.shadowOffsetX = 0;
	contextSolo.shadowOffsetY = 0;
	contextSolo.shadowBlur = 6;

	// Top wall
	contextSolo.fillRect(0, 0, canvasSolo.width, canvasSolo.size / 2);

	// Bottom wall
	contextSolo.fillRect(0, canvasSolo.height - canvasSolo.size / 2, canvasSolo.width, canvasSolo.size / 2);
	contextSolo.fillStyle = "rgba(128, 128, 128, 0.48)";  // Matching shadow
	// left wall
	contextSolo.fillRect(0, 0, canvasSolo.size / 2, canvasSolo.height);

	resetStyleSolo(contextSolo);
}

function resetStyleSolo(contextSolo)
{
	contextSolo.shadowColor = "transparent";
	contextSolo.shadowOffsetX = 0;
	contextSolo.shadowOffsetY = 0;
	contextSolo.shadowBlur = 0;
}

export function displayText(contextSolo, canvasSolo)
{
	contextSolo.font = canvasSolo.size * 1.5 + "px 'Press Start 2P'";
	contextSolo.shadowColor = "rgba(0, 0, 0, 0.7)";
	contextSolo.shadowOffsetX = -1;
	contextSolo.shadowOffsetY = 0;
	contextSolo.shadowBlur = 3;

	contextSolo.textAlign = "right";
	contextSolo.textBaseline = "top";
	contextSolo.fillStyle = "black";
	contextSolo.fillText(translationsData["Controls: ↑ (up) ↓ (down)"], canvasSolo.width - canvasSolo.size * 2, canvasSolo.size);

	contextSolo.textAlign = "left";
	contextSolo.textBaseline = "top";
	contextSolo.fillStyle = "rgb(78, 78, 78)";
	contextSolo.fillText(translationsData["PauseEsc"], canvasSolo.size * 2, canvasSolo.size);

	resetStyleSolo(contextSolo);
}
