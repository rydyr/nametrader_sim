import { nameObjectBuilder } from "./higher-order.js";
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
    this.market = new Market(ens);
  }

  startSimulation() {
    this.initializeGame();
    this.simulationLoop();
  }

  simulationLoop() {
    while (this.turn < this.totalTurns) {
      // Simulate NPC market activity 
      if (this.turn === 1) { 
        this.market.simulateNPCOwnership(); 
        this.market.simulateNPCListings();
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

  // Placeholder methods to be implemented
  displayMarketState() {
    console.log(`Turn: ${this.turn}`);
    console.log(`Market State: ${this.market.marketType}`);
/*
    console.log("Domain name sale data (first 1):");
    const domainNamesToDisplay = this.market.domainNames.slice(0, 1);
    domainNamesToDisplay.forEach((name) => {
      const data = {
        name: name.name,
        saleData: name.saleData.fmv
      };
      console.log(JSON.stringify(data, null, 2));
      console.log("---")
      if (this.turn === 1) {
         this.initialPrice = name.saleData.fmv;
      }
    }) */
    //console.log(this.market.getMarketState());
  }

  displaySimulationSummary() {
    console.log("Simulation Summary:")
    console.log("Simulation Completed!")
   // console.log(`Start Price: ${this.initialPrice}`);
  }


  static run(totalTurns = 53) {
    const game = new Game(totalTurns);
    game.startSimulation();
  }
}