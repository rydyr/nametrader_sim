export class NPC {
  constructor(name){
    this.name = name;
    this.bankroll = Math.floor(Math.random() * 1000000);
    this.valueModifier = Math.random() * 0.5;
    this.portfolio = [];
    this.xray = false;
    this.extraTurn = false;
  }
}