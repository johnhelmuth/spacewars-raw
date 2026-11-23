import {SpaceObject} from "./SpaceObject.ts";
import {Velocity} from "../types/geometry.ts";

export class Star extends SpaceObject {

  constructor() {
    super('Star', { x: 0, y: 0 }, 0, new Velocity(0, 0), 1000000);
    this.type = 'star';
  }

  destroy() {
    this.destroyed = false;
  }
}