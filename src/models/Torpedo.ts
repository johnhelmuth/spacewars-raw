import SpaceObject from "./SpaceObject.ts";
import {type Angle, type Point, Velocity} from "../types/geometry.ts";
import {TorpedoSelfDestructEvent} from "../events/TorpedoSelfDestructEvent.ts";

const SELF_DESTRUCT_TIME = 5; // Seconds

export class Torpedo extends SpaceObject {

  timer: number;

  constructor(name: string, position: Point, facing: Angle, velocity: Velocity, mass: number = 1) {
    super(name, position, facing, velocity, mass);
    this.type = 'torpedo';
    this.timer = SELF_DESTRUCT_TIME;
  }

  tick({ timePeriod }: { timePeriod: number, timestamp: DOMHighResTimeStamp }) {
    this.timer -= timePeriod;
    if (this.timer <= 0) {
      this.dispatchEvent(new TorpedoSelfDestructEvent(this));
    }
  }
}