import {SpaceObject} from "../models/SpaceObject.ts";
import {Torpedo} from "../models/Torpedo.ts";

export class TorpedoEvent extends Event {

  torpedo: Torpedo;
  source: SpaceObject|undefined;

  constructor(source: SpaceObject|undefined, torpedo: Torpedo) {
    super('torpedo');
    this.torpedo = torpedo;
    this.source = source;
  }

  clone() {
    return new TorpedoEvent(this.source, this.torpedo);
  }
}