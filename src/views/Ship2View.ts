import {SpaceObjectView, type SpaceObjectViewOptions} from "./SpaceObjectView.ts";
import type SpaceObject from "../models/SpaceObject.ts";

export class Ship2View extends SpaceObjectView {

  constructor(object: SpaceObject, options: SpaceObjectViewOptions) {
    super(object, options);
    this.vertices = [
      { x: 0, y: -30 },
      { x: 16, y: 30 },
      { x: 0, y: 0 },
      { x: -16, y: -30 },
    ]
  }

  shape() {
    return `
      <path d="M 0,-30 L 16,30 L 0, 0, L -16, 30 Z" stroke-linejoin="miter"/>
    `;
  }
}