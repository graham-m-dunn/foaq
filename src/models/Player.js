export class Player {
  constructor(name) {
    this.id = crypto.randomUUID();
    this.name = name;
    this.score = 0;
  }

  addScore(amount) {
    this.score += amount;
  }

  subtractScore(amount) {
    this.score -= amount;
  }
}
