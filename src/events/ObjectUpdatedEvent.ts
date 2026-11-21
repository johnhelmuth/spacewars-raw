
export class ObjectUpdatedEvent extends Event {
  constructor() {
    super('updated')
  }

  clone() {
    return new ObjectUpdatedEvent();
  }
}