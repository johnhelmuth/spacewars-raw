import {Star, type StarParamsType} from "./Star.ts";
import {Torpedo, type TorpedoParamsType} from "./Torpedo.ts";
import {Ship, type ShipParamsType} from "./Ship.ts";
import type {ObjectSpec} from "./Scene.ts";
import {SpaceObjectViewFactory} from "../views/SpaceObjectViewFactory.ts";
import type {SpaceObject} from "./SpaceObject.ts";

export type AnySpaceObjectParamsType = ShipParamsType | StarParamsType | TorpedoParamsType;

export type SpaceObjectNameType = 'ship' | 'torpedo' | 'star';
export type SpaceObjectConstructors = Ship | Torpedo | Star;

export class SpaceObjectFactory {

  viewFactory: SpaceObjectViewFactory;

  constructor(viewFactory: SpaceObjectViewFactory) {
    this.viewFactory = viewFactory;
  }

  getSpaceObject(objectSpec: ObjectSpec) {
    const { objectName, params, viewName } = objectSpec;
    let obj: SpaceObjectConstructors;
    switch (objectName) {
      case 'ship':
        obj = new Ship(params as ShipParamsType);
        break;
      case 'star':
        obj = new Star();
        break;
      case 'torpedo':
        obj = new Torpedo(params as TorpedoParamsType)
        break;
      default:
        throw new Error(`SpaceObjectFactory.getSpaceObject() unknown objectSelector ${objectName}`);
    }
    obj.view = this.viewFactory.getSpaceObjectView(obj as SpaceObject, viewName);

    return obj as SpaceObject;
  }
}
