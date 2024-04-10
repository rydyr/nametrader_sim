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
import readline from "readline";
import { NPC } from "./npc.js";
import { npcFactory } from "./npcFactory.js";
import { npcNames } from "./npcNames.js";
import { player1 } from "./player.js";
import { Negotiation } from "./negotiationWizard.js";

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

  initializeEvents() {
    // Set renewals
    this.firstRenewal = Math.floor(Math.random() * 18) + 12;
    this.secondRenewal = Math.floor(Math.random() * (48 - 32) + 32);

    // Create event objects from the messages
    this.eventEmitter.events = eventMessages.map(
      (message) => new Event(message),
    );

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

  async startSimulation() {
    this.initializeGame();
    await this.handleUserInput();
    this.simulationLoop();
  }

  async simulationLoop() {
    while (this.turn < this.totalTurns) {
      // Simulate NPC market activity
      if (this.turn) {
        this.market.simulateNPCOwnership();
        this.market.simulateNPCListings();
        
      }

      // Display current market state
      if (this.turn >= 1) {
        this.displayMarketState();
      }
      // Update market conditions
      this.market.updateMarketConditions();

      // Emit next event from the loop
      this.eventEmitter.emitEvent();

      // Emit domain renewals 2x
      if (this.turn === this.firstRenewal || this.turn === this.secondRenewal) {
        this.domainRenewalEmitter.emitDomainRenewalEvent();
      }

      // Update domain name prices based on market conditions
      const updatedPrices = simPF(
        this.market.getAssetPrices(),
        this.market.volatility,
        this.market.marketType,
      );
      this.market.updateAssetPrices(updatedPrices);

      // Increment turn
      this.turn++;

      // Handle user input for the next turn
      await this.handleUserInput();
    }

    // Display simulation summary
    this.displaySimulationSummary();
  }

  displayMarketState() {
    const spaces = " ".repeat(2);
    console.log(`=== Week ${this.turn} ===\t\t\t== ${player1.name} ==`);
    console.log(
      `Market Type: ${this.market.marketType}\t\t\t=${player1.bankroll}=`,
    );
    console.log("Domain Name\tPrice\tOwner\tBankroll");
    console.log("---------------------------------------");

    this.market.domainNames.forEach((name) => {
      const owner = name.npcOwner ? name.npcOwner.name : name.saleData.owner;
      const bankroll = name.npcOwner
        ? Math.floor(name.npcOwner.bankroll)
        : Math.floor(player1.bankroll);
      // const allBankrolls = name.saleData.owner === player1.name ? player1.bankroll : bankroll;
      const vPrice = parseInt(Math.floor(name.saleData.price));
      const aPrice = vPrice.toString().padEnd(6, " ");
      const price = name.saleData.forSale ? aPrice : "-     ";
      console.log(
        `${name.name} ${spaces}${price}${spaces}${owner.padEnd(10, " ")}\t${bankroll}`,
      );
    });

    console.log("---------------------------------------");
  }

  async handleUserInput() {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    while (true) {
      const question =
        this.turn <= 1
          ? "\nPress Enter to Start...\n"
          : "\n\t\t\tOptions:\n\n[B] = Buy\n[N] = Negotiate \n[L] = List\n[D] = Delist\n[A] = Acc Bal\n[P] = Portfolio\n[Enter] = Next Turn...\n\n";

      const answer = await new Promise((resolve) => {
        rl.question(question, (input) => {
          resolve(input.trim().toLowerCase());
        });
      });

      if (answer === "buy" || answer === "b") {
       const buyResponse = await this.handleBuyAction(rl);
        this.displayMarketState();
        console.log(buyResponse)
        console.log();
        continue;
      } else if (answer === "list" || answer === "l") {
       const sellResponse = await this.handleSellAction(rl);
        console.log(sellResponse);
        console.log();
        continue;
      } else if (answer === "negotiate" || answer === "n") {
        let neg;
        let prob;
        await this.handleNegotiateAction(rl, (negotiate,probability) => {
            neg = negotiate.text;
            prob = probability.text;
        });
        this.displayMarketState();
        console.log(prob);
        console.log(neg);
        console.log();
        continue;
      } else if (answer === "a") {
        console.log(`\nYour current account balance is: ${player1.bankroll}`);
        console.log();
      } else if (answer === "p") {
        this.getPlayerPortfolio();
        console.log();
        continue;        
      } else if(answer === "d") {
        await this.handleUserDelist(rl);
        console.log();
        this.displayMarketState();
        console.log();
        continue;
      } else if (answer === "") {
        this.market.updateNPCMarketActivity();
        console.log();
        break;
      } else {
        console.log("Invalid input. Please try again.");
      }
    }
    rl.close();
  }

  displaySimulationSummary() {
    console.log("Simulation Summary:");
    console.log("Simulation Completed!");
    // console.log(this.npcs[0]);
  }

  async handleBuyAction(rl) {
    // Prompt the player to enter the domain name they want to buy
    const domainName = await new Promise((resolve) => {
      rl.question("Enter the domain name you want to buy: ", (name) => {
        resolve(name);
      });
    });

    // Find the domain in the market
    const domain = this.market.domainNames.find(
      (name) => name.name === domainName,
    );

    if (domain && domain.saleData.forSale) {
      if (player1.bankroll >= domain.saleData.price) {
        // Transfer ownership and update bankrolls
        domain.npcOwner.portfolio = domain.npcOwner.portfolio.filter(
          (d) => d !== domain,
        );
        domain.npcOwner.bankroll += domain.saleData.price;
        domain.npcOwner = null;
        player1.portfolio.push(domain);
        player1.bankroll -= domain.saleData.price;
        domain.saleData.owner = player1.name;
        domain.saleData.forSale = false;
        domain.saleData.last_sale_price = domain.saleData.price;
        return `Successfully bought ${domainName}!`;
      } else {
        return "Insufficient funds to buy the domain.";
      }
    } else {
      return "Domain not found or not for sale.";
    }
  }

  async handleSellAction(rl) {
    // Prompt the player to enter the domain name they want to sell
    const domainName = await new Promise((resolve) => {
      rl.question("Enter the domain name you want to sell: ", (name) => {
        resolve(name);
      });
    });

    // Find the domain in the player's portfolio
    const domain = player1.portfolio.find((name) => name.name === domainName);

    if (domain) {
      // Prompt the player to enter the sale price
      const salePrice = await new Promise((resolve) => {
        rl.question("Enter the sale price: ", (price) => {
          resolve(parseFloat(price));
        });
      });

      // List the domain for sale
      this.market.listPlayerDomain(domain, salePrice);
      this.displayMarketState();
      return `Successfully listed ${domainName} for sale!`;
    } else {
      return "Domain not found in your portfolio.";
    }
  }

  async handleNegotiateAction(rl, callback) {
    // Prompt the player to enter the domain name they want to negotiate for
    const domainName = await new Promise((resolve) => {
      rl.question(
        "Enter the domain name you want to negotiate for: ",
        (name) => {
          resolve(name);
        },
      );
    });

    // Find the domain in the market
      const domain = this.market.domainNames.find(
        (name) => name.name === domainName,
      );

      // Prompt the player to enter the offer price
      const offerPrice = await new Promise((resolve) => {
        rl.question("Enter your offer price: ", (price) => {
          resolve(parseFloat(price));
        });
      });

      // Create a new negotiation instance
      const negotiation = new Negotiation(
        player1,
        domain.npcOwner,
        domain,
        offerPrice,
      );

      const negotiate = await negotiation.getResponse();
      const probability = negotiation.getProbability();
      // Handle the negotiation outcome
      if (negotiate.value) {
        // Transfer ownership and update bankrolls
        domain.npcOwner.portfolio = domain.npcOwner.portfolio.filter(
          (d) => d !== domain,
        );
        domain.npcOwner.bankroll += offerPrice;
        domain.npcOwner = null;
        player1.portfolio.push(domain);
        player1.bankroll -= offerPrice;
        domain.saleData.owner = player1.name;
        domain.saleData.forSale = false;
        domain.saleData.last_sale_price = offerPrice;
        callback(negotiate,probability)
    return 
    } else {
        callback(negotiate,probability)
      return
    }
  }

  getPlayerPortfolio() {
    console.log(`\n=== ${player1.name}'s Portfolio ===`);
    console.log("Domain Name\tPurchase Price\tSale Price");
    console.log("---------------------------------------");

   player1.portfolio.forEach((name) => {
      const price = name.saleData.price ? name.saleData.price : "-";
      const purchPrice = name.saleData.last_sale_price ? name.saleData.last_sale_price : "-";
      console.log(`${name.name}\t\t${purchPrice}\t\t${price}`);
    });
    console.log("---------------------------------------");
  }

  async handleUserDelist(rl){
    // Prompt the player to enter the domain name they want to delist
    const domainToDelist = await new Promise((resolve) => {
      rl.question("Enter the domain name you want to delist: ", (name) => {
        resolve(name);
      });
    });

    // Find the domain in the market
    const domain = player1.portfolio.find(
      (name) => name.name === domainToDelist);

    if(domain){
      if (domain.saleData.forSale) {
        domain.saleData.forSale = false;
        return `Successfully delisted ${domainToDelist}!`;
      } else {
        return "Domain not listed for sale.";
      }
    } else {
      return "Domain not found.";
    }
  }

  static run(totalTurns = 53) {
    const game = new Game(totalTurns);
    game.startSimulation();
  }
}
