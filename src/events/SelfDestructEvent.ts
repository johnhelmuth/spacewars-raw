import type {SpaceObject} from "../models/SpaceObject.ts";
import type {SpaceObjectView} from "../views/SpaceObjectView.ts";

type SelfDestructEventProps = {
  object?: SpaceObject,
  objectView?: SpaceObjectView
};

export class SelfDestructEvent extends Event {

  object: SpaceObject;
  objectView: SpaceObjectView | undefined;

  constructor({object, objectView}: SelfDestructEventProps) {
    super('self-destruct');
    if (typeof object === 'undefined') {
      throw new Error('SelfDestructEvent constructor called with no "object" property.')
    }
    this.object = object;
    if (typeof objectView !== 'undefined') {
      this.objectView = objectView;
    }
  }

  clone(props?: SelfDestructEventProps) {
    const useProps = { object: this.object } as SelfDestructEventProps;
    if (typeof this.objectView !== 'undefined') {
      useProps.objectView = this.objectView;
    } else if (typeof props !== 'undefined' && typeof props.objectView !== 'undefined') {
      useProps.objectView = props.objectView;
    }
    return new SelfDestructEvent(useProps);
  }
}