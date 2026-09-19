import SpaceObject from "./SpaceObject.ts";
import {type Point, Vector, type Velocity} from "../types/geometry.ts";

export class Drive {
  _acceleration: number = 0;
  engineOn: boolean;

  constructor(acceleration: number, engineOn: boolean) {
    this._acceleration = acceleration;
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

  get acceleration() {
    if (this.engineOn) {
      return this._acceleration;
    }
    return 0;
  }
}

export class Ship extends SpaceObject {

  drive: Drive;

  constructor(name: string, position: Point, facing: number, velocity: Velocity, mass: number = 1, engineOn: boolean = false) {
    super(name, position, facing, velocity, mass);
    this.type = 'ship';
    this.drive = new Drive(1, engineOn);
  }

  toggleDrive() {
    this.drive.toggle();
  }

  get acceleration() {
    return new Vector({ direction: this.facing, magnitude: this.drive.acceleration });
  }
}