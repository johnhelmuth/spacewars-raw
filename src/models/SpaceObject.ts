
import {type Angle, type Point, type Velocity} from '../types/geometry.ts';
import {Ship} from "./Ship.ts";

export interface SpaceObjectInterface {

  /** @property id - a unique-ish identifier for the object. **/
  id: string;

  /** @property name - The name of the object. **/
  name: string;

  /** @property type - a type for the object. **/
  type: string;

  /** @property position - coordinates of object. */
  position: Point,

  /** @property facing - angle the object is facing, degrees **/
  facing: Angle,

  /** @property velocity - angle and speed of motion. **/
  velocity: Velocity,

  /** @property mass - the mass of the object in kg. **/
  mass: number,

  /**
   * Rotate facing.
   *
   * Positive angles rotate clockwise, negative angles rotate counter-clockwise.
   * @param angle: Angle
   */
  rotate: (angle: Angle) => void,
}

export default class SpaceObject implements SpaceObjectInterface {
  id: string;
  name: string;
  type: string;
  position: Point;
  facing: number;
  velocity: Velocity;
  mass: number;

  constructor(name: string, position: Point, facing: number, velocity: Velocity, mass: number = 1) {
    this.id = Math.random().toString(16).substring(2, 8);
    this.name = name;
    this.type = 'generic';
    this.position = position;
    this.facing = facing;
    this.velocity = velocity;
    this.mass = mass;
  }

  rotate(angle: Angle) {
    let newFacing = this.facing + angle;
    if (newFacing > 360) {
      // 370 degrees should be 10 degrees
      newFacing = newFacing - 360;
    } else if (newFacing < 0) {
      // -10 degrees should be 350 degrees
      newFacing = 360 + newFacing;
    }
    this.facing = newFacing;
  }

  isShip(obj: any): obj is Ship {
    return obj instanceof Ship;
  }

}