import type Scene from "./Scene.ts";
import {translateVector, Vector} from "../types/geometry.ts";
import {CollisionEvent, type CollisionTargetType} from "../events/CollisionEvent.ts";
import type {SpaceObjectView} from "../views/SpaceObjectView.ts";
import type SpaceObject from "./SpaceObject.ts";
import {Ship} from "./Ship.ts";

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
    const timePeriod = 1/60; // seconds... assuming 60 frames per second
    //typeof this.lastTimestamp === "number" ? (timestamp - this.lastTimestamp)/1000 : 1/60;
    console.group(`PhysicsEngine.tick() ${this.ticks}`)
    this.lastTimestamp = timestamp;
    for (const ov of scene) {
      const o = ov.object;
      const lastPos = o.position;
      console.group(`PhysicsEngine.tick() ${o.name}`)
      const newVelocity = this.applyAccelerationToVelocity(o);
      const newPosition = translateVector(o.position, this.applyTimePeriod(newVelocity, timePeriod));
      if (newPosition === o.position) {
        // No change in position means we don't need to update.
        console.groupEnd();
        continue;
      }
      if (o instanceof Ship) {
        console.log('acceleration', o.acceleration)
      }
      console.log('new velocity', newVelocity)
      console.log('new position', newPosition);
      console.groupEnd();
      o.velocity = newVelocity;
      o.position = newPosition;
      const intersectsWall = scene.wallIntersection(ov);
      if (intersectsWall) {
        o.position = lastPos;
        this.handleCollision(ov, intersectsWall);
      }
      const collidesWith = scene.collidesWith(ov);
      if (collidesWith) {
        o.position = lastPos;
        this.dispatchEvent(new CollisionEvent(ov, collidesWith))
      }
    }
    console.groupEnd();
    this.ticks++;
  }

  applyTimePeriod(v: Vector, timePeriod: DOMHighResTimeStamp) {
    const vector = new Vector({magnitude: v.magnitude * timePeriod, direction: v.direction});
    console.log(`PhysicsEngine.applyTimePeriod(vector, timePeriod) v: ${v}, new v: ${vector}`);
    return vector;
  }

  applyAccelerationToVelocity(o: SpaceObject) {
    const vectors = [o.velocity];
    if (o.isShip()) {
      vectors.push(o.acceleration)
    }
    console.group('PhysicsEngine.applyAccelerationToVelocity() vectors')
    vectors.forEach(v => console.log(`* ${v}`))
    console.groupEnd();
    const velocity = vectors.reduce((acc, v) => {
      return acc.addVector(v);
    }, new Vector({x: 0, y: 0}));
    console.log(`PhysicsEngine.applyAccelerationToVelocity() new velocity: ${velocity}.`);
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
   */
  handleCollision(ov: SpaceObjectView, collidedWith: CollisionTargetType) {
    const collEvent = new CollisionEvent(ov, collidedWith);
    switch (collEvent.collisionType) {
      case 'wall':
        /* ??? bounce to the other direction for now ??? */
          // ov.object.velocity = reflectVelocity(ov.object.velocity, collEvent.bounceDirection);
        /* TODO: Teleport to other side of screen. */
        break;
      case 'SpaceObject':
        /* ??? bounce to the other direction for now ??? */
        // ov.object.velocity = reflectVelocity(ov.object.velocity, collEvent.bounceDirection);
        break;
    }
    this.dispatchEvent(collEvent);
  }

}