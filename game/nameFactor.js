export default function factor(status) { 
  const commonFactor = Math.random() * (2 - 1) + 1; 
  const premiumFactor = Math.random() * (3 - 2) + 2; 
  const grailFactor = Math.random() * (4 - 3) + 3;

switch (status) {
  case "grail":
    return grailFactor;
  case "premium":
    return premiumFactor;
  default:
    return commonFactor;
}
}


  
