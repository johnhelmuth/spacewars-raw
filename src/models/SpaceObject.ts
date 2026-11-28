
import {type Angle, type Point, Velocity} from '../types/geometry.ts';
import {ObjectUpdatedEvent} from "../events/ObjectUpdatedEvent.ts";
import type {SpaceObjectView} from "../views/SpaceObjectView.ts";
import {SelfDestructEvent} from "../events/SelfDestructEvent.ts";
import {RemoveObjectEvent} from "../events/RemoveObjectEvent.ts";

const DEFAULT_ROTATE_ANGLE = 1; // Rotate 5 degrees by default.

export type VelocityParamType = {
  magnitude: number,
  direction: number,
}
export type SpaceObjectParamsType = {
  name: string,
  position: Point,
  facing: number,
  velocity: VelocityParamType,
  mass: number
}

export class SpaceObject extends EventTarget {
  id: string;
  name: string;
  type: string;
  _view?: SpaceObjectView;
  _position: Point;
  _facing: number;
  _velocity: Velocity; // meters / second
  rotateAnglePerSecond: number;
  destroyed = false;
  mass?: number;

  constructor(params: SpaceObjectParamsType) {
    const { name, position, facing, velocity: { magnitude, direction }, mass = 1 } = params;
    super();
    this.id = Math.random().toString(16).substring(2, 8);
    this.name = name;
    this.type = 'generic';
    this._position = position;
    this._facing = facing;
    this._velocity = new Velocity(magnitude, direction);
    this.mass = mass;
    this.rotateAnglePerSecond = DEFAULT_ROTATE_ANGLE;
  }

  /**
   * @property isStatic {boolean} If true, does not allow other objects to affect its position.
   */
  get isStatic() { return false }

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

  get view() {
    if (typeof this._view === 'undefined') {
      throw new Error(`SpaceObject.view referenced but not defined for object ${this.name}`);
    }
    return this._view;
  }

  set view(view: SpaceObjectView) {
    this._view = view;
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

  /**
   * This view's object is triggering self-destruct. Start the animation for destruction, and dispatch the self-destruct event.
   *
   * @param e {SelfDestructEvent}
   */
  handleSelfDestruct = (e: Event): void => {
    if (e instanceof SelfDestructEvent) {
      this.destroy();
    }
  }

  destroy() {
    this.destroyed = true;
    this.view.startDestroyAnimation();
  }

  // @ts-ignore
  tick(timePeriod: number) {
    if (! this.view.tick()) {
      // Send event to trigger the removal of the object from the scene.
      this.dispatchEvent(new RemoveObjectEvent(this));
    }
  }

  globalCornersRotated() {
    return this.view.globalCornersRotated();
  }

  render() {
    return this.view.render();
  }

}