import type {SpaceObject} from "../models/SpaceObject.ts";

export class RemoveObjectEvent extends Event {

  object : SpaceObject

  constructor(o: SpaceObject) {
    super('removeObject');
    this.object = o;
  }

  clone() {
    return new RemoveObjectEvent(this.object);
  }
}