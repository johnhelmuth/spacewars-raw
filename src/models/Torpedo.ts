import {SpaceObject, type SpaceObjectParamsType} from "./SpaceObject.ts";
import {SelfDestructEvent} from "../events/SelfDestructEvent.ts";

const SELF_DESTRUCT_TIME = 2; // Seconds

export type TorpedoParamsType = SpaceObjectParamsType;

export class Torpedo extends SpaceObject {

  timer: number;

  constructor(params: TorpedoParamsType) {
    const { name, position, facing, velocity, mass } = params;
    super({ name, position, facing, velocity, mass });
    this.type = 'torpedo';
    this.timer = SELF_DESTRUCT_TIME;
    console.log(`Woosh. Torpedo ${this.name} launched at ${performance.now()}`)
  }

  tick(timePeriod: number) {
    super.tick(timePeriod);
    if (this.timer > 0) {
      this.timer -= timePeriod;
      if (this.timer <= 0) {
        console.log(`Boom. ${this.name} self destructed.`);
        this.dispatchEvent(new SelfDestructEvent({ object: this }));
        this.destroy();
      }
    }
  }
}