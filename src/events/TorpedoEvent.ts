import {SpaceObject} from "../models/SpaceObject.ts";
import type {ObjectSpec} from "../models/Scene.ts";

export class TorpedoEvent extends Event {

  torpedoSpec: ObjectSpec;
  source: SpaceObject|undefined;

  constructor(source: SpaceObject|undefined, torpedo: ObjectSpec) {
    super('torpedo');
    this.torpedoSpec = torpedo;
    this.source = source;
  }

  clone() {
    return new TorpedoEvent(this.source, this.torpedoSpec);
  }
}