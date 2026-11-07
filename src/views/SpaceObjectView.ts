import type SpaceObject from "../models/SpaceObject.ts";
import type {Point} from "../types/geometry.ts";
import {BoundingBox} from "../types/geometry.ts";

export const OBJECT_SIZE_WIDTH = 64;
export const OBJECT_SIZE_HEIGHT = 64;

export interface SpaceObjectViewOptions {
  dimensions: { width: number; height: number };
  showGrid: boolean;
}

export interface SpaceObjectViewInterface {
  object: SpaceObject;

  options: SpaceObjectViewOptions;

  rotatePoint: Point;

  boundingBox(): BoundingBox;

  render(showVectors: boolean): string;

  isCollision(ov: SpaceObjectViewInterface): boolean;
}

export abstract class SpaceObjectView extends EventTarget implements SpaceObjectViewInterface {

  object: SpaceObject;
  options: SpaceObjectViewOptions;
  objectScaleWidth: number;
  objectScaleHeight: number;
  rotatePoint: Point;

  protected constructor(object: SpaceObject, options: SpaceObjectViewOptions) {
    super();
    this.object = object;
    this.options = options;
    this.objectScaleWidth = 1;
    this.objectScaleHeight = 1;
    this.rotatePoint = {x: OBJECT_SIZE_WIDTH / 2, y: OBJECT_SIZE_HEIGHT / 2}
  }

  abstract shape(): string;

  boundingBox(): BoundingBox {
    const {x, y} = this.object.position;
    return new BoundingBox({
      x, y,
      width: OBJECT_SIZE_WIDTH,
      height: OBJECT_SIZE_HEIGHT,
    })
  }

  offsetObject(p: Point): Point {
    return {
      x: p.x - OBJECT_SIZE_WIDTH/2,
      y: p.y - OBJECT_SIZE_HEIGHT/2,
    }
  }

  vectorLineRender() {
    return `<path class="object-vector" d="M ${this.object.position.x} ${this.object.position.y} L ${this.object.position.x + 100} ${this.object.position.y}" stroke-dasharray="- - -"/>`;
  }

  render(showVectors: boolean) {
    const {x, y} = this.offsetObject(this.object.position);
    const facing = this.object.facing;
    const objectType = this.object.type;
    const scaledRotatePoint = {
      x: this.rotatePoint.x * this.objectScaleWidth,
      y: this.rotatePoint.y * this.objectScaleHeight,
    };
    const scaledPos = {
      x: x * this.objectScaleWidth,
      y: y * this.objectScaleHeight,
    };
    return `
          <svg
            class="space-object ${objectType}"
            height="${this.objectScaleHeight*OBJECT_SIZE_HEIGHT}" width="${this.objectScaleWidth*OBJECT_SIZE_WIDTH}"
            x="${scaledPos.x}px"
            y="${scaledPos.y}px"
            style="transform-origin: calc(${scaledPos.x}px + ${scaledRotatePoint.x}px) calc(${scaledPos.y}px + ${scaledRotatePoint.y}px); transform: rotate(${facing + 180}deg);"
            viewBox="0 0 ${OBJECT_SIZE_HEIGHT} ${OBJECT_SIZE_WIDTH}"
            preserveAspectRatio="xMidYMid meet"
          >
             ${this.options.showGrid ? `<rect x="0" y="0" width="${OBJECT_SIZE_WIDTH}" height="${OBJECT_SIZE_HEIGHT}" stroke-width="0.5" fill="transparent"/>` : ''} 
            <g>
              ${this.shape()}
              ${showVectors ? this.vectorLineRender() : ''}
            </g>
          </svg>
    `;
  }

  isCollision(ov: SpaceObjectViewInterface): boolean {
    return this.boundingBox().boxIntersects(ov.boundingBox());
  }

  tick({timePeriod, timestamp}: {timePeriod: number, timestamp: DOMHighResTimeStamp}) {
    this.object.tick({timePeriod, timestamp});
  }
}