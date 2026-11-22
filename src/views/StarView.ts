import {SpaceObjectView, type SpaceObjectViewOptions} from "./SpaceObjectView.ts";
import {SpaceObject} from "../models/SpaceObject.ts";


export class StarView extends SpaceObjectView {

  constructor(object: SpaceObject, options: SpaceObjectViewOptions) {
    super(object, options);
    this.vertices = [
      { x: -32, y: -32 },
      { x: 32, y: 32 },
    ];
  }

  shape() {
    return `<circle cx="0" cy="0" r="12" fill="white" />`;
  }

  destroy() {}
}