import { SafeText } from '../utils/safetext.js';

export class EndTournementPage {
	constructor(winner) {
		this.container = document.getElementById('dynamicPage');
		this.winner = winner;
	}

	async handle() {
		this.render();
		this.setupAnimations();
	}

	async render() {
		const gameContent = document.createElement('div');
		gameContent.className = 'tournament-final-container';
		gameContent.innerHTML = `
			<div class="tournament-final animate-fade-in">
				<div class="trophy-container animate-bounce">
					<i class="fas fa-trophy"></i>
				</div>

				<div class="champion-content">
					<h1 class="champion-title animate-slide-down" data-translate="tourchampion">TOURNAMENT CHAMPION</h1>
					<div class="champion-name glow-text animate-fade-in-delay">
						${SafeText.escape(this.winner)}
					</div>
					<div class="confetti-container"></div>
				</div>

				<a href="/pong" data-path="/pong" class="return-btn animate-fade-in-up">
					<span class="btn-text" data-translate="returnMenu">RETURN TO MENU</span>
					<div class="btn-animation-container">
						<span class="btn-ping"></span>
						<span class="btn-ping"></span>
					</div>
				</a>
			</div>
		`;

		this.container.innerHTML = '';
		this.container.appendChild(gameContent);
		const savedLang = localStorage.getItem("selectedLang") || "en";
		await updateTexts(savedLang);
	}

	setupAnimations() {
		this.createConfetti();
	}

	createConfetti() {
		const colors = ['#3498db', '#2ecc71', '#e74c3c', '#f1c40f', '#9b59b6'];
		const confettiCount = 50;
		const container = document.querySelector('.confetti-container');

		for (let i = 0; i < confettiCount; i++) {
			const confetti = document.createElement('div');
			confetti.className = 'confetti-piece';
			confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
			confetti.style.left = Math.random() * 100 + '%';
			confetti.style.animationDelay = Math.random() * 3 + 's';
			confetti.style.animationDuration = Math.random() * 2 + 3 + 's';
			container.appendChild(confetti);
		}
	}

	clean() {
		return ;
	}
}
