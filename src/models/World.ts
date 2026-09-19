
import type PhysicsEngine from "./PhysicsEngine.ts";
import type Scene from "./Scene.ts";

export const TICK_MS = 10;
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

  tickInterval: number | null = null;

  constructor(scene: Scene, engine: PhysicsEngine, element: HTMLElement) {
    super();
    this.scene = scene;
    this.engine = engine;
    this.element = element;
  }

  get isRunning() {
    return !! this.tickInterval;
  }

  start() {
    if (! this.tickInterval) {
      this.tickInterval = setInterval(() => {
        this.tick();
      }, TICK_MS);
    }
  }

  stop() {
    if (this.tickInterval) {
      clearInterval(this.tickInterval);
      this.tickInterval = null;
    }
  }

  tick() {
    this.engine.tick(this.scene);
    this.dispatchEvent(new Event('tick'))
    this.render();
  }

  grid() {

    if (! this.scene.showGrid) {
      return '';
    }
    const {x, y, width, height} = this.scene.boundingBox;
    const xStep = 64; // (width) / 10;
    const yStep = 64; // (height) / 10;
    const gridElements =
        [
      //
      '<circle cx="-500" cy="-500" r="5" fill="red" />',
      '<text x="-500" y="-472" fill="grey">(-500,-500)</text>',
      '<circle cx="0" cy="-500" r="5" fill="red" />',
      '<text x="-32" y="-472" fill="grey">(0,-500)</text>',
      '<circle cx="500" cy="-500" r="5" fill="red" />',
      '<text x="410" y="-472" fill="grey">(500,-500)</text>',

      '<circle cx="-500" cy="0" r="5" fill="red" />',
      '<text x="-490" y="28" fill="grey">(-500,0)</text>',
      '<circle cx="0" cy="0" r="5" fill="red" />',
      '<text x="-16" y="28" fill="grey">(0,0)</text>',
      '<circle cx="500" cy="0" r="5" fill="red" />',
      '<text x="410" y="28" fill="grey">(500,0)</text>',

      '<circle cx="-500" cy="500" r="5" fill="red" />',
      '<text x="-490" y="472" fill="grey">(-500,500)</text>',
      '<circle cx="0" cy="500" r="5" fill="red" />',
      '<text x="-32" y="472" fill="grey">(0,500)</text>',
      '<circle cx="500" cy="500" r="5" fill="red" />',
      '<text x="410" y="472" fill="grey">(500,500)</text>',

    ] as string[];

    for (let xi = 0 ; xi < width / xStep; xi++) {
      const dx = -12 + xi * xStep;
      for (let yi = 1 ; yi < height / xStep; yi++) {
        const dy = -12 + yi * yStep;
        gridElements.push(`<circle cx="${x+dx}" cy="${y+dy}" r="1" fill="grey" />`)
      }
    }
    return `<g>${gridElements.join('\n')}</g>`;
  }

  render() {
    const {x, y, width, height} = this.scene.boundingBox;
    const sceneHTML = [...this.scene]
        .map(ov => ov.render())
        .join('\n');
    const innerHTML = `
          <svg
              xmlns="http://www.w3.org/2000/svg"
              width="100%" height="100%"
              viewBox="${x} ${y} ${width} ${height}"
              preserveAspectRatio="xMidYMid meet"
          >
            ${sceneHTML}
            ${this.grid()}
          </svg>
    `;
    this.element.innerHTML = innerHTML;
  }

}