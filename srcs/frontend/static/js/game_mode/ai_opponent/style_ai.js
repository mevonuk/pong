//----------------------------COLOR/STYLE--------------------------------//

//raquette 
export function drawPaddle(context, element)
{
	context.fillStyle = element.color;
	context.shadowColor = "rgba(0, 0, 0, 0.7)";
	context.shadowOffsetX = 3;
	context.shadowOffsetY = 1;
	context.shadowBlur = 10;

	context.fillRect(element.x, element.y, element.width, element.height);
	resetStyle(context);
}

//ball -> ronde + couleur + ombre
export function ballStyle(context, element)
{
	context.fillStyle = element.color;
	context.shadowColor = "rgba(0, 0, 0, 0.7)";
	context.shadowOffsetX = 0;
	context.shadowOffsetY = 0;
	context.shadowBlur = 6;

	context.beginPath();
	context.arc(
		element.x + element.size / 2, // Centre X
		element.y + element.size / 2, // Centre Y
		element.size / 1.50, // Rayon
		0, // Début de l'angle
		Math.PI * 2 // Fin de l'angle (cercle complet)
	);
	context.fill();
	// resetStyle(context);
}

export function drawDashedLine(context, canvas, size) {
	const dashLength = size;  // Longueur des segments de la ligne pointillée
	const spaceLength = dashLength * 0.8; // Longueur des espaces entre les segments
	const centerX = canvas.width / 2;  // X du centre de la ligne
	const startY = 0;  // Début de la ligne (haut de l'écran)
	const endY = canvas.height;  // Fin de la ligne (bas de l'écran)

	// Configuration de la couleur et de la largeur de la ligne
	context.strokeStyle = "black";  // Blanc
	context.lineWidth = 2;  // Largeur de la ligne

	// Calculer le nombre de segments nécessaires
	let currentY = startY;

	// Commencer à dessiner la ligne
	context.beginPath();

	while (currentY < endY) {
		// Dessiner un segment
		context.moveTo(centerX, currentY);
		context.lineTo(centerX, currentY + dashLength);

		// Avancer à la position suivante (pour le prochain segment)
		currentY += dashLength + spaceLength;  // Ajouter un segment + un espace
	}

	// Appliquer le tracé
	context.stroke();
	// resetStyle(context);
}

export function drawGoalLine(context, canvas, size, loc) {
	const dashLength = size / 2;
	const spaceLength = dashLength;
	const centerX = loc;
	const startY = 0;
	const endY = canvas.height;
	
	context.strokeStyle = "#808080";
	context.lineWidth = 1;

	let currentY = startY;

	context.beginPath();
	while (currentY < endY) {
		context.moveTo(centerX, currentY);
		context.lineTo(centerX, currentY + dashLength);
		currentY += dashLength + spaceLength;
	}

	context.stroke();
}

//----------------------------TEXTE--------------------------------//

//PlayerOne score Text
export function displayScoreOne(context, scoreOne, canvas, size) {
	context.font = 2.5 * size + "px 'Press Start 2P'";
	context.fillStyle = "black";
	context.textBaseline = "top";
	context.shadowColor = "rgba(0, 0, 0, 0.7)";
	context.shadowOffsetX = 1;
	context.shadowOffsetY = 0;
	context.shadowBlur = 3;
	context.fillText(scoreOne, (canvas.width / 2) - (canvas.width / 8), size * 1.5);
	resetStyle(context);
}

//PlayerTwo score Text
export function displayScoreTwo(context, scoreTwo, canvas, size){
	context.font = 2.5 * size + "px 'Press Start 2P'";
	context.fillStyle = "black";
	context.textBaseline = "top";
	context.shadowColor = "rgba(0, 0, 0, 0.7";
	context.shadowOffsetX = -1;
	context.shadowOffsetY = 0;
	context.shadowBlur = 3;
	context.fillText(scoreTwo, (canvas.width / 2) + (canvas.width / 8) + 1.5 * size, size * 1.5);
	resetStyle(context);
}

export function displayText(context, canvas, size)
{
	context.font = size * 1.5 + "px 'Press Start 2P'";
	context.shadowColor = "rgba(0, 0, 0, 0.7)";
	context.shadowOffsetX = -1;
	context.shadowOffsetY = 0;
	context.shadowBlur = 3;

	context.textAlign = "left";
	context.textBaseline = "bottom";
	context.fillStyle = "rgb(78, 78, 78)";
	context.fillText(translationsData["PauseEsc"], size, canvas.height - size * 1.5);

	context.textAlign = "left";
	context.textBaseline = "top";
	context.fillStyle = "black";
	context.fillText(translationsData["P1: w (up) s (down)"], size * 1.5, size * 1.5);

	context.textAlign = "right";
	context.textBaseline = "top";
	context.fillStyle = "black";
	context.fillText(translationsData["AI player"], canvas.width - size * 1.5, size * 1.5);

	resetStyle(context);
}

export function drawWalls(context, canvas, size) {
	context.fillStyle = "rgb(78, 78, 78)";  // Changed to darker gray
	context.shadowColor = "rgba(128, 128, 128, 0.7)";  // Matching shadow
	context.shadowOffsetX = 0;
	context.shadowOffsetY = 0;
	context.shadowBlur = 6;

	// Top wall
	context.fillRect(0, 0, canvas.width, size / 2);
	// Bottom wall
	context.fillRect(0, canvas.height - size / 2, canvas.width, size / 2);

	resetStyle(context);
}

function resetStyle(context)
{
	context.shadowColor = "transparent";
	context.shadowOffsetX = 0;
	context.shadowOffsetY = 0;
	context.shadowBlur = 0;
}
