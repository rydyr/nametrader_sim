export default function simPF(assetPrices, volatility = 0.1, marketType = "normal") {

  const changeThresholds = [
    {pMin: 0.5, maxChange: 0.05},
    {pMin: 0.7, maxChange: 0.12},
    {pMin: 0.8, maxChange: 0.18},
    {pMin: 0.9, maxChange: 0.25}
  ]
  Object.keys(assetPrices).forEach((key) => {
      let asset = assetPrices[key];
      let directionBias;
      if (marketType === "bear") {
          directionBias = -1;
      } else if (marketType === "bull") {
          directionBias = 1;
      } else {
          directionBias = Math.random() < 0.4 ? -1 : 1;
      }

      let percentageChange = Math.random() * volatility * directionBias;

      if (marketType !== "normal" && Math.random() > 0.8) {
          percentageChange *= -1;
      }

      let maxChange = changeThresholds[changeThresholds.length - 1].maxChange;
      for (const threshold of changeThresholds){
        if (Math.random() >= threshold.pMin){
          maxChange = threshold.maxChange;
          break;
        }
      }

      percentageChange = Math.max(Math.min(percentageChange,maxChange), -maxChange);

      let newPrice = asset.price * (1 + percentageChange);
      assetPrices[key].price = Math.round(newPrice * 100) / 100; 
  });

  return assetPrices;
}

