export default function simPF(assetPrices, volatility = 0.1, marketType = "normal") {
  Object.keys(assetPrices).forEach((key) => {
      let asset = assetPrices[key];
      let directionBias;
      if (marketType === "bear") {
          directionBias = -1;
      } else if (marketType === "bull") {
          directionBias = 1;
      } else {
          directionBias = Math.random() < 0.5 ? -1 : 1;
      }

      let percentageChange = Math.random() * volatility * directionBias;

      if (marketType !== "normal" && Math.random() > 0.8) {
          percentageChange *= -1;
      }

      let newPrice = asset.price * (1 + percentageChange);
      assetPrices[key].price = Math.round(newPrice * 100) / 100; 
  });

  return assetPrices;
}

