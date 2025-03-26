import { normalMode, stopGame } from '../game_mode/normal/main.js';
import { Page } from './Page.js';

export class NormalGamePage extends Page {
	constructor(themeReceived, type, socketTournament, infoMatch) {
		super();
		this.theme = themeReceived;
		this.type = type;
		this.socketTournament = socketTournament;
		this.infoMatch = infoMatch;
	}
	
	//inherited from Page
		//async handle();
		//render();
		//setupEventListeners();
		//clean();

	startGame() {
		this.game = normalMode(this.type, this.socketTournament, this.infoMatch);
	}

	clean() {
		super.clean();
		stopGame();
	}
}

