import type Scene from "./Scene.ts";
import {translateVector, Vector} from "../types/geometry.ts";
import {CollisionEvent, type CollisionTargetType} from "../events/CollisionEvent.ts";
import type {SpaceObjectView} from "../views/SpaceObjectView.ts";
import type SpaceObject from "./SpaceObject.ts";

export default class PhysicsEngine extends EventTarget {

  tick(scene: Scene) {
    for (const ov of scene) {
      const o = ov.object;
      const lastPos = o.position;
      o.velocity = this.calcAcceleration(o);
      o.position = translateVector(o.position, o.velocity);
      const intersectsWall = scene.wallIntersection(ov);
      if (intersectsWall) {
        console.log(`Bang! ${o.name} collided with the ${intersectsWall} wall!`)
        o.position = lastPos;
        this.handleCollision(ov, intersectsWall);
      }
      const collidesWith = scene.collidesWith(ov);
      if (collidesWith) {
        console.log(`Bang! ${o.name} collided with ${collidesWith.object.name}!`)
        o.position = lastPos;
        this.dispatchEvent(new CollisionEvent(ov, collidesWith))
      }
    }
  }

  calcAcceleration(o: SpaceObject) {
    const vectors = [o.velocity] as Vector[];
    if (o.isShip(o)) {
      vectors.push(o.acceleration)
    }
    return vectors.reduce((acc, v) => {
      return acc.addVector(v);
    }, new Vector({x: 0, y: 0}));
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