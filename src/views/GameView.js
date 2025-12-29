export class GameView {
    constructor(rootElement, game) {
        this.rootElement = rootElement;
        this.game = game;
        this.selectedPlayerId = null;
        this.selectedScoreValue = null;
    }

    render() {
        this.rootElement.innerHTML = `
      <div class="game-container">
        <div class="utility-bar">
             <span>${this.game.round} Round</span>
             <div class="roster-controls">
                <button id="add-player-midgame-btn" class="utility-btn">+ Add Player</button>
                <button id="remove-player-midgame-btn" class="utility-btn">- Remove Player</button>
             </div>
             <button id="next-round-btn" class="utility-btn">Next Round</button>
        </div>

        <div id="scoreboard" class="scoreboard">
          ${this._renderScoreboard()}
        </div>

        <div class="controls-area">
          <div class="value-selector">
            ${this._renderValueButtons()}
          </div>
          
          <div class="action-buttons">
            <button id="btn-correct" class="btn-correct">CORRECT</button>
            <button id="btn-incorrect" class="btn-incorrect">INCORRECT</button>
          </div>
        </div>
      </div>
    `;

        this._attachEventListeners();
        this._updateUIState();
    }

    refresh() {
        // Re-render scoreboard only or full re-render
        // For simplicity, just update the scoreboard HTML
        const scoreboard = this.rootElement.querySelector('#scoreboard');
        if (scoreboard) scoreboard.innerHTML = this._renderScoreboard();
        this._attachScoreboardListeners();
        this._updateUIState();
    }

    _renderScoreboard() {
        return this.game.players.map(p => `
      <div class="player-card ${this.selectedPlayerId === p.id ? 'selected' : ''}" data-id="${p.id}">
        <div class="player-name">${p.name}</div>
        <div class="player-score ${p.score < 0 ? 'negative' : ''}">$${p.score}</div>
      </div>
    `).join('');
    }

    _renderValueButtons() {
        const values = this.game.round === 'Double'
            ? [400, 800, 1200, 1600, 2000]
            : [200, 400, 600, 800, 1000];

        return values.map(val => `
        <button class="value-btn" data-value="${val}">$${val}</button>
    `).join('');
    }

    _attachEventListeners() {
        this._attachScoreboardListeners();

        // Value Buttons
        this.rootElement.querySelectorAll('.value-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.selectedScoreValue = parseInt(e.target.dataset.value);
                this.game.setClueValue(this.selectedScoreValue);

                // Visual feedback
                this.rootElement.querySelectorAll('.value-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');

                this._updateUIState();
            });
        });

        // Action Buttons
        this.rootElement.querySelector('#btn-correct').addEventListener('click', () => this._handleScore(true));
        this.rootElement.querySelector('#btn-incorrect').addEventListener('click', () => this._handleScore(false));

        // Setup/Roster logic
        this.rootElement.querySelector('#add-player-midgame-btn').addEventListener('click', () => {
            const name = prompt("Enter new player name:");
            if (name && name.trim()) {
                this.game.addPlayer(name.trim());
                this.refresh();
            }
        });

        this.rootElement.querySelector('#remove-player-midgame-btn').addEventListener('click', () => {
            // For MVP: Simple prompt to enter name or ID? 
            // Better: Toggle a "delete mode" where clicking a player card removes them.
            // Let's go with "Delete Mode" toggle for better UX than typing ID.
            const isDeleteMode = this.rootElement.classList.toggle('delete-mode');
            if (isDeleteMode) {
                alert("Select a player card to remove them.");
            } else {
                // Turn off
            }
        });

        this.rootElement.querySelector('#next-round-btn').addEventListener('click', () => {
            this.game.nextRound();
            this.selectedScoreValue = null;
            this.selectedPlayerId = null;
            this.render(); // Full re-render for new values
        });
    }

    _attachScoreboardListeners() {
        this.rootElement.querySelectorAll('.player-card').forEach(card => {
            card.addEventListener('click', (e) => {
                const id = e.currentTarget.dataset.id;

                if (this.rootElement.classList.contains('delete-mode')) {
                    if (confirm("Remove this player?")) {
                        this.game.removePlayer(id);
                        this.rootElement.classList.remove('delete-mode');
                        this.refresh();
                    }
                    return;
                }

                // Toggle selection
                this.selectedPlayerId = (this.selectedPlayerId === id) ? null : id;
                this.refresh();
            });
        });
    }

    _handleScore(correct) {
        if (!this.selectedPlayerId || !this.selectedScoreValue) return;

        this.game.updateScore(this.selectedPlayerId, correct);

        // If correct, maybe deselect everything? 
        // User flow: score -> correct -> ready for next clue.
        // If incorrect, player keeps selection? Maybe. For now, deselect player.
        this.selectedPlayerId = null;

        // Deselect value? Usually you pick value first, then player.
        // Keeping value selected allows for "mistake correction" if you picked wrong player?
        // But typically next clue has different value. Deselect value.
        if (correct) {
            this.selectedScoreValue = null;
            this.game.setClueValue(0);
            this.rootElement.querySelectorAll('.value-btn').forEach(b => b.classList.remove('active'));
        }

        this.refresh();
    }

    _updateUIState() {
        const correctBtn = this.rootElement.querySelector('#btn-correct');
        const incorrectBtn = this.rootElement.querySelector('#btn-incorrect');

        if (this.selectedPlayerId && this.selectedScoreValue) {
            correctBtn.classList.add('visible');
            incorrectBtn.classList.add('visible');
        } else {
            correctBtn.classList.remove('visible');
            incorrectBtn.classList.remove('visible');
        }
    }
}
