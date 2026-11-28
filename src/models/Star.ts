import {SpaceObject} from "./SpaceObject.ts";
import {Velocity} from "../types/geometry.ts";

const SUN_MASS
    = 1.988416e30 /* Actual sun mass, kg */
    * 1.0e-15    /* Fudge factor to make game playable. */
;

export type StarParamsType = {};

export class Star extends SpaceObject {

  constructor() {
    super({
      name: 'Star',
      position: { x: 0, y: 0 },
      facing: 0,
      velocity: { magnitude: 0, direction: 0},
      mass: SUN_MASS
    });
    this.type = 'star';
  }

  /**
   * @property isStatic {boolean} If true, does not allow other objects to affect its position.
   */
  get isStatic() { return true }

  get velocity() {
    return this._velocity;
  }

  set velocity(velocity: Velocity) { velocity /* noop, can't move sun in this simulation. */ }


  destroy() {
    this.destroyed = false;
  }
}