import {SpaceObjectView, type SpaceObjectViewOptions} from "./SpaceObjectView.ts";
import SpaceObject from "../models/SpaceObject.ts";


export class TorpedoView extends SpaceObjectView {

  constructor(object: SpaceObject, options: SpaceObjectViewOptions) {
    super(object, options);
  }

  shape() {
    return `
      <path d="M 32 32 L 38 29 L 42 32 L 38 35 M 32 32 L 53 32" stroke-width="0.5"/>
    `;
  }

}