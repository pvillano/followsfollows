// Original Source - https://stackoverflow.com/questions/51319147/map-default-value
// Posted by friedow
// Retrieved 2025-11-06, License - CC BY-SA 4.0
// typescript by pvillano

export class DefaultMap<K, V> extends Map<K, V> {
  private readonly default: () => V

  /**
   * Returns a specified element from the Map object.
   * If the value that is associated to the provided key is an object,
   * then you will get a reference to that object
   * and any change made to that object will effectively modify it inside the Map.
   * @returns Returns the element associated with the specified key.
   * If no element is associated with the specified key, the evaluation of defaultFunction is returned.
   */
  get(key: K) {
    if (!this.has(key)) {
      this.set(key, this.default());
    }
    return super.get(key) as V;
  }

  constructor(defaultFunction: () => V, entries?: Iterable<[K, V]> | null) {
    super(entries);
    this.default = defaultFunction;
  }
}
