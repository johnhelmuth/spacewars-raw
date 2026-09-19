import type {SpaceObjectView} from "../views/SpaceObjectView.ts";
import {BoundingBox} from "../types/geometry.ts";
import {type WallType} from "../events/CollisionEvent.ts";

/**
 * Scene
 *
 * Defines geometry (size of screen) and options  has multiple Objects
 *   has multiple ObjectViews
 *     each ObjectView is responsible for rendering an object in the scene.
 *     each ObjectView has a Model that is responsible for the Object's behavior.
 */
export default class Scene {
  options: SceneOptions;
  objectViews: SpaceObjectView[];
  boundingBox: BoundingBox;

  constructor(options: SceneOptions, objectViews?: SpaceObjectView[]) {
    this.options = options;
    this.objectViews = objectViews || [] as SpaceObjectView[];
    this.boundingBox = new BoundingBox({
      ...this.dimensions,
      x: -(this.dimensions.width/2),
      y: -(this.dimensions.height/2)
    })
  }

  * [Symbol.iterator]() {
    for (let ov of this.objectViews) {
      yield ov;
    }
  }

  get dimensions() {
    return this.options.dimensions || { width: 1000, height: 1000 };
  }

  get showGrid() {
    if (typeof this.options.showGrid !== "undefined") {
      return this.options.showGrid;
    }
    return false;
  }

  get roundScreen() {
    if (typeof this.options.roundScreen !== "undefined") {
      return this.options.roundScreen;
    }
    return false;
  }

  setObjects(objects: SpaceObjectView[]) {
    this.objectViews = objects;
  }

  addObject(object: SpaceObjectView) {
    this.objectViews.push(object);
  }

  collidesWith(ov: SpaceObjectView) {
    for (const oov of this.objectViews) {
      if (oov === ov) {
        continue;
      }
      if (oov.isCollision(ov)) {
        return oov;
      }
    }
  }

  wallIntersection(ov: SpaceObjectView): WallType | false {
    const obox = ov.boundingBox();
    if (obox.top <= this.boundingBox.top) {
      return 'north'
    }
    if (obox.right >= this.boundingBox.right) {
      return 'east';
    }
    if (obox.bottom >= this.boundingBox.bottom) {
      return 'south';
    }
    if (obox.left <= this.boundingBox.left) {
      return 'west';
    }
    return false;
  }
}

export interface SceneOptions {
  dimensions: { width: number; height: number };
  showGrid?: boolean;
  roundScreen?: boolean;
}
