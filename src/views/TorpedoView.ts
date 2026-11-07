import {SpaceObjectView, type SpaceObjectViewOptions} from "./SpaceObjectView.ts";
import SpaceObject from "../models/SpaceObject.ts";


export class TorpedoView extends SpaceObjectView {

  constructor(object: SpaceObject, options: SpaceObjectViewOptions) {
    super(object, options);
  }

  shape() {
    return `
      <path d="M 0 32 L 4 29 L 10 32 L 4 35 Z" stroke-width="0.5"/>
    `;
  }

}