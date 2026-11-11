import SpaceObject from "./SpaceObject.ts";
import {type Angle, LIGHT_SPEED, type Point, translateVector, Vector, Velocity} from "../types/geometry.ts";
import {Torpedo} from "./Torpedo.ts";
import {TorpedoEvent} from "../events/TorpedoEvent.ts";

export class Drive {
  /** _acceleration is measured in meters/second **/
  _acceleration: number = 0;
  engineOn: boolean;

  constructor(acceleration: number, engineOn: boolean) {
    this._acceleration = Math.min(acceleration, LIGHT_SPEED);
    this.engineOn = engineOn;
  }

  switchOn() {
    this.engineOn = true;
  }

  switchOff() {
    this.engineOn = false;
  }

  toggle() {
    this.engineOn = !this.engineOn;
  }

  /** acceleration - Measured in meters per second. **/
  get acceleration() {
    if (this.engineOn) {
      return this._acceleration;
    }
    return 0;
  }
}

const MAX_TORPEDOES_IN_QUEUE = 6;
const TORPEDO_COOL_DOWN_PERIOD = .7; /* Second */

export class TorpedoTube extends EventTarget {

  index = 0;

  torpedoSpeed = 200;

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
    const initVelocity = new Velocity(this.torpedoSpeed, facing)
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

export type RotateDirection = 'not' | 'left' | 'right';

const FAST_ROTATE_FACTOR = 1;
const SLOW_ROTATE_FACTOR = 0.06;

export class Ship extends SpaceObject {

  drive: Drive;
  tube: TorpedoTube;
  rotateAnglePerSecond: number;
  /* rotateFactor - multiplier to rotate fast or slow. Maximum value is 1 */
  rotateFactor: number;

  rotateDirection: RotateDirection;

  constructor(name: string, position: Point, facing: Angle, velocity: Velocity, drive: Drive, tube: TorpedoTube, mass: number = 1) {
    super(name, position, facing, velocity, mass);
    this.type = 'ship';
    this.drive = drive;
    tube.setShip(this);
    this.tube = tube;
    this.rotateAnglePerSecond = 120; // Degrees per second
    this.rotateFactor = 1.0;
    this.rotateDirection = 'not';
  }

  setRotateAngleVelocity(angle: Angle) {
    this.rotateAnglePerSecond = angle;
  }

  switchDriveOn() {
    this.drive.switchOn();
    this.dispatchUpdated();
  }

  switchDriveOff() {
    this.drive.switchOff();
    this.dispatchUpdated();
  }

  toggleDrive() {
    this.drive.toggle();
    this.dispatchUpdated();
  }

  get acceleration() {
    return new Velocity(this.drive.acceleration, this.facing);
  }

  setRotateDirection(rotateDirection: RotateDirection) {
    this.rotateDirection = rotateDirection;
  }

  setRotateFactor(slowOrFast: 'slow' | 'fast') {
    if (slowOrFast === 'slow') {
      this.rotateFactor = SLOW_ROTATE_FACTOR;
    } else {
      this.rotateFactor = FAST_ROTATE_FACTOR;
    }
  }

  rotateLeft() {
    this.rotate(-this.rotateAnglePerSecond * this.rotateFactor);
  }

  rotateRight() {
    this.rotate(this.rotateAnglePerSecond * this.rotateFactor);
  }

  rotateTick(timePeriod: number) {
    if (this.rotateDirection !== 'not') {
      const rotateFactor = this.rotateFactor * (this.rotateDirection === 'left' ? -1 : 1);
      this.rotate(this.rotateAnglePerSecond * rotateFactor * timePeriod);
    }
  }

  fireTorpedo() {
    this.tube.fireTorpedo();
  }

  engineStatus(): boolean {
    return !! this.drive.acceleration;
  }

  tick({timePeriod}: { timePeriod: number, timestamp: DOMHighResTimeStamp }) {
    this.rotateTick(timePeriod);
    this.tube.tick(timePeriod);
  }
}