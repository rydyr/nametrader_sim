import { Event } from "./event.js";

export class EventEmitter {
  constructor(totalEvents) {
    this.events = [];
    this.totalEvents = totalEvents;
    this.eventQueue = [];
    this.renewalCount = 0;
  }

  generateEventQueue() {
    // Add the first event (always the same)
    this.eventQueue.push(
      new Event(
        "\n\t\t||====================||\n\t\t||== NAMETRADER.ETH ==||\n\t\t||====================||\n\n\t\t **Welcome to the Game!**\n\n||\t In Web3 you're nobody without a ||\n||.eth! So to get you started off \t ||\n||right we're gifting you 'human.eth'||\n||and lending you $100,000. You have ||\n||52 weeks to make your buck and pay ||\n||us back Anon!\t\t\t\t\t\t ||",
      ),
    );

    // Generate 50 random events from the event pool
    const randomEvents = this.getRandomEvents(50);
    this.eventQueue.push(...randomEvents);

    // Add the last event (always the same)
    this.eventQueue.push(new Event("Game Over!"));
  }

  getRandomEvents(count) {
    const shuffledEvents = this.events.slice().sort(() => 0.5 - Math.random());
    return shuffledEvents.slice(0, count);
  }

  emitEvent() {
    if (this.eventQueue.length > 0) {
      const event = this.eventQueue.shift();
      console.log(`[Event]: ${event.message}`);

      if (event.impact) {
        // Apply the event impact to the game state
        // For example, update player's negotiation or selling ability
        // based on the event attributes
      }
    }
  }

  generateDomainRenewalEvent() {
    if (this.renewalCount < 3) {
      const renewalEvent = new Event(
        "Domain renewal notice: Your domain is about to expire!",
      );
      this.eventQueue.unshift(renewalEvent);
      this.renewalCount++;
    }
  }
}
