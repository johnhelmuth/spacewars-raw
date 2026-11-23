import './style.css'
import {SpaceObjectView} from "./views/SpaceObjectView.ts";
import {Ship1View} from "./views/Ship1View.ts";
import {Ship2View} from "./views/Ship2View.ts";
import Scene from "./models/Scene.ts";
import WorldView from "./views/WorldView.ts";
import {SpaceObject} from "./models/SpaceObject.ts";
import {Drive, Ship} from "./models/Ship.ts";
import {roundTo, Velocity} from "./types/geometry.ts";
import {RemoveObjectEvent} from "./events/RemoveObjectEvent.ts";
import {Star} from "./models/Star.ts";
import {StarView} from "./views/StarView.ts";

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
const dimensions = {width: 2500, height: 2500};
const showGrid = false;
const sceneOptions = {
  dimensions,
  edgeInset: -16,
  showGrid,
  roundScreen: true,
};

const viewOptions = {
  dimensions,
  showGrid,
}

const drive1 = new Drive(9.8, false);
const ship1 = new Ship('ship-1', {x: -600, y: 0}, 0, new Velocity(0, 0), drive1);
const ship1View = new Ship1View(ship1, viewOptions);
const drive2 = new Drive(9.8, false);
const ship2 = new Ship('ship-2', {x: 600, y: 0}, 180, new Velocity(0, 0), drive2);
const ship2View = new Ship2View(ship2, viewOptions);
const star = new Star();
const starView = new StarView(star, viewOptions);

const scene = new Scene(sceneOptions,
  [
    ship1View,
    ship2View,
    starView,
  ]
);

const world = new WorldView(scene, screenEl);

// @ts-ignore
window.spacewar = {
  world
}

// world.addEventListener('collision', (e: Event) => {
//   if (e instanceof CollisionEvent) {
//     if (userMsgCollisions) {
//       const collidedWith = typeof e.collidedWith === 'string' ? e.collidedWith : e.collidedWith.object.name;
//       userMsgCollisions.textContent = `Collision with ${collidedWith}`;
//       setTimeout(() => userMsgCollisions.textContent = '', 3000);
//     }
//   }
// })
//
// const MAX_TORPEDO_MSGS = 10;
// function addTorpedoMessage(msg: string) {
//   if (userMsgTorpedos) {
//     const numEls = userMsgTorpedos.children.length;
//     const liEl = document.createElement('li');
//     liEl.innerText = msg;
//     if (numEls >= MAX_TORPEDO_MSGS) {
//       userMsgTorpedos.children[0].remove();
//     }
//     userMsgTorpedos.appendChild(liEl);
//     liEl.scrollIntoView({block: 'end', behavior: 'smooth'})
//   }
// }
// scene.addEventListener('torpedo', (e: Event) => {
//   if (e instanceof TorpedoEvent) {
//     addTorpedoMessage(`${e.torpedo.name} fired.`);
//   }
// })
// scene.addEventListener('self-destruct', (e: Event) => {
//   if (e instanceof SelfDestructEvent) {
//     if (e.object instanceof Torpedo) {
//       addTorpedoMessage(`${e.object.name} destroyed itself.`);
//     }
//   }
// })

// Handle ship being destroyed by removing object listeners (updates and removals) and turning off key bindings.
scene.addEventListener('removeObject', (e: Event) => {
  if (e instanceof RemoveObjectEvent) {
    const ov = e.objView;
    console.log(`Scene removeObject event received in main.ts ship controller for ${ov.object.name}`, e);
    const updateHandler = controlsSetupMap.get(ov);
    if (typeof updateHandler !== 'undefined') {
      ov.object.removeEventListener('updated', updateHandler);
    }
    if (shipsControlStatus.has(ov.object)) {
      shipsControlStatus.set(ov.object, false);
    }
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
const ship1UpdateHandler = setupControls(ship1Controls, ship1View);
const ship2UpdateHandler = setupControls(ship2Controls, ship2View);

const controlsSetupMap = new Map<SpaceObjectView, ReturnType<typeof setupControls>>([
    [ship1View, ship1UpdateHandler],
    [ship2View, ship2UpdateHandler]
]);

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

function createShipsControlStatus() {
  const shipsControlStatus = new Map<SpaceObject, boolean>();
  for (const [, shipCtlData] of shipsCtlKeyMap) {
    shipsControlStatus.set(shipCtlData.ship, true);
  }
  return shipsControlStatus;
}

const shipsControlStatus = createShipsControlStatus();

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
  if (shipsControlStatus.has(binding.ship) && shipsControlStatus.get(binding.ship)) {
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

  const positionXControl = controlBlock.querySelector<HTMLElement>('.position-x');
  if (!positionXControl) {
    throw new Error(`${objectId} position X control not available!`);
  }
  const positionYControl = controlBlock.querySelector<HTMLElement>('.position-y');
  if (!positionYControl) {
    throw new Error(`${objectId} position Y control not available!`);
  }
  const facingControl = controlBlock.querySelector<HTMLElement>('.ship-facing');
  if (!facingControl) {
    throw new Error(`${objectId} facing control not available!`);
  }

  const velocityMagnitudeControl = controlBlock.querySelector<HTMLElement>('.ship-velocity-magnitude');
  if (!velocityMagnitudeControl) {
    throw new Error(`${objectId} velocity magnitude control not available!`);
  }

  const velocityDirectionControl = controlBlock.querySelector<HTMLElement>('.ship-velocity-direction');
  if (!velocityDirectionControl) {
    throw new Error(`${objectId} velocity direction control not available!`);
  }

  const driveStatusEl = controlBlock.querySelector<HTMLElement>('.engine-state');
  if (!driveStatusEl) {
    throw new Error(`${objectId} drive status control not available!`);
  }

  // Update the display for the ship based on the ship object. Called when an updated event is received.
  const updateObjectControls = () => {
    positionXControl.innerText = roundTo(ov.object.position.x,1).toString();
    positionYControl.innerText = roundTo(ov.object.position.y,1).toString();
    facingControl.innerText = roundTo(ov.object.facing,2).toString();
    velocityMagnitudeControl.innerText = roundTo(ov.object.velocity.magnitude,2).toString();
    velocityDirectionControl.innerText = roundTo(ov.object.velocity.direction,2).toString();
    if (ov.object instanceof Ship) {
      driveStatusEl.innerText = ov.object.engineStatus() ? 'on' : 'off';
    }
  }
  updateObjectControls();

  ov.addEventListener('updated', updateObjectControls)
  return updateObjectControls
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
