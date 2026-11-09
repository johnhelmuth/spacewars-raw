import type PhysicsEngine from "./PhysicsEngine.ts";
import type Scene from "./Scene.ts";
import {TickEvent} from "../events/TickEvent.ts";
import {BoundingBox} from "../types/geometry.ts";
import {Renderer} from "../views/Renderer.ts";

/**
 * World
 *
 * The World class includes the scene the objects in it, and runs the simulation.
 * options
 *   global behavior flags and metadata for the current world
 * scene
 *   defines geometry (size of screen) and options
 *   has multiple ObjectViews
 *     each ObjectView is responsible for rendering an object in the scene.
 *     each ObjectView has a Model that is responsible for the Object's behavior.
 * physics engine
 *   runs a loop that updates each model for the current time tick.
 *   handles collisions between models
 *   handles screen edges
 * world controller
 *   handles user controls and passes messages to the appropriate object
 *   handles messages from objects and the physics engine
 */
export default class World extends Renderer {
  scene: Scene;
  engine: PhysicsEngine;
  element: HTMLElement;

  animationRunning: boolean = false;
  animationIsStepping: boolean = false;
  needsUpdate: boolean = false;
  animationFrameRequestId: number | undefined;
  tickHandlerId: number | undefined;

  startTime: DOMHighResTimeStamp | undefined;
  lastTickTime: DOMHighResTimeStamp | undefined;

  constructor(scene: Scene, engine: PhysicsEngine, element: HTMLElement) {
    super();
    this.scene = scene;
    this.engine = engine;
    this.element = element;
    this.scene.setScaledBoundingBox(this.elementDimensions.scaledBoundingBox);
    this.setupObjectListeners();
  }

  get elementDimensions() {
    if (typeof this.element !== undefined) {
      const width = this.element.offsetWidth;
      const height = this.element.offsetHeight;

      const { width: sceneWidth, height: sceneHeight }
          = this.scene.boundingBox;

      const scaleX = sceneWidth / width;
      const scaleY = sceneHeight / height;

      const scale = (scaleY > scaleX) ? scaleY : scaleX;

      const x = -(width) / 2;
      const y = -(height) / 2;
      const insetAmount = this.scene.options.edgeInset;
      return {
        boundingBox: new BoundingBox({x, y, width, height}),
        scaledBoundingBox: new BoundingBox({
          x: x*scale + insetAmount,
          y: y*scale + insetAmount,
          width: width * scale - insetAmount * 2,
          height: height * scale - insetAmount * 2
        }),
        scaleX,
        scaleY,
        scale,
      };
    }
    const emptyBoundingBoxData = { x: 0, y: 0, width: 0, height: 0 }
    return {
      boundingBox: new BoundingBox(emptyBoundingBoxData),
      scaledBoundingBox: new BoundingBox(emptyBoundingBoxData),
      scaleX: 1,
      scaleY: 1,
      scale: 1
    };
  }

  setupObjectListeners() {
    for (const ov of this.scene) {
      ov.object.addEventListener('updated', this.handleObjectUpdated.bind(this));
    }
  }

  handleObjectUpdated() {
    this.needsUpdate = true;
    if (! this.isRunning) {
      /*
       * In this case, the animation frame handler isn't happening, so
       * just update the display.
       *
       */
      this.render();
    }
  }

  get isRunning() {
    return this.animationRunning;
  }

  start() {
    this.animationRunning = true;
    this.cancelAnimationFrameRequest();
    const timestamp = performance.now();
    if (typeof this.startTime === 'undefined') {
      this.startTime = timestamp;
    }
    this.waitForFrameToUpdate();
  }

  stop() {
    this.animationRunning = false;
    if (typeof this.tickHandlerId === 'number') {
      clearInterval(this.tickHandlerId);
      this.tickHandlerId = undefined;
    }
    if (typeof this.animationFrameRequestId === 'number') {
      cancelAnimationFrame(this.animationFrameRequestId);
      this.animationFrameRequestId = undefined;
    }
  }

  get isStepping() {
    return this.animationIsStepping;
  }

  step() {
    this.animationIsStepping = true;
    const timestamp = performance.now();
    if (typeof this.startTime === 'undefined') {
      this.startTime = timestamp;
    }
    this.waitForFrameToUpdate();
  }

  waitForFrameToUpdate() {
    this.animationFrameRequestId = requestAnimationFrame(this.frameHandler.bind(this));
  }

  frameHandler(timestamp: DOMHighResTimeStamp) {
    if (this.isRunning || this.isStepping) {
      this.engine.tick(this.scene, timestamp);
      this.dispatchEvent(new TickEvent(timestamp));
      this.lastTickTime = timestamp;
      this.render();
      if (this.isRunning) {
        this.waitForFrameToUpdate();
      } else {
        this.animationFrameRequestId = undefined;
        this.animationIsStepping = false;
      }
    }
  }

  cancelAnimationFrameRequest() {
    if (typeof this.animationFrameRequestId === 'number') {
      cancelAnimationFrame(this.animationFrameRequestId);
    }
    this.animationFrameRequestId = undefined;
  }

  render() {
    const sceneSVG = [...this.scene]
        .map(ov => {
          return ov.render(!!this.scene.options.showVectors)
        })
        .join('\n');
    this.element.innerHTML = `
          <svg
              xmlns="http://www.w3.org/2000/svg"
              width="100%" height="100%"
              viewBox="${this.bbToViewBox(this.scene.boundingBox)}"
              preserveAspectRatio="xMidYMid meet"
          >
            ${sceneSVG}
            ${this.grid()}
          </svg>
    `;
    this.needsUpdate = false;
  }

  grid() {
    if (! this.scene.showGrid) {
      return '';
    }

    const elDims = this.elementDimensions;
    if (typeof elDims !== 'undefined') {
      const { scaledBoundingBox } = elDims;

      const { x, y, x2, y2, width, height } = scaledBoundingBox;

      const dotRadius = 20;
      const corners = [
        `<rect x="${x}" y="${y}" width="${width}" height="${height}" stroke="blue" stroke-width="5" fill="transparent" />`,
        `<circle cx="${x}" cy="${y}" r="${dotRadius}" fill="red" />`,
        `<circle cx="${x2}" cy="${y}" r="${dotRadius}" fill="red" />`,
        `<circle cx="${x2}" cy="${y2}" r="${dotRadius}" fill="red" />`,
        `<circle cx="${x}" cy="${y2}" r="${dotRadius}" fill="red" />`,
      ]
      return corners.join('\n')
      + `<circle cx="0" cy="0" r="2" stroke="lightgrey" stroke-width="1" />
      <!--        <rect x="-32" y="-32" width="64" height="64" stroke="lightgrey" fill="none" />-->
        `
    }
    return '';
  }
}