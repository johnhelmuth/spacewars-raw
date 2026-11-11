
import {type Angle, type Point, Velocity} from '../types/geometry.ts';
import {Ship} from "./Ship.ts";
import {ObjectUpdatedEvent} from "../events/ObjectUpdatedEvent.ts";

const DEFAULT_ROTATE_ANGLE = 1; // Rotate 5 degrees by default.

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

export default class SpaceObject extends EventTarget implements SpaceObjectInterface {
  id: string;
  name: string;
  type: string;
  _position: Point;
  _facing: number;
  _velocity: Velocity; // meters / second
  mass: number;

  constructor(name: string, position: Point, facing: number, velocity: Velocity, mass: number = 1) {
    super();
    this.id = Math.random().toString(16).substring(2, 8);
    this.name = name;
    this.type = 'generic';
    this._position = position;
    this._facing = facing;
    this._velocity = velocity;
    this.mass = mass;
  }

  get facing() {
    return this._facing;
  }

  set facing(facing: number) {
    if (this._facing == facing) {
      return;
    }
    this._facing = facing;
    this.dispatchUpdated();
  }

  rotate(angle?: Angle) {
    if (typeof angle === 'undefined') {
      angle = this instanceof Ship ? this.rotateAnglePerSecond : DEFAULT_ROTATE_ANGLE;
    }
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

  get position() {
    return this._position;
  }

  set position(p: Point) {
    if (this._position.x == p.x && this._position.y == p.y) {
      return;
    }
    this._position = p;
    this.dispatchUpdated();
  }

  get velocity() {
    return this._velocity;
  }

  set velocity(velocity: Velocity) {
    this._velocity = velocity;
  }

  isShip(): this is Ship {
    return this instanceof Ship;
  }

  dispatchUpdated() {
    this.dispatchEvent(new ObjectUpdatedEvent());
  }

  tick({timePeriod, timestamp}: { timePeriod: number, timestamp: DOMHighResTimeStamp }) { timePeriod; timestamp }

}