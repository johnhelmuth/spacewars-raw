import {SpaceObjectView} from "./SpaceObjectView.ts";
import type SpaceObject from "../models/SpaceObject.ts";

export class Ship1View extends SpaceObjectView {

  constructor(object: SpaceObject) {
    super(object);
    this.rotatePoint = { x: 32, y: 16 };
  }

  shape() {
    return `
      <circle r="15" cx="32" cy="16"/>
      <circle r="8" cx="32" cy="16"/>
      <circle r="2" cx="32" cy="16"/>
      <path d="M 10 63 C 24 20 40 20 54 63 M 10 63 C 24 32 40 32 54 63 "/>
    `;
  }

}