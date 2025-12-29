export class SetupView {
    constructor(rootElement, onStartGame) {
        this.rootElement = rootElement;
        this.onStartGame = onStartGame;
        this.players = ['Player 1', 'Player 2', 'Player 3']; // Defaults
    }

    render() {
        this.rootElement.innerHTML = `
      <div class="setup-container">
        <h2>Game Setup</h2>
        <div id="players-list">
          ${this.players.map((p, i) => this._renderPlayerInput(p, i)).join('')}
        </div>
        <button id="add-player-btn" class="utility-btn">+ Add Player</button>
        <button id="start-game-btn" class="btn-primary">Start Game</button>
      </div>
    `;

        this._attachEventListeners();
    }

    _renderPlayerInput(name, index) {
        return `
      <div class="player-input-row" data-index="${index}">
        <input type="text" value="${name}" class="player-name-input" aria-label="Player Name">
        <button class="utility-btn remove-player-btn" aria-label="Remove Player">X</button>
      </div>
    `;
    }

    _attachEventListeners() {
        // Add Player
        this.rootElement.querySelector('#add-player-btn').addEventListener('click', () => {
            this.players.push(`Player ${this.players.length + 1}`);
            this.render();
        });

        // Remove Player & Input Change
        this.rootElement.querySelectorAll('.remove-player-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = parseInt(e.target.closest('.player-input-row').dataset.index);
                if (this.players.length > 1) {
                    this.players.splice(index, 1);
                    this.render();
                }
            });
        });

        this.rootElement.querySelectorAll('.player-name-input').forEach(input => {
            input.addEventListener('change', (e) => {
                const index = parseInt(e.target.closest('.player-input-row').dataset.index);
                this.players[index] = e.target.value;
            });
        });

        // Start Game
        this.rootElement.querySelector('#start-game-btn').addEventListener('click', () => {
            // Filter empty names if any
            const validNames = this.players.filter(n => n.trim().length > 0);
            if (validNames.length === 0) return;
            this.onStartGame(validNames);
        });
    }
}
