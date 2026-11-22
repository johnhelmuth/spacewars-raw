import {SpaceObjectView, type SpaceObjectViewOptions} from "./SpaceObjectView.ts";
import {SpaceObject} from "../models/SpaceObject.ts";

export class TorpedoView extends SpaceObjectView {

  constructor(object: SpaceObject, options: SpaceObjectViewOptions) {
    super(object, options);
    this.vertices = [
      { x: 0, y: -8 },
      { x: -5, y: -5 },
      { x: 0, y: 8 },
      { x: 5, y: -5 },
    ];
  }

  shape() {
    return `
      <path d="M 0,-8 L -5,-5 L 0,8 L 5,-5 Z" stroke-width="0.5"/>
    `;
  }

}