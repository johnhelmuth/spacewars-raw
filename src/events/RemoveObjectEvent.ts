import type {SpaceObjectView} from "../views/SpaceObjectView.ts";

export class RemoveObjectEvent extends Event {

  objView : SpaceObjectView

  constructor(ov: SpaceObjectView) {
    super('removeObject');
    this.objView = ov;
  }

  clone() {
    return new RemoveObjectEvent(this.objView);
  }
}