import { Player } from './Player.js';

export class Game {
    constructor() {
        this.players = [];
        this.round = 'Jeopardy'; // Jeopardy, Double, Final
        this.currentClueValue = 0;
        this.attemptedPlayers = new Set();
        this.settings = {
            mercyRule: true // Allow players with < 0 to play Final Jeopardy
        };
        this.history = []; // History stack for Undo
    }

    saveState() {
        // Deep clone state for history
        const state = JSON.parse(JSON.stringify(this.serialize()));
        this.history.push(state);
        if (this.history.length > 20) this.history.shift(); // Limit history to last 20 actions
    }

    undo() {
        if (this.history.length === 0) return false;
        const previousState = this.history.pop();
        this.restore(previousState);
        return true;
    }

    setSetting(key, value) {
        if (key in this.settings) {
            this.saveState();
            this.settings[key] = value;
        }
    }

    addPlayer(name) {
        this.saveState();
        const player = new Player(name);
        this.players.push(player);
        return player;
    }

    removePlayer(playerId) {
        this.saveState();
        this.players = this.players.filter(p => p.id !== playerId);
    }

    updateScore(playerId, correct) {
        const player = this.players.find(p => p.id === playerId);
        if (!player) return;

        this.saveState(); // Save before modifying score
        this.attemptedPlayers.add(playerId);

        if (correct) {
            player.addScore(this.currentClueValue);
        } else {
            player.subtractScore(this.currentClueValue);
        }
    }

    setClueValue(value) {
        this.currentClueValue = value;
        // Do not save state here; value selection is trivial. 
        // We save on score update or round change.
    }

    clearAttempts() {
        this.attemptedPlayers.clear();
    }

    hasPlayerAttempted(playerId) {
        return this.attemptedPlayers.has(playerId);
    }

    nextRound() {
        this.saveState();
        if (this.round === 'Jeopardy') {
            this.round = 'Double';
        } else if (this.round === 'Double') {
            this.round = 'Final';
        }
        this.currentClueValue = 0;
        this.attemptedPlayers.clear();
    }

    previousRound() {
        this.saveState();
        if (this.round === 'Final') {
            this.round = 'Double';
        } else if (this.round === 'Double') {
            this.round = 'Jeopardy';
        }
        this.currentClueValue = 0;
        this.attemptedPlayers.clear();
    }

    getRoundMax() {
        if (this.round === 'Jeopardy') return 1000;
        if (this.round === 'Double') return 2000;
        return 0;
    }

    // Persistence
    serialize() {
        return {
            players: this.players.map(p => ({
                id: p.id,
                name: p.name,
                score: p.score
            })),
            round: this.round,
            currentClueValue: this.currentClueValue,
            attemptedPlayers: Array.from(this.attemptedPlayers),
            settings: this.settings
        };
    }

    restore(data) {
        this.round = data.round;
        this.currentClueValue = data.currentClueValue;
        this.attemptedPlayers = new Set(data.attemptedPlayers);
        if (data.settings) this.settings = data.settings;

        // Re-hydrate players
        this.players = data.players.map(pData => {
            const p = new Player(pData.name);
            p.id = pData.id;
            p.score = pData.score;
            return p;
        });
    }

    static deserialize(data) {
        const game = new Game();
        game.restore(data);
        return game;
    }
}
