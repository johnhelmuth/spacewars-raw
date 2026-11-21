import {BoundingBox} from "../types/geometry.ts";
import {SpaceObject} from "./SpaceObject.ts";
import {SpaceObjectView} from "../views/SpaceObjectView.ts";
import {Torpedo} from "./Torpedo.ts";
import {TorpedoView} from "../views/TorpedoView.ts";
import {TorpedoEvent} from "../events/TorpedoEvent.ts";
import {RemoveObjectEvent} from "../events/RemoveObjectEvent.ts";
import {SelfDestructEvent} from "../events/SelfDestructEvent.ts";

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

  private setObjects(objects: SpaceObjectView[]) {
    objects.forEach(ov => this.addObject(ov));
  }

  addObject(ov: SpaceObjectView) {
    this.setupObjectListeners(ov);
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
      const ov = this.objectViews[idx];
      this.removeObjectListeners(ov);
      this.objectViews.splice(idx, 1);
    }
  }

  handleRemoveObjectEvent = (e: Event)=> {
    if (e instanceof RemoveObjectEvent) {
      this.removeObject(e.objView);
      this.dispatchEvent(e.clone())
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

  setupObjectListeners(ov: SpaceObjectView) {
    ov.addEventListener('removeObject', this.handleRemoveObjectEvent);
    ov.addEventListener('torpedo', this.handleTorpedo);
    ov.addEventListener('self-destruct', this.handleSelfDestruct);
  }

  removeObjectListeners(ov: SpaceObjectView) {
    ov.removeEventListener('removeObject', this.handleRemoveObjectEvent);
    ov.removeEventListener('torpedo', this.handleTorpedo);
    ov.removeEventListener('self-destruct', this.handleSelfDestruct);
  }

  handleTorpedo = (torpedoEvent:Event) => {
    if (torpedoEvent instanceof TorpedoEvent) {
      if (typeof torpedoEvent.torpedo !== 'undefined') {
        this.createNewTorpedoView(torpedoEvent.torpedo);
        this.dispatchEvent(torpedoEvent.clone());
      }
    }
  }

  handleSelfDestruct = (e: Event)=> {
    if (e instanceof SelfDestructEvent) {
      const { object, objectView } = e;
      this.dispatchEvent(e.clone({ object, objectView }));
    }
  }

  createNewTorpedoView(t: Torpedo) {
    const { dimensions, showGrid } = this.options
    const tView = new TorpedoView(t, { dimensions, showGrid: !!showGrid });
    this.addObject(tView);
  }
}

export interface SceneOptions {
  dimensions: { width: number; height: number };
  edgeInset: number;
  showGrid?: boolean;
  roundScreen?: boolean;
}
