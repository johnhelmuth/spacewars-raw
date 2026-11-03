import type PhysicsEngine from "./PhysicsEngine.ts";
import type Scene from "./Scene.ts";
import {TickEvent} from "../events/TickEvent.ts";
import {BoundingBox} from "../types/geometry.ts";

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
export default class World extends EventTarget {
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
      return {
        boundingBox: new BoundingBox({x, y, width, height}),
        scaledBoundingBox: new BoundingBox({ x: x*scale, y: y*scale, width: width * scale, height: height * scale}),
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
    console.log('World.step() called.')
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
    console.group('frameHandler()')
    const frameStartTime = performance.now();
    console.log('frameStartTime', frameStartTime);
    if (this.lastTickTime) {
      console.log('this.lastTickTime', this.lastTickTime);
      console.log('time since last frame start', frameStartTime - this.lastTickTime);
    }
    console.log('timestamp', timestamp);
    if (this.isRunning || this.isStepping) {
      console.log('Calling engine.tick()');
      this.engine.tick(this.scene, timestamp);
      console.log('Dispatching tick event ', timestamp);
      this.dispatchEvent(new TickEvent(timestamp));
      this.lastTickTime = timestamp;
      console.log('Calling render()');
      this.render(timestamp);
      console.log('frameHandler time', performance.now()-frameStartTime);
      if (this.isRunning) {
        this.waitForFrameToUpdate();
      } else {
        this.animationFrameRequestId = undefined;
        this.animationIsStepping = false;
      }
    }
    console.groupEnd();
  }

  cancelAnimationFrameRequest() {
    if (typeof this.animationFrameRequestId === 'number') {
      cancelAnimationFrame(this.animationFrameRequestId);
    }
    this.animationFrameRequestId = undefined;
  }

  render(timestamp?: DOMHighResTimeStamp) {
    console.log('render() timestamp: ', timestamp);
    const {x, y, width, height} = this.scene.boundingBox;
    const sceneSVG = [...this.scene]
        .map(ov => {
          return ov.render(!!this.scene.options.showVectors)
        })
        .join('\n');
    this.element.innerHTML = `
          <svg
              xmlns="http://www.w3.org/2000/svg"
              width="100%" height="100%"
              viewBox="${x} ${y} ${width} ${height}"
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

      const { x, y, x2, y2 } = scaledBoundingBox;

      const orientDotRadius = 20;
      const corners = [
        `<circle cx="${x+orientDotRadius}" cy="${y+orientDotRadius}" r="${orientDotRadius}" fill="red" />`,
        `<circle cx="${x2-orientDotRadius}" cy="${y+orientDotRadius}" r="${orientDotRadius}" fill="red" />`,
        `<circle cx="${x2-orientDotRadius}" cy="${y2-orientDotRadius}" r="${orientDotRadius}" fill="red" />`,
        `<circle cx="${x+orientDotRadius}" cy="${y2-orientDotRadius}" r="${orientDotRadius}" fill="red" />`,
        // `<rect x="${x+orientDotRadius}" y="${y+orientDotRadius}" width="${elBB.width*scale-orientDotRadius*2}" height="${elBB.height*scale-orientDotRadius*2}" stroke="blue" stroke-width="50" fill="transparent" />`,
      ]
      return corners.join('\n');

    }
    return '';
  }
}