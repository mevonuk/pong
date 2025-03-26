import { aiMode, stopGameAi } from "../game_mode/ai_opponent/main_ai.js";
import { Page } from './Page.js';

export class AiPage extends Page {
	constructor() {
		super(); //invokes the constructor of the parent class Page
	}

	//inherited from Page
		//async handle();
		//render();
		//setupEventListeners();
		//clean();

	startGame() {
		this.game = aiMode();
	}

	clean() {
		super.clean(); // invokes clean of parent
		stopGameAi();
	}
}
