import { reactive } from 'vue'

export class ShallowReactiveMap<K, V> {
  private readonly map: Map<K, V>
  private sizeRef: { value: number }

  constructor(entries?: readonly (readonly [K, V])[] | null) {
    this.map = new Map(entries)
    this.sizeRef = reactive({ value: this.map.size })
  }

  get size() {
    return this.sizeRef.value
  }

  set(key: K, value: V) {
    this.map.set(key, value)
    this.sizeRef.value = this.map.size
  }

  delete(key: K) {
    const result = this.map.delete(key)
    this.sizeRef.value = this.map.size
    return result
  }

  clear() {
    this.map.clear()
    this.sizeRef.value = this.map.size
  }

  get(key: K) {
    return this.map.get(key)
  }

  has(key: K) {
    return this.map.has(key)
  }

  forEach(callback: (value: V, key: K, map: Map<K, V>) => void, thisArg?: unknown) {
    this.map.forEach(callback, thisArg)
  }

  entries() {
    return this.map.entries()
  }

  keys() {
    return this.map.keys()
  }

  values() {
    return this.map.values()
  }

  [Symbol.iterator]() {
    return this.map[Symbol.iterator]()
  }
}
