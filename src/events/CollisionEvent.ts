import {SpaceObject} from "../models/SpaceObject.ts";

export const directionVectors = {
  north: {
    velocity: {direction: 0, speed: 1}
  },
  east: {
    velocity: {direction: 90, speed: 1}
  },
  south: {
    velocity: {direction: 180, speed: 1}
  },
  west: {
    velocity: {direction: 270, speed: 1}
  },
}
export type WallType = keyof typeof directionVectors;

export type CollisionTargetType = SpaceObject | WallType


export class CollisionEvent extends Event {
  collides: SpaceObject;
  collidedWith: CollisionTargetType;

  constructor(collides: SpaceObject, collidedWith: CollisionTargetType) {
    super('collision');
    this.collides = collides;
    this.collidedWith = collidedWith;
  }

  get collisionType() {
    if (this.isWall) {
      return 'wall';
    }
    return this.isSpaceObject ? 'SpaceObject' : 'unknown';
  }

  get isWall() {
    return this.isWallType(this.collidedWith);
  }

  get isSpaceObject() {
    return this.isSpaceObjectType(this.collidedWith);
  }

  /**
   * Which direction to reflect vector after collision.
   *
   */
  get bounceDirection() {
    if (this.isWallType(this.collidedWith)) {
      return directionVectors[this.collidedWith].velocity;
    }
  }

  isWallType(o: any): o is WallType {
    return directionVectors.hasOwnProperty(o);
  }

  isSpaceObjectType(o: any): o is SpaceObject {
    return (typeof o === 'object' && o instanceof SpaceObject);
  }

  clone() {
    return new CollisionEvent(this.collides, this.collidedWith);
  }
}