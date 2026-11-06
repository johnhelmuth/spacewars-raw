import SpaceObject from "./SpaceObject.ts";
import {type Angle, LIGHT_SPEED, type Point, Velocity} from "../types/geometry.ts";

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

export class Ship extends SpaceObject {

  drive: Drive;
  rotateAnglePerTick: number;

  constructor(name: string, position: Point, facing: Angle, velocity: Velocity, drive: Drive, mass: number = 1) {
    super(name, position, facing, velocity, mass);
    this.type = 'ship';
    this.drive = drive;
    this.rotateAnglePerTick = 5;
  }

  setRotateAngleVelocity(angle: Angle) {
    this.rotateAnglePerTick = angle;
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
    const a = new Velocity({ magnitude: this.drive.acceleration, direction: this.facing });
    return a;
  }

  rotateLeft() {
    this.rotate(-this.rotateAnglePerTick);
  }

  rotateRight() {
    this.rotate(this.rotateAnglePerTick);
  }

  engineStatus(): boolean {
    return !! this.drive.acceleration;
  }
}