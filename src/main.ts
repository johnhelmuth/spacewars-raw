import './style.css'
import {Ship1View} from "./views/Ship1View.ts";
import {Ship2View} from "./views/Ship2View.ts";
import Scene from "./models/Scene.ts";
import PhysicsEngine from "./models/PhysicsEngine.ts";
import World from "./models/World.ts";
import {Ship} from "./models/Ship.ts";
import type {SpaceObjectViewInterface} from "./views/SpaceObjectView.ts";
import {CollisionEvent} from "./events/CollisionEvent.ts";
import {Vector} from "./types/geometry.ts";

const screenEl = document.querySelector<HTMLElement>('#screen');
if (! screenEl) {
  throw new Error('ScreenEl not found!');
}
const startStopButton = document.querySelector<HTMLElement>('#start-stop-button');
if (! startStopButton) {
  throw new Error('Start stop button is missing!');
}

const ship1Controls = document.querySelector<HTMLElement>('#ship-1-controls');
if (! ship1Controls) {
  throw new Error('Ship 1 controls are missing!');
}

const ship2Controls = document.querySelector<HTMLElement>('#ship-2-controls');
if (! ship2Controls) {
  throw new Error('Ship 2 controls are missing!');
}

const showGridControl = document.querySelector<HTMLInputElement>('#show-grid');
if (! showGridControl) {
  throw new Error('Show grid control is missing!');
}

const roundScreenControl = document.querySelector<HTMLInputElement>('#round-screen');
if (! roundScreenControl) {
  throw new Error('Round screen control is missing!');
}

const ship1 = new Ship('ship 1', { x: 76, y: 12 }, 315, new Vector({ x: 0, y: 0}));
const ship1View = new Ship1View(ship1);

const ship2 = new Ship('ship 2', { x: 76, y: -116 }, 45, new Vector({ x: 0, y: 0}));
const ship2View = new Ship2View(ship2);

const scene = new Scene({dimensions: { width: 1000, height: 1000 }, showGrid: true, roundScreen: true}, [ship1View, ship2View]);

const engine = new PhysicsEngine();
const world = new World(scene, engine, screenEl);

world.render();

engine.addEventListener('collision', (e: Event) => {
  if (e instanceof CollisionEvent) {
    console.log('collision happened. collidedWith: ', e.collidedWith);
  }
})
startStopButton.addEventListener('click', () => {
  if (world.isRunning) {
    world.stop();
    startStopButton.innerText = 'Start';
  } else {
    world.start();
    startStopButton.innerText = 'Stop';
  }
})

setupControls(ship1Controls, ship1View);
setupControls(ship2Controls, ship2View);

showGridControl.checked = scene.showGrid;
showGridControl.addEventListener('change', (e: Event) => {
  const target = e.target as HTMLInputElement;
  if (target) {
    scene.options.showGrid = target.checked;
    world.render();
  }
})

roundScreenControl.checked = scene.roundScreen;
updateRoundScreen();
roundScreenControl.addEventListener('change', (e: Event) => {
  const target = e.target as HTMLInputElement;
  if (target) {
    scene.options.roundScreen = target.checked;
    updateRoundScreen();
  }
})

function setupControls(controlBlock: HTMLElement, ov: SpaceObjectViewInterface) {
  const objectId = controlBlock.dataset.objectId;
  const positionControl = controlBlock.querySelector<HTMLFormElement>('.ship-position');
  if (! positionControl) {
    throw new Error(`${objectId} position control not available!`);
  }
  positionControl.value = `${ov.object.position.x},${ov.object.position.y}`;
  world.addEventListener('tick', () => {
    positionControl.value = `${ov.object.position.x},${ov.object.position.y}`;
  })
  positionControl.addEventListener('change', () => {
    const values = positionControl.value.split(',');
    if (values.length === 2) {
      const x = parseInt(values[0], 10);
      if (! Number.isNaN(x)) {
        const y = parseInt(values[1], 10);
        if (! Number.isNaN(y)) {
          ov.object.position = {
            x, y
          }
          world.render();
        }
      }
    }
  })

  const facingControl = controlBlock.querySelector<HTMLFormElement>('.ship-facing');
  if (! facingControl) {
    throw new Error(`${objectId} facing control not available!`);
  }
  facingControl.value = ov.object.facing.toString();
  world.addEventListener('tick', () => {
    facingControl.value = ov.object.facing.toString();
  })
  facingControl.addEventListener('change', () => {
    const facing = parseInt(facingControl.value, 10);
    if (! Number.isNaN(facing)) {
      ov.object.facing = facing;
      ov.object.velocity.direction = facing;
      world.render();
    }
  })

  const engineControl = controlBlock.querySelector<HTMLFormElement>('.ship-engine');
  if (! engineControl) {
    throw new Error(`${objectId} engine control not available!`);
  }
  const engineStatusEl = controlBlock.querySelector<HTMLElement>('.engine-state');
  engineControl.addEventListener('click', () => {
    console.log(`${objectId} Engine clicked!`);
    if (ov.object.isShip(ov.object)) {
      ov.object.toggleDrive();
      if (engineStatusEl) {
        engineStatusEl.innerText = (ov.object.drive.engineOn) ? 'on' : 'off';
        console.log(`${objectId} acceleration is ${ov.object.acceleration}`);
        console.log(`${objectId} facing is ${ov.object.facing}`);
      }
    }
  })
}

function updateRoundScreen() {
  if (screenEl) {
    if (scene.roundScreen) {
      screenEl.classList.add('round-screen');
    } else {
      screenEl.classList.remove('round-screen');
    }
  }
}