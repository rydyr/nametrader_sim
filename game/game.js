import { nameObjectBuilder } from "./objectBuilder.js";
import { ensFactory } from "./factory.js";
import { names } from "./names.js";
import { stats } from "./stats.js";
import { floorPrice } from "./floorPrices.js";
import simPF from "./simulation.js";
import { Market } from "./market.js";
import { EventEmitter } from "./eventEmitter.js";
import { eventMessages } from "./eventMessages.js";
import { Event } from "./event.js";
import { DomainRenewalEmitter } from "./domainRenewalEmitter.js";
import readline from 'readline';
import { NPC } from "./npc.js";
import { npcFactory } from './npcFactory.js';
import { npcNames } from './npcNames.js';

export class Game {
  constructor(totalTurns = 52) {
    this.market = null;
    this.turn = 0;
    this.totalTurns = totalTurns;
    this.initialPrice;
    this.firstRenewal = 0;
    this.secondRenewal = 0;
    this.eventEmitter = new EventEmitter(totalTurns);
    this.domainRenewalEmitter = new DomainRenewalEmitter();
    this.initializeEvents();
    this.npcs = npcFactory(npcNames, NPC);
  }

  initializeEvents(){
    // Set renewals
    this.firstRenewal = Math.floor(Math.random() * 18) + 12;
    this.secondRenewal = Math.floor(Math.random() * (48 - 32) + 32);

    
    // Create event objects from the messages
    this.eventEmitter.events = eventMessages.map((message) => new Event(message));

    // Generate the event queue for the game session
    this.eventEmitter.generateEventQueue();
  }

  initializeGame() {
    // Create market object
    const ens = nameObjectBuilder(names, "999", stats, ensFactory);
    for (const name of ens) {
      name.calcFMV(floorPrice["999"].price);
    }
    
this.market = new Market(ens, this.npcs);

  }


  startSimulation() {
    this.initializeGame();
    this.simulationLoop();
  }

  async simulationLoop() {
    while (this.turn < this.totalTurns) {
      await this.waitForUserInput();
      // Simulate NPC market activity 
      if (this.turn === 1) { 
        this.market.simulateNPCOwnership(); 
        this.market.simulateNPCListings();
      //  console.log(this.npcs[0])
      } else { 
        this.market.updateNPCMarketActivity();

}
      
      // Display current market state
      this.displayMarketState();

      // Update market conditions
      this.market.updateMarketConditions();
      
     // Emit next event from the loop
      this.eventEmitter.emitEvent();

    // Emit domain renewals 2x
if (this.turn === this.firstRenewal || this.turn === this.secondRenewal) { this.domainRenewalEmitter.emitDomainRenewalEvent(); }


      // Simulate domain name events (e.g., renewals, expirations)
      this.market.simulateDomainEvents();

      // Update domain name prices based on market conditions
      const updatedPrices = simPF(this.market.getAssetPrices(),        this.market.volatility, this.market.marketType);
      this.market.updateAssetPrices(updatedPrices);

      // Increment turn
      this.turn++;
    }

    // Display simulation summary
    this.displaySimulationSummary();
  }

  displayMarketState() {
    const spaces = " ".repeat(2);
    console.log(`=== Turn ${this.turn} ===`);
    console.log(`Market Type: ${this.market.marketType}`);
    console.log("Domain Name\tPrice\tOwner\tBankroll");
    console.log("---------------------------------------");

    this.market.domainNames.forEach((name) => {
      const owner = name.saleData.owner;

      let bankroll = "-";
      if (owner) {
        const npc = this.npcs.find((npc) => npc.name === owner);
        if (npc) {
           bankroll = Math.floor(npc.bankroll);
        }
      }

      

      
      console.log(`${name.name} ${spaces}${name.saleData.fmv.toFixed(2)}${spaces}${owner}\t${bankroll}`);
    });

    console.log("---------------------------------------");
  }

  waitForUserInput() {
 return new Promise((resolve) => { 
const rl = readline.createInterface({ 
input: process.stdin, output: process.stdout, 
}); 
rl.question('Press Enter to proceed to the next turn...', () => { 
  console.log();
rl.close(); 
resolve(); 
})
})
}

  displaySimulationSummary() {
    console.log("Simulation Summary:")
    console.log("Simulation Completed!")
   // console.log(this.npcs[0]);
  }


  static run(totalTurns = 10) {
    const game = new Game(totalTurns);
    game.startSimulation();
  }
}