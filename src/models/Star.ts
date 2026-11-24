import {SpaceObject} from "./SpaceObject.ts";
import {Velocity} from "../types/geometry.ts";

const SUN_MASS = 1.988416e30 /* Actual sun mass, kg */
                 * 1e-21 /* Fudge factor to make game playable. */
;
export class Star extends SpaceObject {

  constructor() {
    super('Star', { x: 0, y: 0 }, 0, new Velocity(0, 0), SUN_MASS);
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