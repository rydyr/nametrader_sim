// domainRenewalEmitter.js
export class DomainRenewalEmitter { constructor() { 
  this.renewalCount = 0; 
  } 
                                   emitDomainRenewalEvent() { 
    if (this.renewalCount < 3) {         console.log("[Domain Renewal]: Domain renewal notice: Your domain is about to expire!");     this.renewalCount++; 
    } 
  } 
}

// event.js
export class Event {
  constructor(message, impact = false) {
    this.message = message;
    this.impact = impact;
  }
}

// eventEmitter.js
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
    this.eventQueue.push(new Event("Welcome to the game!"));

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
      const renewalEvent = new Event("Domain renewal notice: Your domain is about to expire!");
      this.eventQueue.unshift(renewalEvent);
      this.renewalCount++;
    }
  }
}

// factory.js
import { ENSName } from './nameClass.js';

export function ensFactory(name, category, stats) {
  return new ENSName(name, category, stats);
}

// game.js
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
      const owner = name.npcOwner ? name.npcOwner.name : "-";
      const bankroll = name.npcOwner ? Math.floor(name.npcOwner.bankroll) : "-";
      const vPrice = parseInt(Math.floor(name.saleData.price));
      const aPrice = vPrice.toString().padEnd(6," ");
      const price = name.saleData.forSale ? aPrice : '0     ';
      console.log(`${name.name} ${spaces}${price}${spaces}${owner.padEnd(10," ")}\t${bankroll}`);
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


  static run(totalTurns = 53) {
    const game = new Game(totalTurns);
    game.startSimulation();
  }
}

// market.js
export class Market {
  constructor(domainNames,npcs) {
    this.domainNames = domainNames;
    this.marketType = "normal";
    this.volatility = 0.1;
    this.turnCount = 0;
    this.bear = false;
    this.bearStart = 0;
    this.bearEnd = 0;
    this.bearMarketTurns = 0;
    this.bull = false;
    this.bullStart = 0;
    this.bullEnd = 0;
    this.bullMarketTurns = 0;
    this.npcs = npcs;
    this.npcOwnedPercentage = 1;
    this.npcPercentageListed = 0.5;
    this.npcPriceMultiplier = Math.random() * 1 + 1

    this.setMarketStartTurns();
  }

  // Set Market-type start-end

  setMarketStartTurns() {
    this.bearStart = Math.floor(Math.random() * 21) + 6;
    this.bullStart = Math.floor(Math.random() * (48 - 32) + 32);
    this.bearEnd = Math.floor(Math.random() * 7) + 5;
    this.bullEnd = Math.floor(Math.random() * 7) + 5;
  }

  updateMarketConditions() {
    // Update market type and volatility based on simulation logic
    this.turnCount++;

    // Determine if a bear or bull market should occur
    if (this.turnCount >= 5 && this.turnCount <= 47) {
      if (this.marketType === "normal") {
        
        if (this.turnCount === this.bearStart && !this.bear) {
          this.marketType = "bear"; 
          this.bear = true;
          this.sendMessage("Bear Market has started!")
        } else if (this.turnCount === this.bullStart && !this.bull) {
        this.marketType = "bull";
        this.bull = true;
        this.sendMessage("Bull Market has started!");
        }
      } else if (this.marketType === "bear") {
        this.bearMarketTurns++;
      } else if (this.marketType === "bull") {
        this.bullMarketTurns++;
      }
    }

    // Update market type back to normal if bear or bull market duration is over
    if (
      (this.marketType === "bear" && this.bearMarketTurns >= this.bearEnd) ||
      (this.marketType === "bull" && this.bullMarketTurns >= this.bullEnd)
    ) {
      this.marketType = "normal";
      this.sendMessage("The Market has returned to normal.")
    }

    if (this.marketType === "normal") {
      this.volatility = Math.min(Math.max(this.volatility + (Math.random() - 0.5) * 0.02, 0), 0.15);
    } else {
      this.volatility = Math.min(Math.max(this.volatility + (Math.random() - 0.5) * 0.05, 0), 0.25);
    }
  }

  getAssetPrices() {
    return this.domainNames.reduce((prices, name) => {
      prices[name.name] = { price: name.saleData.fmv };
      return prices;
    }, {});
  }

  updateAssetPrices(updatedPrices) {
    this.domainNames.forEach((name) => {
      name.saleData.fmv = updatedPrices[name.name].price;
    });
  }

  sendMessage(message) {
    return console.log(`Market Message: ${message}`);
  }

  getMarketState() {
    // Return the current state of the market
    return {
      domainNames: this.domainNames,
      marketType: this.marketType,
      volatility: this.volatility,
    };
  }

  simulateNPCOwnership() {
    this.domainNames.forEach((name) => {
      const randomNPC = this.npcs[Math.floor(Math.random() * this.npcs.length)];
      name.npcOwner = randomNPC;
      name.saleData.owner = randomNPC.name;
      randomNPC.portfolio.push(name);
    });
  }

  simulateNPCListings() {
    const npcOwnedDomains = this.domainNames.filter((name) => name.npcOwner);
    const npcListedCount = Math.floor(npcOwnedDomains.length * this.npcPercentageListed);
    const shuffledNPCDomains = npcOwnedDomains.sort(() => 0.5 - Math.random());
    shuffledNPCDomains.slice(0, npcListedCount).forEach((name) => {
      
/**********Logging**********

      console.log(`[Listing] Domain: ${name.name}`); 
      console.log(`[Listing] Owner: ${name.npcOwner.name}, Bankroll Before: ${name.npcOwner.bankroll}`); 
      */
      
      name.saleData.forSale = true;
      name.saleData.price = Math.floor(name.saleData.fmv * name.npcOwner.valueModifier);

/********** logging *********
      
      console.log(`[Listing] Owner: ${name.npcOwner.name}, Bankroll After: ${name.npcOwner.bankroll}`); 
      console.log(`[Listing] Listed Price: ${name.saleData.price}`);
***************************/
    });
  }

  logMarketMessage(message) {
    return console.log(`Sales Bot: ${message}`)
  }

  updateNPCMarketActivity() {
    const npcOwnedDomains = this.domainNames.filter((name) => name.npcOwner);
    const shuffledNPCDomains = npcOwnedDomains.sort(() => 0.5 - Math.random());

    shuffledNPCDomains.forEach((name) => {
      // Simulate NPC sales
      if (name.saleData.forSale && Math.random() < 0.3) { // 30% chance of sale per listed domain
        const salePrice = name.saleData.price;

        let newOwner;
        do {
          newOwner = this.npcs[Math.floor(Math.random() * this.npcs.length)];
        } while (newOwner === name.npcOwner);

        if (newOwner.bankroll >= salePrice) {
          name.saleData.owner = newOwner.name;

          name.npcOwner.portfolio = name.npcOwner.portfolio.filter((d) => d !== name);
          name.npcOwner.bankroll += salePrice;
          name.npcOwner = newOwner;
          newOwner.portfolio.push(name);
          newOwner.bankroll -= salePrice;
/*
          if (name.status === "premium") {
            this.logMarketMessage(`Premium name ${name.name} has been sold!`);
          } else if (name.status === "grail") {
            this.logMarketMessage(`Grail name ${name.name} has been sold!`);*/
          this.logMarketMessage(`Name ${name.name} has been sold!`);
          }
        }
        name.saleData.forSale = false;

      // Simulate change in listings
      if (name.saleData.forSale && Math.random() < 0.2) {
        name.saleData.forSale = false; // 20% chance of delisting per turn
      } else if (!name.saleData.forSale && Math.random() < 0.15) {
        name.saleData.forSale = true; // 15% chance of listing per turn
        name.saleData.price = Math.floor(name.saleData.fmv * name.npcOwner.valueModifier);
      }
    });
  }
  
}

// nameClass.js
import factor from "./nameFactor.js";

export class ENSName {
  constructor(name,category,stats){
  let status = "common";
  let newName = name.padStart(3,'0');
    if (stats) {
       if (stats.premium.includes(newName)) {
          status = "premium";
       } else if (stats.grail.includes(newName)) {
          status = "grail";
       }
    }
    this.name = newName + '.eth';
    this.category = category;
    this.status = status;
    this.npcOwner = false;
    this.saleData = {
      factor: factor(status),
      fmv: 0,
      owner: '',
      forSale: false,
      price: 0,
    }
  };
}



ENSName.prototype.calcFMV = function(marketPrice) {
  this.saleData.fmv = marketPrice * this.saleData.factor;
};


// nameFactor.js
export default function factor(status) { 
  const commonFactor = Math.random() * (2 - 1) + 1; 
  const premiumFactor = Math.random() * (3 - 2) + 2; 
  const grailFactor = Math.random() * (4 - 3) + 3;

switch (status) {
  case "grail":
    return grailFactor;
  case "premium":
    return premiumFactor;
  default:
    return commonFactor;
}
}


  


// names.js
export const names = Array.from({ length: 12 }, (_, i) => i.toString().padStart(3, '0'));

// negotiationWizard.js
export class Negotiation {
  constructor(buyer, seller, domain, offer) {
    this.no = domain.fmv;
    this.yes = (((domain.fmv * seller.valueModifier) + domain.fmv) * 100) / 100;
    this.offer = offer;
    this.sellerBankroll = seller.bankroll;
    this.buyerBankroll = buyer.bankroll;
    this.buyerName = buyer.name;
    this.sellerName = seller.name;
    this.domainName = domain.name;
    this.difficulty = buyer.valueModifier || 1;
    this.probability = (this.offer - this.no) / (this.yes - this.no) / this.difficulty;
  }

  getProbability() {
    if (this.offer >= this.yes) {
      return "Probability of acceptance: 100%";
    } else if (this.offer <= this.no) {
      return "Probability of acceptance: 0%";
    } else {
      const probability = Math.floor(this.probability * 100);
      return `Probability of acceptance: ${probability}%`;
    }
  }

  getResponse() {
    if (this.offer >= this.yes) {
      return "Offer Accepted!";
    } else if (this.offer <= this.no) {
      const stinkbid = this.no - (this.no * 0.60);
      const offensive = this.no - (this.no * 0.30);
      const poorTaste = this.no - (this.no * 0.15);

      if (this.offer <= stinkbid) {
        return "You've offended me for the last time!";
      } else if (this.offer > stinkbid && this.offer <= offensive) {
        return "You have offended me!";
      } else if (this.offer > offensive && this.offer <= poorTaste) {
        return "What poor taste!";
      } else {
        return "Offer declined!";
      }
    } else {
      if (Math.random() < this.probability) {
        const response = [
          "Offer Accepted!",
          `${this.domainName}`,
          `Listed at: ${this.yes.toFixed(2)} by ${this.sellerName}`,
          `Sold for: ${this.offer} to ${this.buyerName}`,
          `Sellers starting bankroll: ${this.sellerBankroll}`,
          `Sellers ending bankroll: ${this.sellerBankroll + this.offer}`,
          `Buyers starting bankroll: ${this.buyerBankroll}`,
          `Buyers ending bankroll: ${this.buyerBankroll - this.offer}`
        ];
        return response.join("\n");
      } else {
        return "Offer Declined!";
      }
    }
  }
}

// npc.js
export class NPC {
  constructor(name){
    this.name = name;
    this.bankroll = Math.floor(Math.random() * 1000000);
    this.valueModifier = (Math.random() * 0.5) + 1;
    this.portfolio = [];
    this.xray = false;
    this.extraTurn = false;
  }
}

// npcFactory.js
export function npcFactory(npcNames,NPC) {
  return npcNames.map(npcName => {
    return new NPC(npcName);
  });
}

// objectBuilder.js
export function nameObjectBuilder(names, category, stats, factory) {
  return names.map((name) => factory(name, category, stats));
}


// player.js
export const player1 = {
  name: "nametrader.eth",
  bankroll: 35000,
  valueModifier: 1,
  portfolio: [],
  xray: false,
  extraTurn: false,
}

// simulation.js
export default function simPF(assetPrices, volatility = 0.1, marketType = "normal") {
  const changeThresholds = [
    { pMin: 0.5, maxChange: 0.05 },
    { pMin: 0.7, maxChange: 0.12 },
    { pMin: 0.8, maxChange: 0.18 },
    { pMin: 0.9, maxChange: 0.25 }
  ];

  // Iterate over each asset in the assetPrices object
  for (const key in assetPrices) {
    if (assetPrices.hasOwnProperty(key)) {
      const asset = assetPrices[key];
      let directionBias;

      // Determine the direction bias based on the market type
      if (marketType === "bear") {
        directionBias = -1;
      } else if (marketType === "bull") {
        directionBias = 1;
      } else {
        directionBias = Math.random() < 0.4 ? -1 : 1;
      }

      // Calculate the initial percentage change based on volatility and direction bias
      let percentageChange = Math.random() * volatility * directionBias;

      // Randomly adjust the percentage change in non-normal market conditions
      if (marketType !== "normal" && Math.random() > 0.8) {
        percentageChange *= -1;
      }

      // Determine the maximum change based on the change thresholds
      let maxChange = changeThresholds[changeThresholds.length - 1].maxChange;
      for (const threshold of changeThresholds) {
        if (Math.random() >= threshold.pMin) {
          maxChange = threshold.maxChange;
          break;
        }
      }

      // Clamp the percentage change within the maximum change range
      percentageChange = Math.max(Math.min(percentageChange, maxChange), -maxChange);

      // Calculate the new price based on the percentage change
      const newPrice = asset.price * (1 + percentageChange);
      assetPrices[key].price = Math.round(newPrice * 100) / 100;
    }
  }

  return assetPrices;
}

