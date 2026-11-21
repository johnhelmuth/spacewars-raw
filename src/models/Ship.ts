import {SpaceObject} from "./SpaceObject.ts";
import {type Angle, LIGHT_SPEED, type Point, Velocity} from "../types/geometry.ts";
import {TorpedoEvent} from "../events/TorpedoEvent.ts";
import {TorpedoTube} from "./TorpedoTube.ts";

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

export type RotateDirection = 'not' | 'left' | 'right';

const FAST_ROTATE_FACTOR = 1;
const SLOW_ROTATE_FACTOR = 0.06;

export class Ship extends SpaceObject {

  drive: Drive;
  tube: TorpedoTube;
  /* rotateFactor - multiplier to rotate fast or slow. Maximum value is 1 */
  rotateFactor: number;

  rotateDirection: RotateDirection;

  constructor(name: string, position: Point, facing: Angle, velocity: Velocity, drive: Drive, mass: number = 1) {
    super(name, position, facing, velocity, mass);
    this.type = 'ship';
    this.drive = drive;
    this.tube = new TorpedoTube();
    this.tube.setShip(this);
    this.tube.addEventListener('torpedo', this.handleTorpedoFired);
    this.rotateAnglePerSecond = 120; // Degrees per second
    this.rotateFactor = 1.0;
    this.rotateDirection = 'not';
  }

  switchDriveOn() {
    this.drive.switchOn();
    this.dispatchUpdated();
  }

  switchDriveOff() {
    this.drive.switchOff();
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

  rotateTick(timePeriod: number) {
    if (this.rotateDirection !== 'not') {
      const rotateFactor = this.rotateFactor * (this.rotateDirection === 'left' ? -1 : 1);
      this.rotate(this.rotateAnglePerSecond * rotateFactor * timePeriod);
    }
  }

  fireTorpedo() {
    this.tube.fireTorpedo();
  }

  handleTorpedoFired = (e: Event) => {
    if (e instanceof TorpedoEvent) {
      this.dispatchEvent(e.clone());
    }
  }

  engineStatus(): boolean {
    return !! this.drive.acceleration;
  }

  tick({timePeriod}: { timePeriod: number, timestamp: DOMHighResTimeStamp }) {
    this.rotateTick(timePeriod);
    this.tube.tick(timePeriod);
  }
}