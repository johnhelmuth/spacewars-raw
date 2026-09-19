import type SpaceObject from "../models/SpaceObject.ts";
import type {Point} from "../types/geometry.ts";
import {BoundingBox} from "../types/geometry.ts";

export const OBJECT_SIZE_WIDTH = 64;
export const OBJECT_SIZE_HEIGHT = 64;

export interface SpaceObjectViewInterface {
  object: SpaceObject;

  rotatePoint: Point;

  boundingBox(): BoundingBox;

  render(): string;

  isCollision(ov: SpaceObjectViewInterface): boolean;
}

export abstract class SpaceObjectView implements SpaceObjectViewInterface {

  object: SpaceObject;
  rotatePoint: Point;

  protected constructor(object: SpaceObject) {
    this.object = object;
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

  render() {
    const {x, y} = this.object.position;
    const facing = this.object.facing;
    const objectType = this.object.type;
    const {x: rx, y: ry} = this.rotatePoint;
    return `
          <svg
            class="space-object ${objectType}"
            height="${OBJECT_SIZE_HEIGHT}" width="${OBJECT_SIZE_WIDTH}"
            x="${x}px"
            y="${y}px"
            style="transform-origin: calc(${x}px + ${rx}px) calc(${y}px + ${ry}px); transform: rotate(${facing}deg);"
            viewBox="0 0 ${OBJECT_SIZE_HEIGHT} ${OBJECT_SIZE_WIDTH}"
            preserveAspectRatio="xMidYMid meet"
          >
            <!-- <rect x="0" y="0" width="${OBJECT_SIZE_WIDTH}" height="${OBJECT_SIZE_HEIGHT}" fill="#5f5f5f"/> -->
            <g>
              ${this.shape()}
            </g>
          </svg>
    `;
  }

  isCollision(ov: SpaceObjectViewInterface): boolean {
    return this.boundingBox().boxIntersects(ov.boundingBox());
  }
}