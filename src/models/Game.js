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
    }

    setSetting(key, value) {
        if (key in this.settings) {
            this.settings[key] = value;
        }
    }

    addPlayer(name) {
        const player = new Player(name);
        this.players.push(player);
        return player;
    }

    removePlayer(playerId) {
        this.players = this.players.filter(p => p.id !== playerId);
    }

    updateScore(playerId, correct) {
        const player = this.players.find(p => p.id === playerId);
        if (!player) return;

        this.attemptedPlayers.add(playerId);

        if (correct) {
            player.addScore(this.currentClueValue);
        } else {
            player.subtractScore(this.currentClueValue);
        }
    }

    setClueValue(value) {
        this.currentClueValue = value;
        this.attemptedPlayers.clear();
    }

    hasPlayerAttempted(playerId) {
        return this.attemptedPlayers.has(playerId);
    }

    nextRound() {
        if (this.round === 'Jeopardy') {
            this.round = 'Double';
        } else if (this.round === 'Double') {
            this.round = 'Final';
        }
        this.currentClueValue = 0;
        this.attemptedPlayers.clear();
    }

    previousRound() {
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

    static deserialize(data) {
        const game = new Game();
        game.round = data.round;
        game.currentClueValue = data.currentClueValue;
        game.attemptedPlayers = new Set(data.attemptedPlayers);
        if (data.settings) game.settings = data.settings;

        // Re-hydrate players
        game.players = data.players.map(pData => {
            const p = new Player(pData.name);
            p.id = pData.id;
            p.score = pData.score;
            return p;
        });

        return game;
    }
}
