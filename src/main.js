import './styles.css'
import { SetupView } from './views/SetupView.js'
import { GameView } from './views/GameView.js'
import { Game } from './models/Game.js'

class App {
  constructor() {
    this.appElement = document.querySelector('#app');
    this.game = null;
    this.currentView = null;

    this.init();
  }

  init() {
    // Check for saved game
    const savedData = localStorage.getItem('foaq_save');
    if (savedData) {
      try {
        const data = JSON.parse(savedData);
        this.game = Game.deserialize(data);
        this.showGame();
      } catch (e) {
        console.error("Failed to load save:", e);
        this.game = new Game();
        this.showSetup();
      }
    } else {
      this.game = new Game();
      this.showSetup();
    }
  }

  saveGame() {
    if (this.game) {
      localStorage.setItem('foaq_save', JSON.stringify(this.game.serialize()));
    }
  }

  resetGame() {
    localStorage.removeItem('foaq_save');
    this.game = new Game();
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
    this.saveGame();

    // Switch to Game View
    this.showGame();
  }

  showGame() {
    this.currentView = new GameView(this.appElement, this.game, {
      onStateChange: () => this.saveGame(),
      onReset: () => this.resetGame()
    });
    this.currentView.render();
  }
}

new App();
