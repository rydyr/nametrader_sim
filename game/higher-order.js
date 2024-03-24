//higher-order.js
export function nameObjectBuilder(names,category,stats,factory){
  const cat = [];
  for (const name in names) {
    cat.push(factory(name,category,stats));
  }
  

  return cat

  }
