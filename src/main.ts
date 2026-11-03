import './style.css'
import {Ship1View} from "./views/Ship1View.ts";
import {Ship2View} from "./views/Ship2View.ts";
import Scene from "./models/Scene.ts";
import PhysicsEngine from "./models/PhysicsEngine.ts";
import World from "./models/World.ts";
import {Drive, Ship} from "./models/Ship.ts";
import {SpaceObjectView} from "./views/SpaceObjectView.ts";
import {CollisionEvent} from "./events/CollisionEvent.ts";
import {Vector} from "./types/geometry.ts";
import type SpaceObject from "./models/SpaceObject.ts";

const screenEl = document.querySelector<HTMLElement>('#screen');
if (! screenEl) {
  throw new Error('ScreenEl not found!');
}
const startStopButton = document.querySelector<HTMLElement>('#start-stop-button');
if (! startStopButton) {
  throw new Error('Start stop button is missing!');
}
const stepButton = document.querySelector<HTMLElement>('#step-button');
if (! stepButton) {
  throw new Error('Step button is missing!');
}

const roundScreenControl = document.querySelector<HTMLInputElement>('#round-screen');
if (!roundScreenControl) {
  throw new Error('Round screen control is missing!');
}

const ship1Controls = document.querySelector<HTMLElement>('#ship-1-controls');
if (! ship1Controls) {
  throw new Error('Ship 1 controls are missing!');
}

const ship2Controls = document.querySelector<HTMLElement>('#ship-2-controls');
if (! ship2Controls) {
  throw new Error('Ship 2 controls are missing!');
}

const userMessageEl = document.querySelector<HTMLElement>('.user-messages');
if (! userMessageEl) {
  throw new Error('User messages are missing!');
}

const dimensions = {width: 1000, height: 1000};

const drive1 = new Drive(9.8, false);
const ship1 = new Ship('ship 1', {x: 0, y: 0}, 0, new Vector({x: 0, y: 0}), drive1);
const ship1View = new Ship1View(ship1, {dimensions});

const drive2 = new Drive(9.8, false);
const ship2 = new Ship('ship 2', { x: 76, y: -116 }, 90, new Vector({ x: 0, y: 0}), drive2);
const ship2View = new Ship2View(ship2, {dimensions});

const scene = new Scene(
    {
      dimensions,
      showGrid: false,
      roundScreen: false,
      showVectors: false,
    },
    [
      ship1View,
      ship2View
    ]
);

const engine = new PhysicsEngine();
const world = new World(scene, engine, screenEl);

engine.addEventListener('collision', (e: Event) => {
  if (e instanceof CollisionEvent) {
    console.log('collision happened. collidedWith: ', e.collidedWith);
    if (userMessageEl) {
      userMessageEl.textContent = `Collision`;
      setTimeout(() => userMessageEl.textContent = '', 3000);
    }
  }
})

world.addEventListener('tick', () => {

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
stepButton.addEventListener('click', () => {
  if (world.isRunning) {
    world.stop();
    startStopButton.innerText = 'Start';
  }
  world.step();
})

setupControls(ship1Controls, ship1View);
setupControls(ship2Controls, ship2View);

world.render();

roundScreenControl.checked = scene.roundScreen;
updateRoundScreen();
roundScreenControl.addEventListener('change', (e: Event) => {
  const target = e.target as HTMLInputElement;
  if (target) {
    scene.options.roundScreen = target.checked;
    updateRoundScreen();
  }
})

function setupControls(controlBlock: HTMLElement, ov: SpaceObjectView) {
  const objectId = controlBlock.dataset.objectId;

  const positionXControl = controlBlock.querySelector<HTMLInputElement>('.position-x');
  if (! positionXControl) {
    throw new Error(`${objectId} position X control not available!`);
  }
  const positionYControl = controlBlock.querySelector<HTMLInputElement>('.position-y');
  if (! positionYControl) {
    throw new Error(`${objectId} position Y control not available!`);
  }
  const facingControl = controlBlock.querySelector<HTMLFormElement>('.ship-facing');
  if (!facingControl) {
    throw new Error(`${objectId} facing control not available!`);
  }
  const facingLeftControl = controlBlock.querySelector<HTMLFormElement>('.ship-rotate.rotate-left');
  if (!facingLeftControl) {
    throw new Error(`${objectId} facing control left not available!`);
  }
  const facingRightControl = controlBlock.querySelector<HTMLFormElement>('.ship-rotate.rotate-right');
  if (!facingRightControl) {
    throw new Error(`${objectId} facing control right not available!`);
  }
  const engineControl = controlBlock.querySelector<HTMLFormElement>('.ship-engine');
  if (!engineControl) {
    throw new Error(`${objectId} engine control not available!`);
  }

  const velocityMagnitudeControl = controlBlock.querySelector<HTMLFormElement>('.ship-velocity-magnitude');
  if (!velocityMagnitudeControl) {
    throw new Error(`${objectId} velocity magnitude control not available!`);
  }

  const velocityDirectionControl = controlBlock.querySelector<HTMLFormElement>('.ship-velocity-direction');
  if (!velocityDirectionControl) {
    throw new Error(`${objectId} velocity direction control not available!`);
  }

  positionXControl.value = `${ov.object.position.x}`;
  positionYControl.value = `${ov.object.position.y}`;

  facingControl.value = ov.object.facing.toString();

  facingLeftControl.addEventListener('click', () => {
    if (ov.object.isShip()) {
      ov.object.rotateLeft();
    }
  })
  facingRightControl.addEventListener('click', () => {
    if (ov.object.isShip()) {
      ov.object.rotateRight();
    }
  })

  const engineStatusEl = controlBlock.querySelector<HTMLElement>('.engine-state');
  engineControl.addEventListener('click', () => {
    console.log(`${objectId} Engine clicked!`);
    if (ov.object.isShip()) {
      ov.object.toggleDrive();
      if (engineStatusEl) {
        engineStatusEl.innerText = (ov.object.drive.engineOn) ? 'on' : 'off';
        logObject(ov.object);
        console.log(`${objectId} facing is ${ov.object.facing}`);
        console.log(`${objectId} acceleration is ${ov.object.acceleration}`);
        console.log(`${objectId} velocity is ${ov.object.velocity}`);
      }
    }
  })

  velocityMagnitudeControl.value = `${ov.object.velocity.magnitude}`;
  velocityDirectionControl.value = `${ov.object.velocity.direction}`;

  ov.object.addEventListener('updated', () => {
    console.log(`${objectId} updated!`);
    positionXControl.value = `${ov.object.position.x}`;
    positionYControl.value = `${ov.object.position.y}`;
    facingControl.value = ov.object.facing.toString();
    velocityMagnitudeControl.value = `${ov.object.velocity.magnitude}`;
    velocityDirectionControl.value = `${ov.object.velocity.direction}`;
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

function logObject(o: SpaceObject) {
  console.group(`${o.name}`);
  console.log(`facing is ${o.facing}`);
  if (o.isShip()) {
    console.log(`engine is ${o.engineStatus() ? "on" : "off"}`);
    console.log(`acceleration is ${o.acceleration}`);
  }
  console.log(`velocity is ${o.velocity}`);
  console.groupEnd();
}