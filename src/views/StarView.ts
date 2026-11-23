import {SpaceObjectView, type SpaceObjectViewOptions} from "./SpaceObjectView.ts";
import {SpaceObject} from "../models/SpaceObject.ts";


export class StarView extends SpaceObjectView {

  constructor(object: SpaceObject, options: SpaceObjectViewOptions) {
    super(object, options);
    this.vertices = [
      // { x: -31, y: -31 },
      // { x: 31, y: 31 },
      { x: -64, y: -64 },
      { x: 64, y: 64 },
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
            result="turbulence" seed="200">
            <animate id="burningAnimate" attributeName="baseFrequency" values="0.05;.1;0.5;0" dur="10s" repeatCount="indefinite" />
          </feTurbulence>
          <feDisplacementMap
            in2="turbulence"
            in="SourceGraphic"
            scale="10"
            xChannelSelector="R"
            yChannelSelector="G" />
        </filter>
        
        <animateTransform xlink:href="#star-8"
            attributeName="transform"
            type="rotate"
            from="360 0 0"
            to="0 0 0"
            dur="0.3s"
            repeatCount="indefinite"
            fill="freeze"
        />
        <animateTransform xlink:href="#small-square"
            attributeName="transform"
            type="rotate"
            from="0 0 0"
            to="360 0 0"
            dur="0.7s"
            repeatCount="indefinite"
            fill="freeze"
        />
        <animateTransform xlink:href="#pentagon"
            attributeName="transform"
            type="rotate"
            from="360 0 0"
            to="0 0 0"
            dur="1.1s"
            repeatCount="indefinite"
            fill="freeze"
        />
        <animateTransform xlink:href="#triangle"
            attributeName="transform"
            type="rotate"
            from="0 0 0"
            to="360 0 0"
            dur="1.3s"
            repeatCount="indefinite"
            fill="freeze"
        />
        <animateTransform xlink:href="#square"
            attributeName="transform"
            type="rotate"
            from="360 0 0"
            to="0 0 0"
            dur="1.7s"
            repeatCount="indefinite"
            fill="freeze"
        />
      </defs>
    `
  }

  shape() {
    return this.defs() + `
      <g filter="url(#burning)">
        <path id="star-8" d="${this.inscribedPolystarPath(32, 8)}" stroke="#fff" stroke-dasharray="1 4" fill="transparent" /> 
        <path id="square" d="${this.inscribedSquarePath(32)}" stroke="#fff" stroke-dasharray="1 4" fill="transparent" />
        <path id="triangle" d="${this.inscribedTrianglePath(28)}" stroke="#fff" stroke-dasharray="1 4" fill="transparent" /> 
        <path id="pentagon" d="${this.inscribedPolygonPath(16, 5)}" stroke="#fff" stroke-dasharray="1 4" fill="transparent" /> 
        <path id="small-square" d="${this.inscribedSquarePath(12)}" stroke="#fff" stroke-dasharray="1 4" fill="transparent" />
      </g> 
    `;
  }

  destroy() {}
}