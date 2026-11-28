import {type SpaceObjectViewOptions} from "./SpaceObjectView.ts";
import type {SpaceObject} from "../models/SpaceObject.ts";
import {TorpedoView} from "./TorpedoView.ts";
import {Ship2View} from "./Ship2View.ts";
import {Ship1View} from "./Ship1View.ts";
import {StarView} from "./StarView.ts";


const ViewNameToViewClassMap = {
  'ship-1-view': Ship1View,
  'ship-2-view': Ship2View,
  'star-view': StarView,
  'torpedo-view': TorpedoView,
}
export type SpaceObjectViewNameType = keyof typeof ViewNameToViewClassMap;

export type SpaceObjectViewSelectorType = {
  object: SpaceObject;
  viewName: SpaceObjectViewNameType
}
export class SpaceObjectViewFactory {
  objectViewOptions: SpaceObjectViewOptions;

  constructor(objectViewOptions: SpaceObjectViewOptions) {
    this.objectViewOptions = objectViewOptions;
  }

  getSpaceObjectView(object: SpaceObject, viewName: SpaceObjectViewNameType) {
    const ctor = ViewNameToViewClassMap[viewName];
    return new ctor(object, this.objectViewOptions);
  }
}
