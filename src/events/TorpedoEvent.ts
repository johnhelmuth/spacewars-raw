import {Torpedo} from "../models/Torpedo.ts";
import SpaceObject from "../models/SpaceObject.ts";

export class TorpedoEvent extends Event {
  torpedo: Torpedo;
  source: SpaceObject;
  constructor(source: SpaceObject, torpedo: Torpedo) {
    super("torpedo");
    this.torpedo = torpedo;
    this.source = source;
  }
}