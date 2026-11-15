import type Scene from "./Scene.ts";
import {type Point, translateVector, Velocity} from "../types/geometry.ts";
import {CollisionEvent, type CollisionTargetType} from "../events/CollisionEvent.ts";
import type {SpaceObjectView} from "../views/SpaceObjectView.ts";
import type SpaceObject from "./SpaceObject.ts";

export default class PhysicsEngine extends EventTarget {

  lastTimestamp?: DOMHighResTimeStamp; // milliseconds

  ticks = 0;

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
      const lastPos = o.position;
      const newVelocity = this.applyAccelerationToVelocity(o);
      const newPosition = translateVector(o.position, this.applyTimePeriod(newVelocity, timePeriod));
      if (newPosition === o.position) {
        // No change in position means we don't need to update.
        continue;
      }
      o.velocity = newVelocity;
      o.position = newPosition;
      const nextTickPosition = translateVector(o.position, this.applyTimePeriod(o.velocity, timePeriod))
      const intersectsWall = scene.wallIntersection(ov.globalCornersRotated(), nextTickPosition);
      if (intersectsWall) {
        this.handleCollision(ov, intersectsWall, lastPos, scene);
      }
      const collidesWith = scene.collidesWith(ov);
      if (collidesWith) {
        this.handleCollision(ov, collidesWith, lastPos, scene);
      }
    }
    this.ticks++;
  }

  applyTimePeriod(v: Velocity, timePeriod: DOMHighResTimeStamp) {
    const vector = new Velocity(v.magnitude * timePeriod, v.direction);
    return vector;
  }

  applyAccelerationToVelocity(o: SpaceObject) {
    const vectors = [o.velocity];
    if (o.isShip()) {
      vectors.push(o.acceleration)
    }
    const velocity = vectors.reduce((acc, v) => {
      return acc.addVector(v);
    }, new Velocity(0, 0));
    return velocity;
  }

  /**
   * Handles collision between one of the objects in the scene with another object in a scene,
   * or the wall of the screen.
   *
   * Dispatches a 'collision' event to other parts of the system.
   *
   * @param ov {SpaceObjectView}
   * @param collidedWith {CollisionTargetType}
   * @param lastPos {Point} The objects position just before the collision.
   */
  handleCollision(ov: SpaceObjectView, collidedWith: CollisionTargetType, lastPos: Point, scene: Scene) {
    const collEvent = new CollisionEvent(ov, collidedWith);
    switch (collEvent.collisionType) {
      case 'wall':
        scene.moveToOppositeEdge(ov, collidedWith);
        break;
      case 'SpaceObject':
        //Change the position to its last position.
        ov.object.position = lastPos;
        break;
    }
    this.dispatchEvent(collEvent);
  }

}