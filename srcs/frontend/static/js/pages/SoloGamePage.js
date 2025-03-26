import { soloMode, paused, loopSolo, drawPause } from '../game_mode/solo/main_solo.js';
import { Page } from './Page.js';

export class SoloGamePage extends Page {
	constructor() {
		super();
	}

	//inherited from Page
		//async handle();
		//render();
		//setupEventListeners();
		//clean();

	//overide of the function
	setupEventListeners()
	{
		this.keydownHandler = (e) => {
			e.preventDefault();
			if (e.key == "Escape")
			{
				if (this.pause == false) {
					paused();
					drawPause();
					this.pause = true;
				}
				else {
					this.pause = false;
					loopSolo();
				}
			}
		};
		
		window.addEventListener('keydown', this.keydownHandler)
	}

	startGame() {
		soloMode();
	}

}
