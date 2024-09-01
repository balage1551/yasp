export class EntityWithId {
  readonly id: number

  constructor(id: number) {
    this.id = id
  }

  equals(other: EntityWithId): boolean {
    return this.id === other.id
  }
}
