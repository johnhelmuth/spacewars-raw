import {SpaceObjectView, type SpaceObjectViewOptions} from "./SpaceObjectView.ts";
import {SpaceObject} from "../models/SpaceObject.ts";

const RADIUS = 32;
export class StarView extends SpaceObjectView {

  constructor(object: SpaceObject, options: SpaceObjectViewOptions) {
    super(object, options);
    this.vertices = [
      { x: -RADIUS, y: -RADIUS },
      { x: RADIUS, y: RADIUS },
    ];
  }

  defs() {
    return `
      <defs>        
        <animateTransform xlink:href="#star-1"
            attributeName="transform"
            type="rotate"
            from="360 0 0"
            to="0 0 0"
            dur="1.3s"
            repeatCount="indefinite"
            fill="freeze"
        />
        <animateTransform xlink:href="#star-2"
            attributeName="transform"
            type="rotate"
            from="0 0 0"
            to="360 0 0"
            dur="1.9s"
            repeatCount="indefinite"
            fill="freeze"
        />
        <animateTransform xlink:href="#star-3"
            attributeName="transform"
            type="rotate"
            from="360 0 0"
            to="0 0 0"
            dur="2.3s"
            repeatCount="indefinite"
            fill="freeze"
        />
        <animateTransform xlink:href="#star-4"
            attributeName="transform"
            type="rotate"
            from="0 0 0"
            to="360 0 0"
            dur="3.1s"
            repeatCount="indefinite"
            fill="freeze"
        />
        <radialGradient id="sunGradient">
          <stop offset="0%" stop-color="#fff" />
          <stop offset="80%" stop-color="#888" />
          <stop offset="90%" stop-color="#555" />
          <stop offset="100%" stop-color="#222"/>
        </radialGradient>
      </defs>
    `
  }

  shape() {
    return this.defs() + `
      <g>
        <path id="star-1" d="${this.inscribedPolystarPath(RADIUS, 5)}" stroke="#fff" stroke-width="2" stroke-dasharray="1 4" fill="transparent" /> 
        <path id="star-2" d="${this.inscribedPolystarPath(RADIUS, 7)}" stroke="#fff" stroke-width="2" stroke-dasharray="1 5" fill="transparent" /> 
        <path id="star-3" d="${this.inscribedPolystarPath(RADIUS, 11)}" stroke="#fff" stroke-width="2" stroke-dasharray="1 4" fill="transparent" /> 
        <path id="star-4" d="${this.inscribedPolystarPath(RADIUS, 13)}" stroke="#fff" stroke-width="2" stroke-dasharray="1 5" fill="transparent" />
        <circle id="circle-dots" cx="0" cy="0" r="${RADIUS*.68}" fill="url(#sunGradient)" stroke-width="0"/>
      </g> 
    `;
  }

  destroy() {}
}