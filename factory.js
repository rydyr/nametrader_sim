import { ENSName } from './nameClass.js';

export function ensFactory(name, category, stats) {
  return new ENSName(name, category, stats);
}