export class Market {
  constructor(domainNames) {
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
    this.npcOwnedPercentage = 0.3;
    this.npcPercentageListed = 0.2;
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

  
  simulateDomainEvents() {
    // Simulate domain name events (e.g., renewals, expirations)
    // ...
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

  simulateNPCOwnership(){
    const npcOwnedCount = Math.floor(this.domainNames.length * this.npcOwnedPercentage);
    const shuffledDomains = this.domainNames.sort(() => 0.5 - Math.random());
    shuffledDomains.slice(0,npcOwnedCount).forEach((name) => {
      name.npcOwner = true;
    });
  }

  simulateNPCListings() {
    const npcOwnedDomains = this.domainNames.filter((name) => name.npcOwner);
    const npcListedCount = Math.floor(npcOwnedDomains.length * this.npcPercentageListed);
    const shuffledNPCDomains = npcOwnedDomains.sort(() => 0.5 - Math.random());
    shuffledNPCDomains.slice(0, npcListedCount).forEach((name) => {
      name.saleData.forSale = true;
      name.saleData.price = Math.floor(name.saleData.fmv * this.npcPriceMultiplier);
    });
  }


  updateNPCMarketActivity() {
  // Simulate NPC ownership change.
    const npcOwnedDomains = this.domainNames.filter((name) => name.npcOwner);
    const shuffledNPCDomains = npcOwnedDomains.sort(() => 0.5 - Math.random());
    const changeCount = Math.floor(npcOwnedDomains.length * 0.02);  // 2% change in ownership 

shuffledNPCDomains.slice(0, changeCount).forEach((name) => { 
name.npcOwner = false; 
});

    // Simulate NPC sales 
    const npcListedDomains = npcOwnedDomains.filter((name) => name.saleData.forSale); 
    const saleCount = Math.floor(npcListedDomains.length * 0.1); // 10% of listed domains sold per turn 
    const shuffledListedDomains = npcListedDomains.sort(() => 0.5 - Math.random()); 
    shuffledListedDomains.slice(0, saleCount).forEach((name) => { 
      name.npcOwner = false;           name.saleData.forSale = false;                                 name.saleData.owner = ''; // Clear the owner 
      
      if (name.status === "premium" ) {
        this.logMarketMessage(`Premium name ${name.name} has been sold!`); 
      } else if (name.status === "grail") {
        this.logMarketMessage(`Grail name ${name.name} has been sold!`);
      }
    });

    // Simulate change in listings 
    npcOwnedDomains.forEach((name) => { 
      if (name.saleData.forSale && Math.random() < 0.1) { 
        name.saleData.forSale = false; // 10% chance of delisting per turn 
      } else if (!name.saleData.forSale && Math.random() < 0.05) { 
        name.saleData.forSale = true
      }
    }); 
  }
  logMarketMessage(message) {
    return console.log(`Sales Bot: ${message}`)
  }
}