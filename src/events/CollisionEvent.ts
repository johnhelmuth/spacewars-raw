import {SpaceObjectView} from "../views/SpaceObjectView.ts";

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

export type CollisionTargetType = SpaceObjectView | WallType


export class CollisionEvent extends Event {
  collides: SpaceObjectView;
  collidedWith: CollisionTargetType;

  constructor(collides: SpaceObjectView, collidedWith: CollisionTargetType) {
    super("collision");
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
    return this._isWall(this.collidedWith);
  }

  get isSpaceObject() {
    return this._isSpaceObject(this.collidedWith);
  }

  /**
   * Which direction to reflect vector after collision.
   *
   */
  get bounceDirection() {
    if (this._isWall(this.collidedWith)) {
      return directionVectors[this.collidedWith].velocity;
    }
    if (this._isSpaceObject(this.collidedWith)) {

    }
  }

  _isWall(o: any): o is WallType {
    return directionVectors.hasOwnProperty(o);
  }

  _isSpaceObject(o: any): o is SpaceObjectView {
    return (typeof o === 'object' && o instanceof SpaceObjectView);
  }
}