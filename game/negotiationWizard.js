export class Negotiation {
  constructor(buyer, seller, domain, offer) {
    this.no = domain.saleData.fmv;
    this.yes = (((domain.saleData.fmv * seller.valueModifier) + domain.saleData.fmv) * 100) / 100;
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
      return {
        text: "Probability of acceptance 100%",
        value: 100
      }
    } else if (this.offer <= this.no) {
      return {
        text: "Probability of acceptance 0%",
        value: 0
      }
    } else {
      return {
        text: `Probability of acceptance ${Math.floor(this.probability * 100)}%`,
        value: Math.floor(this.probability * 100)
      }
    }
  }

  getResponse() {
    if (this.offer >= this.yes) {
      return {
        text: "Offer Accepted",
        value: true
      };
    } else if (this.offer <= this.no) {
      const stinkbid = this.no - (this.no * 0.60);
      const offensive = this.no - (this.no * 0.30);
      const poorTaste = this.no - (this.no * 0.15);


      // implement punishments for stinkbids later
      if (this.offer <= stinkbid) {
        return { 
          text: "StinkBid",
          value: false
               };
      } else if (this.offer > stinkbid && this.offer <= offensive) {
        return {
          text: "Offensive",
          value: false
               };
      } else if (this.offer > offensive && this.offer <= poorTaste) {
        return {
          text: "Poor Taste",
          value: false
               };
      } else {
        return {
          text: "Offer Rejected",
          value: false
               };
      }
    } else {
      if (Math.random() < this.probability) {
        return {
          text: "Offer Accepted",
          value: true
               };
      } else {
        return {
          text: "Offer declined",
          value: false
               };
      }
    }
  }
}