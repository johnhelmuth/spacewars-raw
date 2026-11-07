import {SpaceObjectView, type SpaceObjectViewOptions} from "./SpaceObjectView.ts";
import type SpaceObject from "../models/SpaceObject.ts";

export class Ship1View extends SpaceObjectView {

  constructor(object: SpaceObject, options: SpaceObjectViewOptions) {
    super(object, options);
    this.vertices = [
      { x: 1, y: 17 },
      { x: 1, y: 47 },
      { x: 31, y: 17 },
      { x: 31, y: 47 },
      { x: 63, y: 10 },
      { x: 20, y: 24 },
      { x: 20, y: 40 },
      { x: 63, y: 54 },
      { x: 32, y: 24 },
      { x: 32, y: 40 },
    ];
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