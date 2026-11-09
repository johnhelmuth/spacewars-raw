import {BoundingBox} from "../types/geometry.ts";

export class Renderer extends EventTarget {

  bbToViewBox(bb: BoundingBox): string {
    return `${bb.x} ${bb.y} ${bb.width} ${bb.height}`;
  }
}