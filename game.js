import { nameObjectBuilder } from "./higher-order.js";
import { ensFactory } from "./factory.js";
import { names } from "./names.js";
import { stats } from "./stats.js";
import { floorPrice } from "./floorPrices.js";
import simPF from "./simulation.js";
import { Market } from "./market.js";

export class Game {
  constructor(totalTurns = 52) {
    this.market = null;
    this.turn = 0;
    this.totalTurns = totalTurns;
    this.initialPrice;
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
      // Display current market state
      this.displayMarketState();

      // Update market conditions
      this.market.updateMarketConditions();

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
      
    })
    //console.log(this.market.getMarketState());
  }

  displaySimulationSummary() {
    console.log("Simulation Summary:")
    console.log("Simulation Completed!")
    console.log(`Start Price: ${this.initialPrice}`);
  }


  static run(totalTurns = 52) {
    const game = new Game(totalTurns);
    game.startSimulation();
  }
}