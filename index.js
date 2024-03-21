import {ensFactory} from "./factory.js";
import { nameObjectBuilder } from "./higher-order.js";
import { names } from "./names.js";
import { stats } from "./stats.js";
import { runner } from "./runner.js";
import { floorPrice } from './floorPrices.js';
import simPF from './simulation.js';


const ens = nameObjectBuilder(names,"999",stats,ensFactory)


const turn = [...ens];

for (const name of turn){
  name.calcFMV(floorPrice["999"].price);
}

console.log(runner(turn,0,2))

simPF(floorPrice,0.03,"normal")
