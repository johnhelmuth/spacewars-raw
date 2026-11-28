import {BoundingBox} from "../types/geometry.ts";
import {SpaceObject} from "./SpaceObject.ts";
import {TorpedoEvent} from "../events/TorpedoEvent.ts";
import {RemoveObjectEvent} from "../events/RemoveObjectEvent.ts";
import {SelfDestructEvent} from "../events/SelfDestructEvent.ts";
import {SceneView} from "../views/SceneView.ts";
import {type SpaceObjectViewNameType} from "../views/SpaceObjectViewFactory.ts";
import {type AnySpaceObjectParamsType, SpaceObjectFactory, type SpaceObjectNameType} from "./SpaceObjectFactory.ts";

export type SceneControls = {
  screenEl: HTMLElement,
  startStopButton: HTMLElement,
  stepButton: HTMLElement
};

export type ObjectSpec = {
  objectName: SpaceObjectNameType,
  params: AnySpaceObjectParamsType,
  viewName: SpaceObjectViewNameType
}
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
  boundingBox: BoundingBox;
  objectScaleWidth: number;
  objectScaleHeight: number;

  sceneView: SceneView;
  sceneControls: SceneControls;

  objectFactory: SpaceObjectFactory;

  objects: SpaceObject[] = [];

  constructor(options: SceneOptions,
              objectSpecs = [] as ObjectSpec[],
              objectFactory: SpaceObjectFactory,
              sceneControls: SceneControls,
  ) {
    super();
    this.options = options;
    this.boundingBox = new BoundingBox({
      ...this.dimensions,
      x: -(this.dimensions.width/2),
      y: -(this.dimensions.height/2)
    })

    this.objectScaleWidth = (this.options.dimensions.width / 1000);
    this.objectScaleHeight = (this.options.dimensions.width / 1000);
    this.sceneControls = sceneControls;
    this.sceneView = new SceneView(this, sceneControls.screenEl);
    this.objectFactory = objectFactory;
    this.setObjects(objectSpecs || [] as ObjectSpec[]);
    this.setupSceneListeners();
  }

  getObjectByName(objName: string) {
    return this.objects.find(o => o.name === objName);
  }

  getObjectById(objId: string) {
    return this.objects.find(o => o.id === objId);
  }

  setupSceneListeners() {

    this.sceneControls.startStopButton.addEventListener('click', () => {
      if (this.sceneView.isRunning) {
        this.sceneView.stop();
        this.sceneControls.startStopButton.innerText = 'Start';
      } else {
        this.sceneView.start();
        this.sceneControls.startStopButton.innerText = 'Stop';
      }
    })
    this.sceneControls.stepButton.addEventListener('click', () => {
      if (this.sceneView.isRunning) {
        this.sceneView.stop();
        this.sceneControls.stepButton.innerText = 'Start';
      }
      this.sceneView.step();
    })
  }

  * [Symbol.iterator]() {
    for (let o of this.objects) {
      yield o;
    }
  }

  get sceneObjects() {
    return this.objects;
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

  private setObjects(objectSpecs: ObjectSpec[]) {
    objectSpecs.forEach(objectSpec => {
      this.addObject(this.objectFactory.getSpaceObject(objectSpec))
    });
  }

  addObject(o: SpaceObject) {
    this.setupObjectListeners(o);
    this.objects.push(o);
  }

  removeObject(o: SpaceObject) {
    const idx = this.objects.indexOf(o);
    if (idx >= 0) {
      this.removeObjectListeners(o);
      this.objects.splice(idx, 1);
    }
  }

  handleRemoveObjectEvent = (e: Event)=> {
    if (e instanceof RemoveObjectEvent) {
      this.removeObject(e.object);
      this.dispatchEvent(e.clone())
    }
  }

  collidesWith(o: SpaceObject) {
    for (const oo of this.objects) {
      if (oo === o) {
        continue;
      }
      if (oo.view.isCollision(o.view)) {
        return oo;
      }
    }
  }

  setupObjectListeners(o: SpaceObject) {
    o.addEventListener('removeObject', this.handleRemoveObjectEvent);
    o.addEventListener('torpedo', this.handleTorpedo);
    o.addEventListener('self-destruct', this.handleSelfDestruct);
  }

  removeObjectListeners(o: SpaceObject) {
    o.removeEventListener('removeObject', this.handleRemoveObjectEvent);
    o.removeEventListener('torpedo', this.handleTorpedo);
    o.removeEventListener('self-destruct', this.handleSelfDestruct);
  }

  handleTorpedo = (torpedoEvent:Event) => {
    if (torpedoEvent instanceof TorpedoEvent) {
      if (typeof torpedoEvent.torpedoSpec !== 'undefined') {
        const torpedo = this.objectFactory.getSpaceObject(torpedoEvent.torpedoSpec);
        this.addObject(torpedo);
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

  render() {
    this.sceneView.render();
  }
}

export interface SceneOptions {
  dimensions: { width: number; height: number };
  edgeInset: number;
  showGrid?: boolean;
  roundScreen?: boolean;
}
