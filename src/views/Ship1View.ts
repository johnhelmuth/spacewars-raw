import {SpaceObjectView, type SpaceObjectViewOptions} from "./SpaceObjectView.ts";
import type SpaceObject from "../models/SpaceObject.ts";

export class Ship1View extends SpaceObjectView {

  constructor(object: SpaceObject, options: SpaceObjectViewOptions) {
    super(object, options);
  }

  shape() {
    return `
      <circle r="15" cx="16" cy="32"/>
      <circle r="8" cx="16" cy="32"/>
      <circle r="2" cx="16" cy="32"/>
      <path d="M 63 10 C 20 24 20 40 63 54 M 63 10 C 32 24 32 40 63 54 "/>
    `;
  }

}