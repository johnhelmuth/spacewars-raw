
import {type Angle, type Point, Velocity} from '../types/geometry.ts';
import {ObjectUpdatedEvent} from "../events/ObjectUpdatedEvent.ts";

const DEFAULT_ROTATE_ANGLE = 1; // Rotate 5 degrees by default.

export class SpaceObject extends EventTarget {
  id: string;
  name: string;
  type: string;
  _position: Point;
  _facing: number;
  _velocity: Velocity; // meters / second
  rotateAnglePerSecond: number;
  destroyed = false;
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
    this.rotateAnglePerSecond = DEFAULT_ROTATE_ANGLE;
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
      angle = this.rotateAnglePerSecond;
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

  get acceleration() {
    return new Velocity(0, 0);
  }

  dispatchUpdated() {
    this.dispatchEvent(new ObjectUpdatedEvent());
  }

  destroy() {
    this.destroyed = true;
  }

  tick({timePeriod, timestamp}: { timePeriod: number, timestamp: DOMHighResTimeStamp }) { timePeriod; timestamp }

}