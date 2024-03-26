export class Event {
  constructor(message, impact = false) {
    this.message = message;
    this.impact = impact;
  }
}