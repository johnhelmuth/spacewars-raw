import {SpaceObjectView, type SpaceObjectViewOptions} from "./SpaceObjectView.ts";
import type SpaceObject from "../models/SpaceObject.ts";

export class Ship1View extends SpaceObjectView {

  constructor(object: SpaceObject, options: SpaceObjectViewOptions) {
    super(object, options);
    this.vertices = [
      { x:   0, y: -32 },
      { x:  16, y: -16 },
      { x:   0, y:   0 },
      { x: -16, y: -16 },

      { x: -24, y:  28 },
      { x: -16, y: -10 },
      { x:  16, y: -10 },
      { x:  24, y:  28 },
      { x:  24, y:  32 },
      { x:  21, y:  32 },
      { x:  20, y:  28 },
      { x:  16, y:   0 },
      { x: -16, y:   0 },
      { x: -20, y:  28 },
      { x: -21, y:  32 },
      { x: -24, y:  32 },
      { x: -24, y:  28 },
    ];
  }

  shape() {
    return `
      <circle r="16" cx="0" cy="-16"/>
      <circle r="8" cx="0" cy="-16"/>
      <circle r="2" cx="0" cy="-16"/>
      <path d="M -24,28 C -16,-10 16,-10 24,28 C 24,32 21,32 20,28 C 16,0 -16,0 -20,28 C -21,32 -24,32 -24,28"/>
<!--       <rect width="44" height="64" x="-22" y="-32" fill="none" stroke="lightgrey"/> -->
    `;
  }

}