export class GameView {
    constructor(rootElement, game) {
        this.rootElement = rootElement;
        this.game = game;
        this.selectedScoreValue = null;
        this.isDailyDouble = false;
        this.longPressTimer = null;
        this.longPressTriggered = false;
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

        ${this.game.round !== 'Final' ? `
        <div class="controls-area">
          <div class="value-selector">
            ${this._renderValueButtons()}
          </div>
        </div>
        ` : ''}

        <div class="info-banner" style="text-align:center; padding: 5px; color: gold; min-height: 24px;">
            ${this.isDailyDouble ? 'DAILY DOUBLE - ENTER WAGER (Min: 5)' : (this.game.round === 'Final' ? 'FINAL JEOPARDY - ENTER WAGERS' : '')}
        </div>

        <div id="scoreboard" class="scoreboard">
          ${this._renderScoreboard()}
        </div>
      </div>
    `;

        this._attachEventListeners();
    }

    refresh() {
        const scoreboard = this.rootElement.querySelector('#scoreboard');
        if (scoreboard) scoreboard.innerHTML = this._renderScoreboard();
        this._attachScoreboardListeners();

        const banner = this.rootElement.querySelector('.info-banner');
        if (banner) {
            banner.textContent = this.isDailyDouble ? 'DAILY DOUBLE - ENTER WAGER (Min: 5)' : (this.game.round === 'Final' ? 'FINAL JEOPARDY - ENTER WAGERS' : '');
        }
    }

    _renderScoreboard() {
        const isClueActive = this.selectedScoreValue !== null;
        const isDailyDouble = this.isDailyDouble;
        const isFinal = this.game.round === 'Final';

        // In Final Jeopardy, inputs are always shown.
        // In Daily Double, inputs are shown if clue is active.
        const showWager = isFinal || (isDailyDouble && isClueActive);

        return this.game.players.map(p => {
            const hasAttempted = this.game.hasPlayerAttempted(p.id);

            // Buttons always show in Final Jeopardy if not attempted, or if generic active
            const showButtons = (isClueActive || isFinal) && !hasAttempted;

            // Max Wager Logic
            const roundMax = this.game.getRoundMax();
            const limit = p.score < roundMax ? roundMax : p.score;
            const placeholder = isFinal ? 'Wager' : `Max: $${limit}`;

            return `
      <div class="player-card ${showButtons ? 'show-actions' : ''} ${showWager && !hasAttempted ? 'show-wager' : ''}" data-id="${p.id}">
        <div class="player-name">${p.name}</div>
        <div class="player-score ${p.score < 0 ? 'negative' : ''}">$${p.score}</div>
        
        <div class="wager-container">
            <input type="number" class="wager-input" data-id="${p.id}" placeholder="${placeholder}" min="0">
        </div>

        <div class="inline-actions">
            <div class="btn-inline correct" data-action="correct" data-player-id="${p.id}">✓</div>
            <div class="btn-inline incorrect" data-action="incorrect" data-player-id="${p.id}">✗</div>
        </div>
      </div>
    `}).join('');
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

        // Value Buttons (Long Press Logic)
        this.rootElement.querySelectorAll('.value-btn').forEach(btn => {
            // Click Handling
            btn.addEventListener('click', (e) => {
                if (this.longPressTriggered) return; // Prevent click after long press

                const val = parseInt(e.target.dataset.value);
                this.isDailyDouble = false; // Reset DD on normal click
                this._activateClue(val);
            });

            // Long Press Handling
            const startPress = (e) => {
                this.longPressTriggered = false;
                this.longPressTimer = setTimeout(() => {
                    this.longPressTriggered = true;
                    // Trigger Daily Double
                    const val = parseInt(btn.dataset.value);
                    this.isDailyDouble = true;
                    this._activateClue(0); // Value 0 because user enters wager

                    if (navigator.vibrate) navigator.vibrate(50);
                }, 600);
            };

            const cancelPress = () => {
                clearTimeout(this.longPressTimer);
            };

            btn.addEventListener('mousedown', startPress);
            btn.addEventListener('touchstart', startPress);
            btn.addEventListener('mouseup', cancelPress);
            btn.addEventListener('mouseleave', cancelPress);
            btn.addEventListener('touchend', cancelPress);
        });

        this.rootElement.querySelector('#next-round-btn').addEventListener('click', () => {
            this.game.nextRound();
            this._resetTurn();
        });

        this.rootElement.querySelector('#prev-round-btn').addEventListener('click', () => {
            this.game.previousRound();
            this._resetTurn();
        });

        this.rootElement.querySelector('#add-player-midgame-btn').addEventListener('click', () => {
            const name = prompt("Enter new player name:");
            if (name && name.trim()) {
                this.game.addPlayer(name.trim());
                this.refresh();
            }
        });

        this.rootElement.querySelector('#remove-player-midgame-btn').addEventListener('click', () => {
            const isDeleteMode = this.rootElement.classList.toggle('delete-mode');
            if (isDeleteMode) alert("Select a player card to remove them.");
        });
    }

    _activateClue(val) {
        if (this.selectedScoreValue === val && !this.isDailyDouble && val !== 0) {
            // Toggle off if same clicked (only for Normal)
            this.selectedScoreValue = null;
        } else {
            this.selectedScoreValue = val;
            this.game.setClueValue(val);
        }
        this.render();
    }

    _resetTurn() {
        this.selectedScoreValue = null;
        this.isDailyDouble = false;
        this.render();
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
                    if (confirm("Remove player?")) {
                        this.game.removePlayer(id);
                        this.rootElement.classList.remove('delete-mode');
                        this.refresh();
                    }
                }
            });
        });
    }

    _handleScore(playerId, correct) {
        let points = this.selectedScoreValue;

        // Daily Double or Final Jeopardy Wager Logic
        if (this.isDailyDouble || this.game.round === 'Final') {
            const input = this.rootElement.querySelector(`.wager-input[data-id="${playerId}"]`);
            if (input && input.value !== '') {
                points = parseInt(input.value);
            } else {
                points = 0;
            }
            this.game.setClueValue(points);
        }

        if (this.game.hasPlayerAttempted(playerId)) return;
        this.game.updateScore(playerId, correct);

        // UI Handling
        if (this.isDailyDouble) {
            // Daily Double: Complete Reset
            this.isDailyDouble = false;
            this.selectedScoreValue = null;
            this.game.setClueValue(0);
            this.render();
        }
        else if (this.game.round === 'Final') {
            // Final: Partial update to preserve other inputs
            this._updateCardDOM(playerId);
        }
        else {
            // Normal: Partial update to hide buttons
            this._updateCardDOM(playerId);
        }
    }

    _updateCardDOM(playerId) {
        const card = this.rootElement.querySelector(`.player-card[data-id="${playerId}"]`);
        if (!card) return;

        const player = this.game.players.find(p => p.id === playerId);

        // Update Score
        const scoreEl = card.querySelector('.player-score');
        scoreEl.textContent = `$${player.score}`;
        if (player.score < 0) scoreEl.classList.add('negative');
        else scoreEl.classList.remove('negative');

        // Hide Actions & Inputs
        card.classList.remove('show-actions');
        card.classList.remove('show-wager');
    }
}
