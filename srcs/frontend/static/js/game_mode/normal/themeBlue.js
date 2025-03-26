//----------------------------COLOR/STYLE--------------------------------//

//raquette playerOne
export function firstPaddleBlue(context, element)
{
	context.fillStyle = "rgba(150, 209, 209, 0.7)";
	context.shadowColor = "rgba(71, 209, 209, 0.7)";
	context.shadowOffsetX = 3;
	context.shadowOffsetY = 1;
	context.shadowBlur = 10;

	context.fillRect(element.x, element.y, element.width, element.height);
	resetStyleBlue(context);
}

//raquette playerTwo
export function secondPaddleBlue(context, element)
{
	context.fillStyle = "rgba(150, 209, 209, 0.7)";
	context.shadowColor = "rgba(71, 209, 209, 0.7)";
	context.shadowOffsetX = -3;
	context.shadowOffsetY = 1;
	context.shadowBlur = 6;

	context.fillRect(element.x, element.y, element.width, element.height);
	resetStyleBlue(context);
}

//ball -> ronde + couleur + ombre
export function ballStyleBlue(context, element)
{
	context.fillStyle = "rgba(150, 209, 209, 0.7)";
	context.shadowColor = "rgba(71, 209, 209, 0.7)";
	context.shadowOffsetX = 0;
	context.shadowOffsetY = 0;
	context.shadowBlur = 6;

	context.beginPath();
	context.arc(
		element.x + element.width / 2, // Centre X
		element.y + element.height / 2, // Centre Y
		element.width / 1.50, // Rayon
		0, // Début de l'angle
		Math.PI * 2 // Fin de l'angle (cercle complet)
	);
	context.fill();
	// resetStyleBlue(context);
}

export function drawDashedLineBlue(context, canvas) {
	const dashLength = 20;  // Longueur des segments de la ligne pointillée
	const spaceLength = 10; // Longueur des espaces entre les segments
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
	// resetStyleBlue(context);
}

//----------------------------TEXTE--------------------------------//

//PlayerOne score Text
export function displayScoreOneBlue(context, scoreOne, canvas) {
	context.font = "90px 'Press Start 2P'";
	context.fillStyle = "black";
	context.textBaseline = "top";
	context.shadowColor = "rgba(122, 72, 72, 0.7)";
	context.shadowOffsetX = 1;
	context.shadowOffsetY = 0;
	context.shadowBlur = 3;
	context.fillText(scoreOne, canvas.width / 2 - 120, 30);
	resetStyleBlue(context);
	}

//PlayerTwo score Text
export function displayScoreTwoBlue(context, scoreTwo, canvas){
	context.font = "90px 'Press Start 2P'";
	context.fillStyle = "black";
	context.textBaseline = "top";
	context.shadowColor = "rgba(122, 72, 72, 0.7)";
	context.shadowOffsetX = -1;
	context.shadowOffsetY = 0;
	context.shadowBlur = 3;
	context.fillText(scoreTwo, canvas.width / 2 + 70, 30);
	resetStyleBlue(context);
}

function resetStyleBlue(context)
{
	context.shadowColor = "transparent";
	context.shadowOffsetX = 0;
	context.shadowOffsetY = 0;
	context.shadowBlur = 0;
}
