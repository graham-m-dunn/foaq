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
                <button id="add-player-midgame-btn" class="utility-btn">+ Player</button>
                <button id="remove-player-midgame-btn" class="utility-btn">- Player</button>
             </div>
             <div>
                <button id="prev-round-btn" class="utility-btn">&lt; Prev</button>
                <button id="next-round-btn" class="utility-btn">Next &gt;</button>
             </div>
        </div>

        <div class="controls-area">
          <div class="value-selector">
            ${this._renderValueButtons()}
          </div>
        </div>

        <div id="scoreboard" class="scoreboard">
          ${this._renderScoreboard()}
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
        const showActions = this.selectedScoreValue !== null;

        return this.game.players.map(p => `
      <div class="player-card ${showActions ? 'show-actions' : ''}" data-id="${p.id}">
        <div class="player-name">${p.name}</div>
        <div class="player-score ${p.score < 0 ? 'negative' : ''}">$${p.score}</div>
        <div class="inline-actions">
            <div class="btn-inline correct" data-action="correct" data-player-id="${p.id}">✓</div>
            <div class="btn-inline incorrect" data-action="incorrect" data-player-id="${p.id}">✗</div>
        </div>
      </div>
    `).join('');
    }

    _renderValueButtons() {
        const values = this.game.round === 'Double'
            ? [400, 800, 1200, 1600, 2000]
            : [200, 400, 600, 800, 1000];

        return values.map(val => `
        <button class="value-btn ${this.selectedScoreValue === val ? 'active' : ''}" data-value="${val}">$${val}</button>
    `).join('');
    }

    _attachEventListeners() {
        this._attachScoreboardListeners();

        // Value Buttons
        this.rootElement.querySelectorAll('.value-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const val = parseInt(e.target.dataset.value);
                if (this.selectedScoreValue === val) {
                    this.selectedScoreValue = null;
                } else {
                    this.selectedScoreValue = val;
                    this.game.setClueValue(val);
                }
                this.render();
            });
        });

        // Setup/Roster logic
        this.rootElement.querySelector('#add-player-midgame-btn').addEventListener('click', () => {
            const name = prompt("Enter new player name:");
            if (name && name.trim()) {
                this.game.addPlayer(name.trim());
                this.refresh();
            }
        });

        this.rootElement.querySelector('#remove-player-midgame-btn').addEventListener('click', () => {
            const isDeleteMode = this.rootElement.classList.toggle('delete-mode');
            if (isDeleteMode) {
                alert("Select a player card to remove them.");
            }
        });

        this.rootElement.querySelector('#next-round-btn').addEventListener('click', () => {
            this.game.nextRound();
            this.selectedScoreValue = null;
            this.render();
        });

        this.rootElement.querySelector('#prev-round-btn').addEventListener('click', () => {
            this.game.previousRound();
            this.selectedScoreValue = null;
            this.render();
        });
    }
}

_attachScoreboardListeners() {
    this.rootElement.querySelectorAll('.btn-inline').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const playerId = e.currentTarget.dataset.playerId;
            const isCorrect = e.currentTarget.dataset.action === 'correct';
            this._handleScore(playerId, isCorrect);
        });
    });

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
        });
    });
}

_handleScore(playerId, correct) {
    if (!this.selectedScoreValue) return;

    this.game.updateScore(playerId, correct);

    if (correct) {
        this.selectedScoreValue = null;
        this.game.setClueValue(0);
        this.render();
    } else {
        this.refresh();
    }
}

_updateUIState() {
    // Deprecated
}
}
