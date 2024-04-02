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