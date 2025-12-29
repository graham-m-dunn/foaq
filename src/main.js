import './styles.css'
import { SetupView } from './views/SetupView.js'
import { GameView } from './views/GameView.js'
import { Game } from './models/Game.js'

class App {
  constructor() {
    this.appElement = document.querySelector('#app');
    this.game = new Game();
    this.currentView = null;

    this.init();
  }

  init() {
    this.showSetup();
  }

  showSetup() {
    this.currentView = new SetupView(this.appElement, (playerNames) => {
      this.startGame(playerNames);
    });
    this.currentView.render();
  }

  startGame(playerNames) {
    // Init Game Model
    playerNames.forEach(name => this.game.addPlayer(name));

    // Switch to Game View
    this.showGame();
  }

  showGame() {
    this.currentView = new GameView(this.appElement, this.game);
    this.currentView.render();
  }
}

new App();
