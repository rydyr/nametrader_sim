export function npcFactory(npcNames,NPC) {
  return npcNames.map(npcName => {
    return new NPC(npcName);
  });
}