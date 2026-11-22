import {translateVector, Vector, Velocity} from "../types/geometry.ts";
import {Torpedo} from "./Torpedo.ts";
import {TorpedoEvent} from "../events/TorpedoEvent.ts";
import {Ship} from "./Ship.ts";

const MAX_TORPEDOES_IN_QUEUE = 6;
const TORPEDO_COOL_DOWN_PERIOD = .7; /* Second */

export class TorpedoTube extends EventTarget {

  index = 0;

  torpedoSpeed = 600;

  _ship: Ship | undefined;

  /* fireRate {number} How frequently can a torpedo be fired, in seconds. */
  fireRate = 1/6;

  /* Number of seconds until next torpedo launch can happen. */
  torpedoCooldown = 0;

  /* torpedoQueue - How many torpedoes are queued up to be fired. */
  torpedoQueue = 0;

  get ship() {
    if (typeof this._ship === 'undefined') {
      throw new Error('TorpedoTube() ship referenced before it has been set.');
    }
    return this._ship;
  }

  setShip(ship: Ship) {
    this._ship = ship;
  }

  fireTorpedo() {
    if (this.torpedoCooldown > 0) {
      if (this.torpedoQueue < MAX_TORPEDOES_IN_QUEUE) {
        this.torpedoQueue++;
      }
      return;
    }
    const { position, facing } = this.ship as Ship;
    const initPosition = translateVector(position, new Vector({direction: facing, magnitude: 96}))
    const initVelocity = this.ship.velocity.addVector(new Velocity(this.torpedoSpeed, facing));
    const t = new Torpedo(
        `Torpedo ${this.ship.name}-${this.index++}`,
        initPosition,
        facing,
        initVelocity
    );
    if (this.torpedoQueue > 0) {
      this.torpedoQueue--;
    }
    this.torpedoCooldown = TORPEDO_COOL_DOWN_PERIOD;
    this.dispatchEvent(new TorpedoEvent(this.ship, t))
  }

  tick(timePeriod: number) {
    if (this.torpedoCooldown > 0) {
      this.torpedoCooldown -= timePeriod;
    } else if (this.torpedoQueue > 0) {
      this.fireTorpedo()
    }
  }
}