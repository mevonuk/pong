import { normalMode, stopGame } from '../game_mode/1v1RemotePlayer/mainRemote.js';

export class RemoteNormalGamePage {
	constructor() {
		this.container = document.getElementById('dynamicPage');
	}

	async handle() {
		this.render();
	}

	render() {
		const authState = window.router.getAuthState();
		const isLoggedIn = authState.isAuthenticated;
		const username = authState.username;

		if (isLoggedIn) {
			this.container.innerHTML = `
				<div class="game-container">
					<button class="back-button" data-path="/pong" data-translate="backMenu">
						<i class="fas fa-arrow-left"></i> Back to Menu
					</button>
					<canvas id="pongGame" width="800" height="400"></canvas>
					<div class="typewriter-text" data-translate="searching"></div>
				</div>
			`;

			normalMode();
		} else {
			this.container.innerHTML = `
				<div class="game-container">
					<h1 data-translate="logtoplay"></h1>
					<button class="back-button" data-path="/login" data-translate="login">
						<i class="fas fa-arrow-left"></i> Login
					</button>
				</div>
			`;
		}
	}

	clean() {
		stopGame();
		return ;
	}
}


