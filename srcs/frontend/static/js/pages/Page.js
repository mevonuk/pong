export class Page {
	constructor() {
		this.container = document.getElementById('dynamicPage');
		this.game = null;
		this.pause = false;
	}

	async handle() {
		this.setupEventListeners();
		this.render();
	}

	render() {
		const gameContent = document.createElement('div');
		gameContent.className = 'game-container';
		gameContent.innerHTML = `
		   <canvas id="pongGame" width="800" height="400"></canvas>
		`;

		this.container.innerHTML = '';
		this.container.appendChild(gameContent);

		// Appel d'une méthode abstraite à implémenter par les classes enfants
		this.startGame();
	}

	// sets up esc and keydown as events, esc controls pause
	setupEventListeners() {
		this.keydownHandler = (e) => {
			e.preventDefault();
			if (e.key === "Escape") {
				if (!this.pause && this.game) {
					this.game.stopGameLoop();
					this.pause = true;
					this.game.drawPause();
				} else if (this.game) {
					this.pause = false;
					this.game.sendUnpause();
				}
			}
		};
		window.addEventListener('keydown', this.keydownHandler);
	}

	clean() {
		this.game = null;
		this.pause = false;
		window.removeEventListener('keydown', this.keydownHandler);
	}
	
	// Méthode abstraite à implémenter par les classes enfants
	startGame() {
		throw new Error("startGame() doit être implémenté dans la classe enfant");
	}
}