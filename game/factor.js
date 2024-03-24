//factor.js
export default function factor(status) {
  const commonFactor = Math.random() * (2 - 1) + 1;
  const premiumFactor = Math.random() * (3 - 2) + 2;
  const grailFactor = Math.random() * (4 - 3) + 3;
  if (status == "grail") {
     return grailFactor;
  } else if (status === "premium") {
     return premiumFactor;
  } else {
     return commonFactor;
  }
}
  
