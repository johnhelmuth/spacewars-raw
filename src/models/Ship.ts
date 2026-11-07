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

export class TorpedoTube extends EventTarget {

  index = 0;

  constructor() {
    super();
  }

  fireTorpedo(ship: SpaceObject) {
    const { position, facing, velocity } = ship;
    const initPosition = translateVector(position, new Vector({direction: facing, magnitude: 64}))
    const initVelocity = velocity.addVector( new Velocity({ magnitude: 500, direction: facing }))
    const t = new Torpedo(
      `${ship.name} torpedo ${this.index++}`,
      initPosition,
      facing,
      initVelocity
    );
    this.dispatchEvent(new TorpedoEvent(ship, t))
  }
}

export type RotateDirection = 'not' | 'left' | 'right';

export class Ship extends SpaceObject {

  drive: Drive;
  tube: TorpedoTube;
  rotateAnglePerSecond: number;
  rotateDirection: RotateDirection;

  constructor(name: string, position: Point, facing: Angle, velocity: Velocity, drive: Drive, tube: TorpedoTube, mass: number = 1) {
    super(name, position, facing, velocity, mass);
    this.type = 'ship';
    this.drive = drive;
    this.tube = tube;
    this.rotateAnglePerSecond = 60; // Degrees per second
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
    const a = new Velocity({ magnitude: this.drive.acceleration, direction: this.facing });
    return a;
  }

  setRotateDirection(rotateDirection: RotateDirection) {
    this.rotateDirection = rotateDirection;
  }

  rotateLeft() {
    this.rotate(-this.rotateAnglePerSecond);
  }

  rotateRight() {
    this.rotate(this.rotateAnglePerSecond);
  }

  rotateTick(timePeriod: number) {
    let rotateAngle: Angle;
    switch (this.rotateDirection) {
      case 'left':
        rotateAngle = -1 * (this.rotateAnglePerSecond * timePeriod);
        this.rotate(rotateAngle);
        break;
      case 'right':
        rotateAngle =(this.rotateAnglePerSecond * timePeriod);
        this.rotate(rotateAngle);
        break;
    }
  }

  fireTorpedo() {
    this.tube.fireTorpedo(this);
  }

  engineStatus(): boolean {
    return !! this.drive.acceleration;
  }
}