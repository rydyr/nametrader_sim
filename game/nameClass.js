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
      last_sale_price: 0,
      price: 0,
    }
  };
}



ENSName.prototype.calcFMV = function(marketPrice) {
  this.saleData.fmv = marketPrice * this.saleData.factor;
};
