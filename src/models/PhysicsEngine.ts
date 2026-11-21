import type Scene from "./Scene.ts";
import {BoundingBox, type Point, pointsToBoundingBox, translateVector, Velocity} from "../types/geometry.ts";
import {CollisionEvent, type CollisionTargetType, type WallType} from "../events/CollisionEvent.ts";
import {SpaceObjectView} from "../views/SpaceObjectView.ts";
import {SpaceObject} from "./SpaceObject.ts";

export default class PhysicsEngine extends EventTarget {

  lastTimestamp?: DOMHighResTimeStamp; // milliseconds

  ticks = 0;

  scaledBoundingBox: BoundingBox;
  boundingBox: BoundingBox;

  constructor(boundingBox: BoundingBox, scaledBoundingBox: BoundingBox) {
    super();
    this.scaledBoundingBox = scaledBoundingBox;
    this.boundingBox = boundingBox;
  }

  /**
   * Move everything in the scene as needed for 1 animation frame.
   *
   * @param scene {Scene}
   * @param timestamp {DOMHighResTimeStamp} - milliseconds
   */
  tick(scene: Scene, timestamp: DOMHighResTimeStamp) {
    // const timePeriod = 1/60; // seconds... assuming 60 frames per second
    const timePeriod = typeof this.lastTimestamp === "number" ? (timestamp - this.lastTimestamp)/1000 : 1/60;
    this.lastTimestamp = timestamp;
    for (const ov of scene) {
      ov.tick({timePeriod, timestamp});
      const o = ov.object;
      const newVelocity = this.applyAccelerationToVelocity(o);
      const newPosition = translateVector(o.position, this.applyTimePeriod(newVelocity, timePeriod));
      if (newPosition === o.position) {
        // No change in position means we don't need to update.
        continue;
      }
      o.velocity = newVelocity;
      o.position = newPosition;
      const nextTickPosition = translateVector(o.position, this.applyTimePeriod(o.velocity, timePeriod))
      const intersectsWall = this.wallIntersection(ov.globalCornersRotated(), nextTickPosition);
      if (intersectsWall) {
        this.handleCollision(ov, intersectsWall);
      }
      const collidesWith = scene.collidesWith(ov);
      if (collidesWith) {
        this.handleCollision(ov, collidesWith);
      }
    }
    this.ticks++;
  }

  applyTimePeriod(v: Velocity, timePeriod: DOMHighResTimeStamp) {
    const vector = new Velocity(v.magnitude * timePeriod, v.direction);
    return vector;
  }

  applyAccelerationToVelocity(o: SpaceObject) {
    const vectors = [o.velocity, o.acceleration];
    const velocity = vectors.reduce((acc, v) => {
      return acc.addVector(v);
    }, new Velocity(0, 0));
    return velocity;
  }

  wallIntersection(corners: Point[], nextPosition: Point): WallType | false {
    if (typeof this.scaledBoundingBox === "undefined") {
      return false;
    }
    if (this.scaledBoundingBox.containsAllPoints(corners)) {
      return false;
    }
    const obox = pointsToBoundingBox(corners);
    if (obox.top < this.scaledBoundingBox.top && nextPosition.y < this.scaledBoundingBox.top) {
      return 'north'
    }
    if (obox.right > this.scaledBoundingBox.right && nextPosition.x > this.scaledBoundingBox.right) {
      return 'east';
    }
    if (obox.bottom > this.scaledBoundingBox.bottom && nextPosition.y > this.scaledBoundingBox.bottom) {
      return 'south';
    }
    if (obox.left < this.scaledBoundingBox.left && nextPosition.x < this.scaledBoundingBox.left) {
      return 'west';
    }
    return false;
  }

  /*
   * Moves the object to the opposite edge, maintaining its velocity vector.
   *
   * @param obj: {SpaceObject}
   */
  moveToOppositeEdge(obj: SpaceObject, collidedWith: CollisionTargetType) {
    let coordName = 'x' as keyof Point;
    let adjustValue: number;
    switch (collidedWith) {
      case 'north':
        coordName = 'y';
        adjustValue = this.boundingBox.bottom;
        break;
      case 'south':
        coordName = 'y';
        adjustValue = this.boundingBox.top;
        break;
      case 'west':
        coordName = 'x';
        adjustValue = this.boundingBox.right;
        break;
      case 'east':
        coordName = 'x';
        adjustValue = this.boundingBox.left;
        break;
      default:
        adjustValue = obj.position.x;
    }
    const newPosition = { ...obj.position} as Point;
    newPosition[coordName] = adjustValue;
    obj.position = newPosition;
  }

  /**
   * Handles collision between one of the objects in the scene with another object in a scene,
   * or the wall of the screen.
   *
   * Dispatches a 'collision' event to other parts of the system.
   *
   * @param ov {SpaceObjectView}
   * @param collidedWith {CollisionTargetType}
   */
  handleCollision(ov: SpaceObjectView, collidedWith: CollisionTargetType) {
    const collEvent = new CollisionEvent(ov, collidedWith);
    if (collEvent.collisionType === 'wall') {
      this.moveToOppositeEdge(ov.object, collidedWith);
    } else if (collEvent.isSpaceObjectViewType(collidedWith)) {
      ov.destroy();
      collidedWith.destroy();
    }
    this.dispatchEvent(collEvent);
  }

}