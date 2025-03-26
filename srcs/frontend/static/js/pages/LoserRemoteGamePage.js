export class LoserRemoteGamePage {
	constructor() {
        this.container = document.getElementById('dynamicPage');
    }

    async handle() {
        this.render();
        this.setupEventListeners();
    }

    async render() {
        const gameContent = document.createElement('div');
        gameContent.className = 'match-result-container';
        gameContent.innerHTML = `
            <div class="match-result animate-fade-in">
                <div class="result-header">
                    <h2 class="match-title animate-slide-down" data-translate = "matchresult">MATCH RESULT</h2>
                    <div class="players-result">
                        <div class="loser-section">
                            <span class="result-label" data-translate ="defeat">DEFEAT</span>
                        </div>
                    </div>
                </div>

                <button id="returnToGame" class="next-match-btn animate-fade-in-up">
                    <span class="btn-text" data-translate="ReturnGame">RETURN TO GAME</span>
                    <div class="btn-animation-container">
                        <span class="btn-ping"></span>
                    </div>
                </button>
            </div>
        `;

        this.container.innerHTML = '';
        this.container.appendChild(gameContent);
        const savedLang = localStorage.getItem("selectedLang") || "en";
		await updateTexts(savedLang);
    }

    setupEventListeners() {
        const returnButton = document.getElementById('returnToGame');
        returnButton.addEventListener('click', () => {
            window.history.pushState({}, '', '/pong');
            window.dispatchEvent(new PopStateEvent('popstate'));
        });
    }
    
    clean() {
		return ;
	}
}
