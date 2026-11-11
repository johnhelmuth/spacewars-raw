import {Torpedo} from "../models/Torpedo.ts";

export class TorpedoSelfDestructEvent extends Event {
  torpedo: Torpedo;
  constructor(torpedo: Torpedo) {
    super("torpedo-destruct");
    this.torpedo = torpedo;
  }
  clone() {
    return new TorpedoSelfDestructEvent(this.torpedo);
  }
}