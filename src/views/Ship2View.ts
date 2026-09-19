import {SpaceObjectView} from "./SpaceObjectView.ts";
import type SpaceObject from "../models/SpaceObject.ts";

export class Ship2View extends SpaceObjectView {

  constructor(object: SpaceObject) {
    super(object);
    this.rotatePoint = { x: 32, y: 32 };
  }

  shape() {
    return `
      <path d="M 32 2 L 48 63 L 32 32 L 16 63 Z" stroke-linejoin="miter"/>
    `;
  }

}