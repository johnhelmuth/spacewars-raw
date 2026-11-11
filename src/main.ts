import './style.css'
import {Ship1View} from "./views/Ship1View.ts";
import {Ship2View} from "./views/Ship2View.ts";
import Scene from "./models/Scene.ts";
import PhysicsEngine from "./models/PhysicsEngine.ts";
import World from "./models/World.ts";
import {Drive, Ship, TorpedoTube} from "./models/Ship.ts";
import {SpaceObjectView} from "./views/SpaceObjectView.ts";
import {CollisionEvent} from "./events/CollisionEvent.ts";
import {Velocity} from "./types/geometry.ts";
import {TorpedoEvent} from "./events/TorpedoEvent.ts";
import {TorpedoSelfDestructEvent} from "./events/TorpedoSelfDestructEvent.ts";

const screenEl = document.querySelector<HTMLElement>('#screen');
if (!screenEl) {
  throw new Error('ScreenEl not found!');
}
const startStopButton = document.querySelector<HTMLElement>('#start-stop-button');
if (!startStopButton) {
  throw new Error('Start stop button is missing!');
}
const stepButton = document.querySelector<HTMLElement>('#step-button');
if (!stepButton) {
  throw new Error('Step button is missing!');
}

const roundScreenControl = document.querySelector<HTMLInputElement>('#round-screen');
if (!roundScreenControl) {
  throw new Error('Round screen control is missing!');
}

const ship1Controls = document.querySelector<HTMLElement>('#ship-1-controls');
if (!ship1Controls) {
  throw new Error('Ship 1 controls are missing!');
}

const ship2Controls = document.querySelector<HTMLElement>('#ship-2-controls');
if (!ship2Controls) {
  throw new Error('Ship 2 controls are missing!');
}

const userMessageDiv = document.querySelector<HTMLElement>('.user-messages');
if (!userMessageDiv) {
  throw new Error('User messages are missing!');
}
const userMsgTorpedos = userMessageDiv.querySelector<HTMLElement>('.torpedo-log');
if (!userMsgTorpedos) {
  throw new Error('Collision message space is missing!');
}
const userMsgCollisions = userMessageDiv.querySelector<HTMLElement>('.collisions');
if (!userMsgCollisions) {
  throw new Error('Collision message space is missing!');
}
const dimensions = {width: 1000, height: 1000};
const showGrid = true;
const sceneOptions = {
  dimensions,
  edgeInset: -16,
  showGrid,
  roundScreen: false,
  showVectors: false,
};

const viewOptions = {
  dimensions,
  showGrid,
}

const drive1 = new Drive(9.8, false);
const tube1 = new TorpedoTube();
const ship1 = new Ship('ship-1', {x: 0, y: 0}, 0, new Velocity(0, 0), drive1, tube1);
const ship1View = new Ship1View(ship1, viewOptions);
const drive2 = new Drive(9.8, false);
const tube2 = new TorpedoTube();
const ship2 = new Ship('ship-2', {x: 350, y: -116}, 0, new Velocity(0, 0), drive2, tube2);
const ship2View = new Ship2View(ship2, viewOptions);

const scene = new Scene(sceneOptions,
  [
    ship1View,
    ship2View,
  ]
);
scene.setupTorpedoTubeListeners([
  tube1,
]);

const engine = new PhysicsEngine();
const world = new World(scene, engine, screenEl);

engine.addEventListener('collision', (e: Event) => {
  if (e instanceof CollisionEvent) {
    if (userMsgCollisions) {
      const collidedWith = typeof e.collidedWith === 'string' ? e.collidedWith : e.collidedWith.object.name;
      userMsgCollisions.textContent = `Collision with ${collidedWith}`;
      setTimeout(() => userMsgCollisions.textContent = '', 3000);
    }
  }
})

const MAX_TORPEDO_MSGS = 10;
function addTorpedoMessage(msg: string) {
  if (userMsgTorpedos) {
    const numEls = userMsgTorpedos.children.length;
    const liEl = document.createElement('li');
    liEl.innerText = msg;
    if (numEls >= MAX_TORPEDO_MSGS) {
      userMsgTorpedos.children[0].remove();
    }
    userMsgTorpedos.appendChild(liEl);
    liEl.scrollIntoView({block: 'end', behavior: 'smooth'})
  }
}
scene.addEventListener('torpedo', (e: Event) => {
  if (e instanceof TorpedoEvent) {
    addTorpedoMessage(`${e.torpedo.name} fired.`);
  }
})
scene.addEventListener('torpedo-destruct', (e: Event) => {
  if (e instanceof TorpedoSelfDestructEvent) {
    addTorpedoMessage(`${e.torpedo.name} destroyed itself.`);
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

type ShipCtlKeyBinding = { ship: Ship, action: 'rotate-left' | 'rotate-right' | 'rotate-slow' | 'drive' | 'torpedo' };

const shipsCtlKeyMap = new Map<string, ShipCtlKeyBinding>([
  ["KeyA", {"ship": ship1, "action": "rotate-left"}],
  ["KeyD", {"ship": ship1, "action": "rotate-right"}],
  ["KeyS", {"ship": ship1, "action": "drive"}],
  ["KeyW", {"ship": ship1, "action": "torpedo"}],
  ["ShiftLeft", {"ship": ship1, "action": "rotate-slow"}],

  ["ArrowLeft", {"ship": ship2, "action": "rotate-left"}],
  ["ArrowRight", {"ship": ship2, "action": "rotate-right"}],
  ["ArrowDown", {"ship": ship2, "action": "drive"}],
  ["ArrowUp", {"ship": ship2, "action": "torpedo"}],
  ["ShiftRight", {"ship": ship2, "action": "rotate-slow"}],
]);

function convertKeyToControl(keyCode: string): ShipCtlKeyBinding | undefined {
  if (shipsCtlKeyMap.has(keyCode)) {
    return shipsCtlKeyMap.get(keyCode) as ShipCtlKeyBinding;
  }
}

document.addEventListener('keydown', (e: KeyboardEvent) => {
  const binding = convertKeyToControl(e.code);
  if (typeof binding === 'undefined') {
    return;
  }
  switch (binding.action) {
    case 'rotate-left':
      binding.ship.setRotateDirection('left');
      break;
    case 'rotate-right':
      binding.ship.setRotateDirection('right');
      break;
    case 'rotate-slow':
      binding.ship.setRotateFactor('slow');
      break;
    case "drive":
      binding.ship.switchDriveOn();
      break;
    case "torpedo":
      binding.ship.fireTorpedo();
      break;
  }
})

document.addEventListener('keyup', (e: KeyboardEvent) => {
  const binding = convertKeyToControl(e.code);
  if (typeof binding === 'undefined') {
    return;
  }
  switch (binding.action) {
    case 'rotate-left':
    case 'rotate-right':
      binding.ship.setRotateDirection('not');
      break;
    case 'rotate-slow':
      binding.ship.setRotateFactor('fast');
      break;
    case "drive":
      binding.ship.switchDriveOff();
      break;
  }
})

function setupControls(controlBlock: HTMLElement, ov: SpaceObjectView) {
  const objectId = controlBlock.dataset.objectId;

  const positionXControl = controlBlock.querySelector<HTMLInputElement>('.position-x');
  if (!positionXControl) {
    throw new Error(`${objectId} position X control not available!`);
  }
  const positionYControl = controlBlock.querySelector<HTMLInputElement>('.position-y');
  if (!positionYControl) {
    throw new Error(`${objectId} position Y control not available!`);
  }
  const facingControl = controlBlock.querySelector<HTMLFormElement>('.ship-facing');
  if (!facingControl) {
    throw new Error(`${objectId} facing control not available!`);
  }
  // const facingLeftControl = controlBlock.querySelector<HTMLFormElement>('.ship-rotate.rotate-left');
  // if (!facingLeftControl) {
  //   throw new Error(`${objectId} facing control left not available!`);
  // }
  // const facingRightControl = controlBlock.querySelector<HTMLFormElement>('.ship-rotate.rotate-right');
  // if (!facingRightControl) {
  //   throw new Error(`${objectId} facing control right not available!`);
  // }
  // const engineControl = controlBlock.querySelector<HTMLFormElement>('.ship-engine');
  // if (!engineControl) {
  //   throw new Error(`${objectId} engine control not available!`);
  // }

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

  // facingLeftControl.addEventListener('click', () => {
  //   if (ov.object.isShip()) {
  //     ov.object.rotateLeft();
  //   }
  // })
  // facingRightControl.addEventListener('click', () => {
  //   if (ov.object.isShip()) {
  //     ov.object.rotateRight();
  //   }
  // })

  const engineStatusEl = controlBlock.querySelector<HTMLElement>('.engine-state');
  // engineControl.addEventListener('click', () => {
  //   if (ov.object.isShip()) {
  //     ov.object.toggleDrive();
  //     if (engineStatusEl) {
  //       engineStatusEl.innerText = (ov.object.drive.engineOn) ? 'on' : 'off';
  //     }
  //   }
  // })

  velocityMagnitudeControl.value = `${ov.object.velocity.magnitude}`;
  velocityDirectionControl.value = `${ov.object.velocity.direction}`;

  ov.object.addEventListener('updated', () => {
    positionXControl.value = `${ov.object.position.x}`;
    positionYControl.value = `${ov.object.position.y}`;
    facingControl.value = ov.object.facing.toString();
    velocityMagnitudeControl.value = `${ov.object.velocity.magnitude}`;
    velocityDirectionControl.value = `${ov.object.velocity.direction}`;
    if (ov.object instanceof Ship && engineStatusEl instanceof HTMLElement) {
      engineStatusEl.innerText = ov.object.engineStatus() ? 'on' : 'off';
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
