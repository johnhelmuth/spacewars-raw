import {SpaceObjectView, type SpaceObjectViewOptions} from "./SpaceObjectView.ts";
import {SpaceObject} from "../models/SpaceObject.ts";


export class StarView extends SpaceObjectView {

  constructor(object: SpaceObject, options: SpaceObjectViewOptions) {
    super(object, options);
    this.vertices = [
      { x: -30, y: -30 },
      { x: 30, y: 30 },
    ];
  }

  defs() {
    return `
      <defs>
        <filter id="burning">
          <feTurbulence
            type="turbulence"
            baseFrequency="0.05"
            numOctaves="1"
            result="turbulence" seed="5">
            <animate id="burningAnimate" attributeName="baseFrequency" values="0;.1;0,0" from="0" to="100" dur="3s" repeatCount="indefinite" />
          </feTurbulence>
          <feDisplacementMap
            in2="turbulence"
            in="SourceGraphic"
            scale="5"
            xChannelSelector="R"
            yChannelSelector="G" />
        </filter>
      </defs>
    `
  }
  shape() {
    return this.defs() + `
      <circle cx="0" cy="0" r="28" fill="#8f8f8f" filter="url(#burning)"/>
      <circle cx="0" cy="0" r="25" fill="#9f9f9f" filter="url(#burning)"/>
      <circle cx="0" cy="0" r="20" fill="#dfdfdf" filter="url(#burning)"/>
      <circle cx="0" cy="0" r="15" fill="#efefef" filter="url(#burning)"/>
      <circle cx="0" cy="0" r="10" fill="#fff" filter="url(#burning)"/>
    `;
  }

  destroy() {}
}