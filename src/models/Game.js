import { Player } from './Player.js';

export class Game {
    constructor() {
        this.players = [];
        this.round = 'Jeopardy'; // Jeopardy, Double, Final
        this.currentClueValue = 0;
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

        if (correct) {
            player.addScore(this.currentClueValue);
        } else {
            player.subtractScore(this.currentClueValue);
        }
    }

    setClueValue(value) {
        this.currentClueValue = value;
    }

    nextRound() {
        if (this.round === 'Jeopardy') {
            this.round = 'Double';
        } else if (this.round === 'Double') {
            this.round = 'Final';
        }
        // Reset or adjust logic as needed for round transitions
    }

    getPlayers() {
        return this.players;
    }
}
