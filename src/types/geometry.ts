/**
 * Geometry of the game.
 *
 */


/**
 * LIGHT_SPEED - The maximum velocity of any object. Let's ignore time dilation for now.
 *
 * This seems to be a good value for game play.
 */
export const LIGHT_SPEED = 4000;

/*
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
  _x?: number;
  _y?: number;
  _mag?: number;
  _dir?: Angle;

  constructor(v: {  point?: Point, x?: number; y?: number, magnitude?: number, direction?: Angle }) {
    const {point, x, y, magnitude, direction} = v;
    if (typeof point !== 'undefined') {
      this._x = point.x;
      this._y = point.y;
    } else if (typeof x !== 'undefined' && typeof y !== 'undefined') {
      this._x = x;
      this._y = y;
    } else if (typeof magnitude !== 'undefined' && typeof direction !== 'undefined') {
      this._mag = magnitude;
      this._dir = direction;
    } else {
      throw new Error('Invalid parameters passed to constructor');
    }
  }

  get x() {
    if (typeof this._x !== 'undefined') {
      return this._x;
    }
    const v = this.calcXYFromMagDir()
    this._x = v.x;
    this._y = v.y;
    return this._x;
  }

  set x(x: number) {
    this._x = x;
    this._mag = undefined;
    this._dir = undefined;
  }

  get y() {
    if (typeof this._y !== 'undefined') {
      return this._y;
    }
    const v = this.calcXYFromMagDir()
    this._x = v.x;
    this._y = v.y;
    return this._y;
  }

  set y(y: number) {
    this._y = y;
    this._mag = undefined;
    this._dir = undefined;
  }

  /*
   * Gets the Vector's magnitude.
   */
  get magnitude() {
    if (typeof this._mag === 'undefined') {
      const vMD = this.calcMagDirFromXY();
      this._mag = vMD.magnitude;
      this._dir = vMD.direction;
    }
    return this._mag;
  }

  set magnitude(magnitude: number) {
    this._mag = magnitude;
    this._x = undefined;
    this._y = undefined;
  }

  /*
   * Gets the Vector's direction in degrees;
   */
  get direction() {
    if (typeof this._dir === 'undefined') {
      const vMD = this.calcMagDirFromXY();
      this._mag = vMD.magnitude;
      this._dir = toDegrees(vMD.direction);
    }
    return this._dir;
  }

  set direction(direction: Angle) {
    this._dir = direction;
    this._x = undefined;
    this._y = undefined;
  }

  asPoint() {
    const { x, y } = this;
    return { x, y };
  }

  calcXYFromMagDir() {
    if (typeof this._mag !== 'undefined' && typeof this._dir !== 'undefined' ) {
      const {x, y} = magDirToPoint(this._mag, this._dir);
      return {x, y}
    }
    throw new Error('No magnitude or direction was specified.')
  }

  calcMagDirFromXY() {
    if (typeof this._x !== 'undefined' && typeof this._y !== 'undefined' ) {
      return pointToMagDir({ x: this._x, y: this._y});
    }
    throw new Error('No x or y was specified.')
  }

  addVector(v: Vector) {
    return new Vector({
      x: this.x + v.x,
      y: this.y + v.y,
    })
  }

  toString() {
    const { x, y, magnitude, direction } = this;
    return `{ x: ${x}, y: ${y}, magnitude: ${magnitude}, direction: ${direction} }`;
  }
}

/**
 * Velocity is a Vector that considers the magnitude of the Vector as the speed of the object
 * in meters per second (m/s) and the direction as an angle in degrees.
 *
 * It has a maximum magnitude of LIGHT_SPEED.
 */

export class Velocity extends Vector {

  constructor(v: {  point?: Point, x?: number; y?: number, magnitude?: number, direction?: Angle }) {
    super(v);
    if (super.magnitude > LIGHT_SPEED) { // This calculates magnitude if x, y was supplied to constructor.
      super.magnitude = LIGHT_SPEED; // This reset x, y if they were supplied to constructor.
    }
  }

  get magnitude() {
    return super.magnitude;
  }

  set magnitude(magnitude: number) {
    let velMagnitude = Math.min(magnitude, LIGHT_SPEED);
    super.magnitude = velMagnitude;
  }

  addVector(v: Velocity) {
    return new Velocity({
      x: this.x + v.x,
      y: this.y + v.y,
    })
  }


}

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

  get aspectRatio() {
    return this.width / this.height;
  }

  pointIntersects(p: Point): boolean {
    return (
           between(p.x, [this.left, this.right])
        && between(p.y, [this.top, this.bottom])
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

  containsBox(box: BoundingBox) {
    const corners = box.corners;
    return corners.every((p) => this.pointIntersects(p))
  }
}

export const degreeToRadiansFactor = Math.fround(Math.PI / 180);
export const radiansToDegreesFactor = Math.fround(180 / Math.PI);

/**
 * toDegrees()
 *
 * Converts an angle (radians) to degrees.
 */
export function toDegrees(angle: number): Angle {
  return Math.fround(angle * radiansToDegreesFactor);
}

/**
 * toRadians()
 *
 * Converts an angle (Angle) to radians.
 */
export function toRadians(degrees: Angle): number {
  return Math.fround(degrees * degreeToRadiansFactor);
}

/**
 * Determine if a number is within a range of numbers, inclusive.
 *
 * @param a {number}
 * @param b {[number, number]}
 */
export function between(a: number, b: [number, number]): boolean {
  return (
      b[0] <= a && a <= b[1]
  );
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

export function rotateVertices(verts: Point[], rotPt: Point, direction: Angle) {
  return verts.map((p) => {
    return rotatePoint(p, rotPt, direction)
  })
}

export function rotatePoint(p: Point, rotPt: Point, direction: Angle) {
  const directionRad = toRadians(direction);
  const pO = {
    x: p.x - rotPt.x,
    y: p.y - rotPt.y,
  }
  const pR = {
    x: pO.x * Math.cos(directionRad) + pO.y * Math.sin(directionRad),
    y: -pO.x * Math.sin(directionRad) + pO.y * Math.cos(directionRad),
  }
  const p1 = {
    x: pR.x + rotPt.x,
    y: pR.y + rotPt.y,
  }
  return p1;
}


/**
 * Clamps an angle in degrees to be between 0 and 360.
 *
 * @param n {number} - The angle to clamp.
 *
 * @returns {number} - The clamped angle.
 */
export function angleClamp(n: Angle): Angle {
  const newN = n % 360;
  return newN < 0 ? (newN + 360) : newN;
}

export function magDirToPoint(magnitude: number, direction: Angle): Point {
  const directionRad = toRadians(direction);
  return {
    x: Math.fround(magnitude * Math.cos(directionRad)),
    y: Math.fround(magnitude * Math.sin(directionRad))
  };
}

export function pointToMagDir(p: Point) {
  const magnitude = Math.fround(Math.sqrt(p.x * p.x + p.y * p.y));
  const direction = Math.fround(angleClamp(Math.atan2(p.y, p.x) * 180 / Math.PI));
  return { magnitude, direction };
}