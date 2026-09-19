/**
 * Geometry of the game.
 *
 * A point is an x,y pair in the screen (page) coordinate system.
 *
 * Positive x is to the right.
 * Positive y is to the down.
 *
 * (0,0) is in the center of the space?
 */

export interface Point {
  x: number;
  y: number;
}

/** Angle - an angle on the board in degrees */
export type Angle = number;

/**
 * Vector
 */
export class Vector {
  x: number;
  y: number;

  constructor(v: { x?: number; y?: number, magnitude?: number, direction?: Angle }) {
    const {x, y, magnitude, direction} = v;
    if (typeof x !== 'undefined' && typeof y !== 'undefined') {
      this.x = x;
      this.y = y;
    } else if (typeof magnitude !== 'undefined' && typeof direction !== 'undefined') {
      const { x, y } = magDirToPoint(magnitude, direction);
      this.x = x;
      this.y = y;
    } else {
      throw new Error('Invalid parameters passed to constructor');
    }
  }

  /*
   * Gets the Vector's magnitude.
   */
  get magnitude() {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }

  set magnitude(magnitude: number) {
    const { x, y } = magDirToPoint(magnitude, this.direction);
    this.x = x;
    this.y = y;
  }

  /*
   * Gets the Vector's direction in degrees;
   */
  get direction() {
    return Math.atan2(this.x, this.y) * 180 / Math.PI;
  }

  set direction(direction: Angle) {
    const { x, y } = magDirToPoint(this.magnitude, direction);
    this.x = x;
    this.y = y;
  }

  addVector(v: Vector) {
    return new Vector({
      x: this.x + v.x,
      y: this.y + v.y,
    })
  }

  toString() {
    return `[${this.x},${this.y}, ${this.magnitude}, ${this.direction}]`;
  }
}

export type Velocity = Vector;

export interface BoundingBoxInterface {
  x: number,
  y: number,
  width: number,
  height: number
}

export class BoundingBox implements BoundingBoxInterface {
  x: number;
  y: number;
  x2: number;
  y2: number;
  width: number;
  height: number;

  constructor({x, y, width, height}: BoundingBoxInterface) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.x2 = x + width;
    this.y2 = y + height;
  }

  get top() {
    return this.y;
  }

  get left() {
    return this.x;
  }

  get right() {
    return this.x2;
  }

  get bottom() {
    return this.y2;
  }

  get corners() {
    return [
      {x: this.x, y: this.y},
      {x: this.x2, y: this.y},
      {x: this.x, y: this.y2},
      {x: this.x2, y: this.y2}
    ]
  }

  pointIntersects(p: Point): boolean {
    return (
        this.left <= p.x && p.x <= this.right
        && this.top <= p.y && p.y <= this.bottom
    )
  }

  boxIntersects(box: BoundingBox) {
    const corners = box.corners;

    const cornersInThisBox = corners.some((p) => this.pointIntersects(p));

    if (cornersInThisBox) {
      return true;
    }

    const thisCornersInBox = this.corners.some((p) => box.pointIntersects(p));
    if (thisCornersInBox) {
      return true;
    }
    return false;
  }
}

export const degreeToRadiansFactor = Math.PI / 180;
export const radiansToDegreesFactor = 180 / Math.PI;

/**
 * toDegrees()
 *
 * Converts an angle (radians) to degrees.
 */
export function toDegrees(angle: number): Angle {
  return angle * radiansToDegreesFactor;
}

/**
 * toRadians()
 *
 * Converts an angle (Angle) to radians.
 */
export function toRadians(degrees: Angle): number {
  return degrees * degreeToRadiansFactor;
}


/**
 * Translates a position by a Vector.
 *
 * @param p {Point} - The point to translate.
 * @param v {Vector} - The vector to use in the translation.
 *
 * @returns {Point}
 */
export function translateVector(p: Point, v: Vector): Point {
  return {
    x: p.x + v.x,
    y: p.y + v.y,
  }
}

/**
 * Clamps an angle in degrees to be between 0 and 360.
 *
 * @param n {number} - The angle to clamp.
 *
 * @returns {number} - The clamped angle.
 */
export function angleClamp(n: Angle): Angle {
  if (n > 360) {
    return n - 360;
  }
  if (n < 0) {
    return n + 360;
  }
  return n;
}

export function magDirToPoint(magnitude: number, direction: Angle): Point {
  const directionRad = toRadians(direction);
  return {
    x: magnitude * Math.sin(directionRad),
    y: -magnitude * Math.cos(directionRad)
  };
}