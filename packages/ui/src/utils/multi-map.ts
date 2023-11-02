// https://en.wikipedia.org/wiki/Multimap
export class MultiMap<K, V> extends Map<K, V[]> {
  constructor(entries?: readonly (readonly [K, V])[] | null) {
    super();

    for (const entry of entries ?? []) {
      const [key, value] = entry;
      const existingEntries = this.get(key) ?? [];
      existingEntries.push(value);
      this.set(key, existingEntries);
    }
  }
}
