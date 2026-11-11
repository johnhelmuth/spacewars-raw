import type SpaceObject from "../models/SpaceObject.ts";
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

export interface SpaceObjectViewInterface {
  object: SpaceObject;

  options: SpaceObjectViewOptions;

  rotatePoint: Point;

  vertices: Point[];

  boundingBox: BoundingBox;

  globalCornersRotated(): Point[];

  render(showVectors: boolean): string;

  isCollision(ov: SpaceObjectViewInterface): boolean;
}

export abstract class SpaceObjectView extends Renderer implements SpaceObjectViewInterface {

  object: SpaceObject;
  options: SpaceObjectViewOptions;
  objectScaleWidth: number;
  objectScaleHeight: number;

  /* rotatePoint {Point} - The point in the object's coordinate system about which it rotates as its facing chagnes. */
  rotatePoint: Point;
  vertices = [] as Point[];
  _boundingBox?: BoundingBox;

  protected constructor(object: SpaceObject, options: SpaceObjectViewOptions) {
    super();
    this.object = object;
    this.options = options;
    this.objectScaleWidth = 1;
    this.objectScaleHeight = 1;
    this.rotatePoint = {x: 0, y: 0};
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

  vectorLineRender() {
    return `<path class="object-vector" d="M ${this.object.position.x} ${this.object.position.y} L ${this.object.position.x + 100} ${this.object.position.y}" stroke-dasharray="- - -"/>`;
  }

  render(showVectors: boolean) {
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
    return `
          <svg
            class="space-object ${objectType}"
            height="${bb.height}" width="${bb.width}"
            x="${globalOffsetPos.x}px"
            y="${globalOffsetPos.y}px"
            style="transform-origin: calc(${scaledRotatePoint.x}px) calc(${scaledRotatePoint.y}px); transform: rotate(${facing}deg);"
              viewBox="${this.bbToViewBox(bb)}"
          >
            <g>
              ${this.shape()}
              ${showVectors ? this.vectorLineRender() : ''}
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

  isCollision(ov: SpaceObjectViewInterface): boolean {
    return polygonIntersects(this.globalCornersRotated(), ov.globalCornersRotated());
  }

  tick({timePeriod, timestamp}: {timePeriod: number, timestamp: DOMHighResTimeStamp}) {
    this.object.tick({timePeriod, timestamp});
  }
}