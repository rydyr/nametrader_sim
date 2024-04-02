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