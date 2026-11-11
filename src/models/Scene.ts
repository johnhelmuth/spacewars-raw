import {SpaceObjectView} from "../views/SpaceObjectView.ts";
import {BoundingBox, type Point, pointsToBoundingBox} from "../types/geometry.ts";
import {type WallType} from "../events/CollisionEvent.ts";
import {TorpedoTube} from "./Ship.ts";
import {TorpedoView} from "../views/TorpedoView.ts";
import {Torpedo} from "./Torpedo.ts";
import {TorpedoEvent} from "../events/TorpedoEvent.ts";
import {TorpedoSelfDestructEvent} from "../events/TorpedoSelfDestructEvent.ts";
import type SpaceObject from "./SpaceObject.ts";

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
  tubes = [] as TorpedoTube[];
  torpedoDestructHandler: (e: Event) => void;

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
    this.torpedoDestructHandler = this.handleTorpedoDestruct.bind(this);
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

  removeObject(ov: SpaceObjectView | SpaceObject) {
    let idx = undefined as number | undefined;
    if (ov instanceof SpaceObjectView) {
      idx = this.objectViews.indexOf(ov);
    } else { /* It's a SpaceObject, find the matching SpaceObjectView */
      idx = this.objectViews.findIndex(search => search.object === ov);
    }
    if (idx >= 0) {
      this.objectViews.splice(idx, 1);
    }
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

  wallIntersection(corners: Point[], nextPosition: Point): WallType | false {
    if (typeof this.scaledBoundingBox === "undefined") {
      return false;
    }
    if (this.scaledBoundingBox.containsAllPoints(corners)) {
      return false;
    }
    const obox = pointsToBoundingBox(corners);
    if (obox.top < this.scaledBoundingBox.top && nextPosition.y < this.scaledBoundingBox.top) {
      return 'north'
    }
    if (obox.right > this.scaledBoundingBox.right && nextPosition.x > this.scaledBoundingBox.right) {
      return 'east';
    }
    if (obox.bottom > this.scaledBoundingBox.bottom && nextPosition.y > this.scaledBoundingBox.bottom) {
      return 'south';
    }
    if (obox.left < this.scaledBoundingBox.left && nextPosition.x < this.scaledBoundingBox.left) {
      return 'west';
    }
    return false;
  }

  setupTorpedoTubeListeners(tubes: TorpedoTube[]) {
    this.tubes = tubes;
    for (const t of this.tubes) {
      t.addEventListener('torpedo', this.handleTorpedo.bind(this));
    }
  }

  handleTorpedo(torpedoEvent:Event) {
    if (torpedoEvent instanceof TorpedoEvent) {
      if (typeof torpedoEvent.torpedo !== 'undefined') {
        this.createNewTorpedoView(torpedoEvent.torpedo);
        this.dispatchEvent(torpedoEvent.clone());
      }
    }
  }

  handleTorpedoDestruct(torpedoDestructEvent: Event) {
    if (torpedoDestructEvent instanceof TorpedoSelfDestructEvent) {
      if (typeof torpedoDestructEvent.torpedo !== 'undefined') {
        torpedoDestructEvent.torpedo.removeEventListener('torpedo-destruct', this.torpedoDestructHandler);
        this.removeObject(torpedoDestructEvent.torpedo);
        this.dispatchEvent(torpedoDestructEvent.clone());
      }
    }
  }

  createNewTorpedoView(t: Torpedo) {
    const { dimensions, showGrid } = this.options
    const tView = new TorpedoView(t, { dimensions, showGrid: !!showGrid });
    this.addObject(tView);
    t.addEventListener('torpedo-destruct', this.torpedoDestructHandler);
  }
}

export interface SceneOptions {
  dimensions: { width: number; height: number };
  edgeInset: number;
  showGrid?: boolean;
  roundScreen?: boolean;
  showVectors?: boolean;
}
