import { player1 } from "./player.js";

export class Market {
  constructor(domainNames, npcs) {
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
    this.npcPriceMultiplier = Math.random() * 1 + 1;

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
          this.sendMessage("Bear Market has started!");
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
      this.sendMessage("The Market has returned to normal.");
    }

    if (this.marketType === "normal") {
      this.volatility = Math.min(
        Math.max(this.volatility + (Math.random() - 0.5) * 0.02, 0),
        0.15,
      );
    } else {
      this.volatility = Math.min(
        Math.max(this.volatility + (Math.random() - 0.5) * 0.05, 0),
        0.25,
      );
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
      if (!name.npcOwner && name.saleData.owner !== player1.name && !name.saleData.forSale) {
        const randomNPC =
          this.npcs[Math.floor(Math.random() * this.npcs.length)];
        name.npcOwner = randomNPC;
        name.saleData.owner = randomNPC.name;
        randomNPC.portfolio.push(name);
      }
    });
  }

  simulateNPCListings() {
    const npcOwnedDomains = this.domainNames.filter(
      (name) => name.npcOwner && name.saleData.owner !== player1.name 
    );
    const npcListedCount = Math.floor(
      npcOwnedDomains.length * this.npcPercentageListed,
    );
    const shuffledNPCDomains = npcOwnedDomains.sort(() => 0.5 - Math.random());
    shuffledNPCDomains.slice(0, npcListedCount).forEach((name) => {
      name.saleData.forSale = true;
      name.saleData.price = Math.floor(
        name.saleData.fmv * name.npcOwner.valueModifier,
      );
    });
  }

  logMarketMessage(message) {
    return console.log(`Sales Bot: ${message}`);
  }

  listPlayerDomain(domain, salePrice) {
    domain.saleData.forSale = true;
    domain.saleData.price = salePrice;
  }
  

  updateNPCMarketActivity() {
    const domainsForSale = this.domainNames.filter(
      (name) => name.saleData.forSale);
    const shuffledDomains = domainsForSale.sort(() => 0.5 - Math.random());

    shuffledDomains.forEach((name) => {
      // Simulate sales
      if (Math.random() < 0.3) {
        // 30% chance of sale per listed domain
        const salePrice = name.saleData.price;
        const nameFMV = name.saleData.fmv;
        const newOwner = this.npcs[Math.floor(Math.random() * this.npcs.length)];
        const ownerValVar = newOwner.valueModifier;
        const decidingFactor = nameFMV * ownerValVar;
        const decidingCondition = name.saleData.price >= decidingFactor * 1.2 ? false : (name.saleData.price >= decidingFactor ? (Math.random() < 0.5 ? true : false) : true);
        
        if (decidingCondition) {
          if (newOwner.bankroll >= salePrice) {
            if (name.saleData.owner === player1.name) {
              //transfer ownership from player to NPC
              player1.portfolio = player1.portfolio.filter(
                (domain) => domain !== name,
              );
              player1.bankroll += salePrice;
              name.saleData.owner = newOwner.name;
              name.npcOwner = newOwner;
              newOwner.portfolio.push(name);
              newOwner.bankroll -= salePrice;
            } else {
            //transfer ownership between NPCs
            name.saleData.owner = newOwner.name;
            name.npcOwner.portfolio = name.npcOwner.portfolio.filter(
              (d) => d !== name,
            );
            name.npcOwner.bankroll += salePrice;
            name.npcOwner = newOwner;
            newOwner.portfolio.push(name);
            newOwner.bankroll -= salePrice;
          }
            /*
              if (name.status === "premium") {
                this.logMarketMessage(`Premium name ${name.name} has been sold!`);
              } else if (name.status === "grail") {
                this.logMarketMessage(`Grail name ${name.name} has been sold!`);*/
            this.logMarketMessage(`Name ${name.name} has been sold!`);
          }
        }
      }
      if(name.saleData.owner !== player1.name) {
     name.saleData.forSale = false;
      };
      // Simulate change in listings
      if (name.saleData.owner !== player1.name && name.saleData.forSale && Math.random() < 0.2) {
        name.saleData.forSale = false; // 20% chance of delisting per turn
      } else if (!name.saleData.forSale && Math.random() < 0.15) {
        name.saleData.forSale = true; // 15% chance of listing per turn
        name.saleData.price = Math.floor(
          name.saleData.fmv * name.npcOwner.valueModifier
        );
      }
    });
  }
}
