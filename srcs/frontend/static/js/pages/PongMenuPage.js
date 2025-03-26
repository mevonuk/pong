export class PongMenuPage {
	constructor() {
		this.container = document.getElementById('dynamicPage');
	}

	async showSoloModeModal() {
		const modal = document.createElement('div');
		modal.className = 'game-mode-modal';
		modal.innerHTML = `
			<div class="modal-content">
				<h2 data-translate ="solomode">Select Solo Mode Type</h2>
				<div class="modal-options">
					<div class="modal-option" data-path="/pong/solo">
						<div class="option-icon">🎯</div>
						<h3 data-translate="practice">Practice Mode</h3>
						<p data-translate = "training1">Train your skills without pressure</p>
					</div>
					<div class="modal-option" data-path="/pong/solo/ai">
						<div class="option-icon">🤖</div>
						<h3 data-translate="AI">VS AI Mode</h3>
						<p data-translate="AI2">Challenge our AI opponent</p>
					</div>
				</div>
				<button class="modal-close">×</button>
			</div>
		`;

		document.body.appendChild(modal);
		const savedLang = localStorage.getItem("selectedLang") || "en";
		await updateTexts(savedLang);
	
		// Close modal when clicking outside or on close button
		modal.addEventListener('click', (e) => {
			if (e.target === modal || e.target.className === 'modal-close') {
				modal.remove();
			}
		});

		// Handle option selection
		const options = modal.querySelectorAll('.modal-option');
		options.forEach(option => {
			option.addEventListener('click', () => {
				modal.remove();
			});
		});
	}

	async handle() {
		this.render();
	}

	render() {
		const authState = window.router.getAuthState();
		const isLoggedIn = authState.isAuthenticated;

		const menuContent = document.createElement('div');
		menuContent.innerHTML = `
			<div class="pong-menu-container">
				<div class="game-title">
					<h1>PONG</h1>
					<p class="subtitle" data-translate= "modeSelect"></p>
				</div>

                <div class="game-modes">
                    <div class="mode-card" data-path="/pong/remote">
                        <div class="mode-icon">🏓</div>
                        <h3 data-translate="Battle Mode"></h3>
                        <p data-translate="Classic1"></p>
                        <div class="mode-hover" data-translate="PLAY"></div>
                    </div>
                    <div class="mode-card" data-path="/pong/normal">
                        <div class="mode-icon">🏓🏓</div>
                        <h3 data-translate="Duel Mode"></h3>
                        <p data-translate="Classic2"></p>
                        <div class="mode-hover" data-translate="PLAY"></div>
                    </div>
                    <div class="mode-card" data-path="/pong/multi">
                        <div class="mode-icon">🏓🏓🏓</div>
                        <h3 data-translate ="TriMode"></h3>
                        <p data-translate = "Tridetails"></p>
                        <div class="mode-hover" data-translate="PLAY"></div>
                    </div>

					<div class="mode-card solo-mode">
						<div class="mode-icon">🤖</div>
						<h3 data-translate = "Solo"></h3>
						<p data-translate = "Solodetails">/p>
						<div class="mode-hover" data-translate="PLAY"></div>
					</div>

					<div class="mode-card" data-path="/pong/tournament">
						<div class="mode-icon">🏆</div>
						<h3 data-translate="Tournament"></h3>
						<p data-translate="Tournamentdetails"></p>
						<div class="mode-hover"data-translate="PLAY"></div>
					</div>
				</div>
			</div>
		`;

		this.container.innerHTML = '';
		this.container.appendChild(menuContent);

		// Add click event listeners to cards
		const cards = document.querySelectorAll('.mode-card');
		cards.forEach(card => {
			card.addEventListener('click', () => {
				if (card.classList.contains('solo-mode')) {
					this.showSoloModeModal();
				}
			});
		});
	}
	
	clean() {
		return ;
	}
}

/*

	This is exactly the same thing than the HomePage

	but this time we are sending the PongMenuPage

*/
