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

/**
 * SimplePolygon
 *
 * From Wikipedia https://en.wikipedia.org/wiki/Convex_polygon
 *
 * > In geometry, a convex polygon is a polygon that is the boundary of a convex set. This means that the line segment between two points of the polygon is contained in the union of the interior and the boundary of the polygon. In particular, it is a simple polygon (not self-intersecting).[1] Equivalently, a polygon is convex if every line that does not contain any edge intersects the polygon in at most two points.
 */
export type SimplePolygon = Point[];


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

  constructor(magnitude: number, direction: Angle) {
    if (magnitude > LIGHT_SPEED) {
      magnitude = LIGHT_SPEED;
    }
    super({magnitude, direction});
  }

  get magnitude() {
    return super.magnitude;
  }

  set magnitude(magnitude: number) {
    let velMagnitude = Math.min(magnitude, LIGHT_SPEED);
    super.magnitude = velMagnitude;
  }

  addVector(v: Velocity) {
    const {magnitude, direction} = new Vector({
      x: this.x + v.x,
      y: this.y + v.y,
    })
    return new Velocity(magnitude, direction);
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
      {x: this.x2, y: this.y2},
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

  containsAllPoints(points: Point[]) {
    return points.every((p) => this.pointIntersects(p))
  }
}

/**
 * Determines if a point is inside of polygon.
 *
 * Cribbed from solution 1 from "Determining if a point lies on the interior of a polygon" by Paul Bourke,
 * This algorithm counts the number of times a horizontal line that that contains the point intersects with
 * a line segment of the polygon. An even number of intersections means the point is outside the polygon, an
 * odd number means it is inside.
 *
 * Discovered article here https://www.eecs.umich.edu/courses/eecs380/HANDOUTS/PROJ2/InsidePoly.html
 *
 * @param p {Point}
 * @param poly {SimplePolygon}
 *
 * @returns Boolean - true if the point is inside the polygon.
 */
export function pointInsidePoly(p: Point, poly: SimplePolygon) {
  let counter = 0;
  let p1 = poly[0];

  for (let i = 1; i <= poly.length; i++) {
    let p2 = poly[i%(poly.length)]; // Last line segment is from last point to first point.
    if (p.y > Math.min(p1.y, p2.y)) {
      if (p.y <= Math.max(p1.y, p2.y)) {
        if (p.x <= Math.max(p1.x, p2.x)) {
          if (p1.y != p2.y) {
            const xIntersects = (p.y-p1.y)*(p2.x-p1.x)/(p2.y-p1.y)+p1.x;
            if (p1.x == p2.x || p.x <= xIntersects) {
              counter++;
            }
          }
        }
      }
    }
    p1 = p2;
  }

  return counter % 2 !== 0;
}

/**
 * Simple polygon intersects another simple polygon.
 *
 * @param polyA
 * @param polyB
 */
export function polygonIntersects(polyA: SimplePolygon, polyB: SimplePolygon) {

  const aCornersInPolyB = polyA.some((p) => pointInsidePoly(p, polyB));

  if (aCornersInPolyB) {
    return true;
  }
  // Handle the case where polyB is completely contained in polyA.
  const bCornersInPolyA = polyB.some((p) => pointInsidePoly(p, polyA));

  if (bCornersInPolyA) {
    return true;
  }

  return false;
}

export function pointsToBoundingBox(vertices: Point[]) {
  const MAX_VALUE = Number.MAX_VALUE;
  let top = MAX_VALUE;
  let right = -MAX_VALUE;
  let bottom = -MAX_VALUE;
  let left = MAX_VALUE;

  for (const v of vertices) {
    if (v.y < top) {
      top = v.y;
    }
    if (v.y > bottom) {
      bottom = v.y;
    }
    if (v.x < left) {
      left = v.x;
    }
    if (v.x > right) {
      right = v.x;
    }
  }

  const width = right - left;
  const height = bottom - top;

  return new BoundingBox({ x: left, y: top, width, height });
}

export function roundTo(n: number, digits = 15): number {
  const factor = 10**(digits-1);
  return Math.fround(Math.fround(n * factor) / factor);
}

export const degreeToRadiansFactor = roundTo(Math.PI / 180);
export const radiansToDegreesFactor = roundTo(180 / Math.PI);

/**
 * toDegrees()
 *
 * Converts an angle (radians) to degrees.
 */
export function toDegrees(angle: number): Angle {
  return roundTo(angle * radiansToDegreesFactor);
}

/**
 * toRadians()
 *
 * Converts an angle (Angle) to radians.
 */
export function toRadians(degrees: Angle): number {
  return roundTo(degrees * degreeToRadiansFactor);
}

/**
 * Determine if a number is within a range of numbers, inclusive.
 *
 * @param a {number}
 * @param b {[number, number]}
 */
export function between(a: number, b: [number, number]): boolean {
  const min = Math.min(b[0], b[1]), max = Math.max(b[0], b[1]);
  return min <= a && a <= max;
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

export function rotateVertices(verts: Point[], rotPt: Point, direction: Angle, v? : Vector) {
  const needsTranslate = typeof v !== 'undefined';
  return verts.map((p) => {
    const rP = rotatePoint(p, rotPt, direction)
    if (needsTranslate) {
      return translateVector(rP, v);
    }
    return rP;
  })
}


/**
 * Clamps an angle in degrees to be between 0 and 360.
 *
 * @param n {number} - The angle to clamp.
 *
 * @returns {number} - The clamped angle.
 */
export function angleClamp(n: Angle): Angle {
  let newN = n % 360;
  if (newN < 0) {
    newN += 360;
  }
  if (equalFloat(newN, 360)) {
    newN = 0;
  }
  return newN;
}

/**
 * Compares 2 floating point numbers within a threshold.
 *
 * @param a {number}
 * @param b {number}
 * @param threshold {number} - If the difference between the numbers is less than this, they are equal.
 */
export function equalFloat(a: number, b: number, threshold = 0.0001) : boolean {
  return (Math.abs(a-b) <= threshold);
}

export function magDirToPoint(magnitude: number, direction: Angle): Point {
  const directionRad = toRadians(direction-90);
  return {
    x: roundTo(magnitude * Math.cos(directionRad)),
    y: roundTo(magnitude * Math.sin(directionRad))
  };
}

export function pointToMagDir(p: Point) {
  const magnitude = roundTo(Math.sqrt(p.x * p.x + p.y * p.y));
  const direction = angleClamp(roundTo((Math.atan2(p.y, p.x) * 180 / Math.PI)+90));
  return { magnitude, direction };
}

export function rotatePoint(p: Point, rotPt: Point, direction: Angle) {
  const directionRad = toRadians(-direction);
  const pO = {
    x: p.x - rotPt.x,
    y: p.y - rotPt.y,
  }
  const pR = {
    x: roundTo(pO.x * Math.cos(directionRad)) + roundTo(pO.y * Math.sin(directionRad)),
    y: -roundTo(pO.x * Math.sin(directionRad)) + roundTo(pO.y * Math.cos(directionRad)),
  }
  const p1 = {
    x: pR.x + rotPt.x,
    y: pR.y + rotPt.y,
  }
  return p1;
}