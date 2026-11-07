import {Torpedo} from "../models/Torpedo.ts";
import SpaceObject from "../models/SpaceObject.ts";

export class TorpedoEvent extends Event {
  torpedo: Torpedo;
  source: SpaceObject|undefined;
  constructor(source: SpaceObject|undefined, torpedo: Torpedo) {
    super("torpedo");
    this.torpedo = torpedo;
    this.source = source;
  }
}