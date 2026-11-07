import {SpaceObjectView, type SpaceObjectViewOptions} from "./SpaceObjectView.ts";
import type SpaceObject from "../models/SpaceObject.ts";

export class Ship2View extends SpaceObjectView {

  constructor(object: SpaceObject, options: SpaceObjectViewOptions) {
    super(object, options);
  }

  shape() {
    return `
      <path d="M 2 32 L 63 48 L 32 32 L 63 16 Z" stroke-linejoin="miter"/>
    `;
  }
}