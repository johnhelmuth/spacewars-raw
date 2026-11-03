import type {SpaceObjectView} from "../views/SpaceObjectView.ts";
import {BoundingBox} from "../types/geometry.ts";
import {type WallType} from "../events/CollisionEvent.ts";

/**
 * Scene
 *
 * Defines geometry (size of screen) and options
 *   has multiple ObjectViews
 *     each ObjectView is responsible for rendering an object in the scene.
 *     each ObjectView has a Model that is responsible for the Object's behavior.
 */
export default class Scene extends EventTarget {
  options: SceneOptions;
  objectViews: SpaceObjectView[] = [];
  boundingBox: BoundingBox;
  objectScaleWidth: number;
  objectScaleHeight: number;
  scaledBoundingBox?: BoundingBox;

  constructor(options: SceneOptions, objectViews?: SpaceObjectView[]) {
    super();
    this.options = options;
    this.setObjects(objectViews || [] as SpaceObjectView[]);
    this.boundingBox = new BoundingBox({
      ...this.dimensions,
      x: -(this.dimensions.width/2),
      y: -(this.dimensions.height/2)
    })

    this.objectScaleWidth = (this.options.dimensions.width / 1000);
    this.objectScaleHeight = (this.options.dimensions.width / 1000);
  }

  setScaledBoundingBox(scaledBoundingBox: BoundingBox) {
    this.scaledBoundingBox = scaledBoundingBox;
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

  get showVectors() {
    if (typeof this.options.showVectors !== "undefined") {
      return this.options.showVectors;
    }
    return false;
  }

  get roundScreen() {
    if (typeof this.options.roundScreen !== "undefined") {
      return this.options.roundScreen;
    }
    return false;
  }

  private setObjects(objects: SpaceObjectView[]) {
    objects.forEach(ov => this.addObject(ov));
  }

  addObject(ov: SpaceObjectView) {
    this.objectViews.push(ov);
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
    if (typeof this.scaledBoundingBox === "undefined") {
      return false;
    }
    const obox = ov.boundingBox();
    if (obox.top <= this.scaledBoundingBox.top) {
      return 'north'
    }
    if (obox.right >= this.scaledBoundingBox.right) {
      return 'east';
    }
    if (obox.bottom >= this.scaledBoundingBox.bottom) {
      return 'south';
    }
    if (obox.left <= this.scaledBoundingBox.left) {
      return 'west';
    }
    return false;
  }
}

export interface SceneOptions {
  dimensions: { width: number; height: number };
  showGrid?: boolean;
  roundScreen?: boolean;
  showVectors?: boolean;
}
