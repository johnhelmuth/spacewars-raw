import {SpaceObject} from "../models/SpaceObject.ts";
import {
  BoundingBox,
  type Point,
  pointsToBoundingBox, polygonIntersects,
  rotateVertices,
  translateVector,
  Vector
} from "../types/geometry.ts";
import {Renderer} from "./Renderer.ts";

export interface SpaceObjectViewOptions {
  dimensions: { width: number; height: number };
  showGrid: boolean;
}

export abstract class SpaceObjectView extends Renderer {

  object: SpaceObject;
  options: SpaceObjectViewOptions;
  objectScaleWidth: number;
  objectScaleHeight: number;

  /* rotatePoint {Point} - The point in the object's coordinate system about which it rotates as its facing chagnes. */
  rotatePoint: Point;
  vertices = [] as Point[];
  _boundingBox?: BoundingBox;

  // The system tick counter
  animationTick = 0;

  // The number of ticks the destroyed animation will run.
  // TODO: Consider using a time based vs tick based animation.
  destroyedAnimationTicks = 0;

  // The system tick counter after which the object will be removed from the scene.
  destroyAfter = 0;

  protected constructor(object: SpaceObject, options: SpaceObjectViewOptions) {
    super();
    this.object = object;
    this.options = options;
    this.objectScaleWidth = 1;
    this.objectScaleHeight = 1;
    this.rotatePoint = {x: 0, y: 0};
    this.destroyedAnimationTicks = 15;
  }

  abstract shape(): string;

  get boundingBox(): BoundingBox {
    if (typeof this._boundingBox === "undefined") {
      this._boundingBox = pointsToBoundingBox(this.vertices);
    }
    return this._boundingBox;
  }

  globalCornersRotated() {
    return rotateVertices(
      this.boundingBox.corners,
      this.rotatePoint,
      this.object.facing,
      new Vector(this.object.position)
    );
  }

  render() {
    const facing = this.object.facing;
    const gRotatePoint = translateVector(this.object.position, new Vector(this.rotatePoint));
    const objectType = this.object.type;
    const scaledRotatePoint = {
      x: gRotatePoint.x * this.objectScaleWidth,
      y: gRotatePoint.y * this.objectScaleHeight,
    };
    const bb = this.boundingBox;
    const globalOffsetPos = translateVector(this.object.position, new Vector({x: bb.x, y: bb.y}));
    const [topLeft, topRight, botLeft, botRight] = this.globalCornersRotated();
    const rotBB = pointsToBoundingBox([topLeft, topRight, botLeft, botRight]);
    let viewBox: string;
    let shape: string;
    let height = bb.height;
    let width = bb.width;
    if (! this.runningDestroyedAnimation) {
      viewBox = this.bbToViewBox(bb);
      shape = this.shape();
    } else {
      viewBox = this.explosionViewBox();
      shape = this.explosionShape();
      const explRadius = this.explosionRadius();
      height = explRadius;
      width = explRadius;
    }
    return `
          <svg
            class="space-object ${objectType}"
            height="${height}" width="${width}"
            x="${globalOffsetPos.x}px"
            y="${globalOffsetPos.y}px"
            style="transform-origin: calc(${scaledRotatePoint.x}px) calc(${scaledRotatePoint.y}px); transform: rotate(${facing}deg);"
              viewBox="${viewBox}"
          >
            <g>
              ${shape}
            </g>
          </svg>
          ${this.options.showGrid ? `
            <svg 
              class="other-bb" 
              height="${rotBB.height}" 
              width="${rotBB.width}"
              x="${rotBB.x}px" y="${rotBB.y}px"
              viewBox="${this.bbToViewBox(rotBB)}"
              >
                <g class="calc-bb">
                  <path d="M ${topLeft.x} ${topLeft.y} L ${topRight.x} ${topRight.y} L ${botRight.x} ${botRight.y} L ${botLeft.x} ${botLeft.y} Z" 
                        fill="transparent"
                        stroke="grey"
                        stroke-width="1"
                  /> 
                  <circle cx="${topLeft.x}" cy="${topLeft.y}" r="3" fill="blue" />
                  <circle cx="${topRight.x}" cy="${topRight.y}" r="3" fill="lime" />
                  <circle cx="${botRight.x}" cy="${botRight.y}" r="3" fill="orange" />
                  <circle cx="${botLeft.x}" cy="${botLeft.y}" r="3" fill="purple" />
                </g>
              </svg>
              ` : ''} 
    `;
  }

  // The explosion animation tick is 1 through this.destroyedAnimationTicks.
  get explosionAnimationTick() {
    return this.destroyedAnimationTicks - (this.destroyAfter - this.animationTick);
  }

  /**
   * explosionAnimationTick = 1-15
   * radius = 4-32
   */
  explosionRadius() {
    return (this.explosionAnimationTick+1)*2;
  }

  explosionMaxRadius() {
    return (this.destroyedAnimationTicks+1)*2;
  }

  explosionViewBox() {
    const radius = this.explosionRadius();
    return `${-radius} ${-radius} ${radius*2} ${radius*2}`;
  }

  explosionShape() {
    // The explosion animation tick is 1 through this.destroyedAnimationTicks+1.
    const radius = this.explosionRadius();
    const radiusDiff = this.explosionMaxRadius()/4;
    let explosion = '';
    for (let r = 0; r <= radius; r+=radiusDiff) {
      explosion += `<circle cx="0" cy="0" r="${r}" fill="transparent" />`
    }
    return explosion
  }

  isCollision(ov: SpaceObjectView): boolean {
    return polygonIntersects(this.globalCornersRotated(), ov.globalCornersRotated());
  }

  tick() {
    this.animationTick += 1;
    return !(this.object.destroyed && !this.runningDestroyedAnimation);
  }

  get runningDestroyedAnimation() {
    return this.object.destroyed && (this.animationTick <= this.destroyAfter);
  }

  startDestroyAnimation() {
    this.destroyAfter = this.animationTick + this.destroyedAnimationTicks;
  }
}