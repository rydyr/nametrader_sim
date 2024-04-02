export function nameObjectBuilder(names, category, stats, factory) {
  return names.map((name) => factory(name, category, stats));
}
