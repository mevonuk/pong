import { multiMode, stopGame } from "../game_mode/multiplayer/main_multi.js";
import { Page } from './Page.js';

export class MultiPage extends Page {
	constructor() {
		super();
	}

	//inherited from Page
		//async handle();
		//render();
		//setupEventListeners();
		//clean();

	startGame() {
		this.game = multiMode("base");
	}
	
	clean()
	{
		super.clean();
		stopGame();
	}
}

