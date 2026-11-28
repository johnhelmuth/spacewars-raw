import './style.css'
import Scene, {type ObjectSpec, type SceneOptions} from "./models/Scene.ts";
import {Ship} from "./models/Ship.ts";
import {roundTo} from "./types/geometry.ts";
import {RemoveObjectEvent} from "./events/RemoveObjectEvent.ts";
import {SpaceObjectViewFactory} from "./views/SpaceObjectViewFactory.ts";
import {SpaceObjectFactory} from "./models/SpaceObjectFactory.ts";

const universeSize = 2000;
const dimensions = {width: universeSize, height: universeSize};
const showGrid = false;
const sceneOptions = {
  dimensions,
  edgeInset: -16,
  showGrid,
  roundScreen: false,
};

const objectDefinitions =
    [
      {
        objectName: 'ship',
        params: {
          name: 'ship-1',
          position: {x: -1000, y: 0},
          facing: 90,
          velocity: {magnitude: 0, direction: 0},
          mass: 1,
          driveParams: {
            acceleration: 9.8*2,
            engineOn: false,
          },
        },
        viewName: 'ship-1-view'
      },
      // {
      //   objectName: 'ship',
      //   params: {
      //     name: 'ship-2',
      //     position: {x: 600, y: 0},
      //     facing: 180,
      //     velocity: {magnitude: 100, direction: 180},
      //     mass: 1,
      //     driveParams: {
      //       acceleration: 9.8*2,
      //       engineOn: false,
      //     },
      //   },
      //   viewName: 'ship-2-view'
      // },
      {
        objectName: 'star',
        params: {},
        viewName: 'star-view'
      },
    ] as ObjectSpec[];

const { screenEl, startStopButton, stepButton, roundScreenControl, ship1Controls, ship2Controls } = setupUI(sceneOptions);

const objectFactory = new SpaceObjectFactory(new SpaceObjectViewFactory(
    {dimensions, showGrid}
));

const scene = new Scene(sceneOptions, objectDefinitions, objectFactory,
    {screenEl, startStopButton, stepButton}
);

updateRoundScreen();
roundScreenControl.addEventListener('change', (e: Event) => {
  const target = e.target as HTMLInputElement;
  if (target) {
    scene.options.roundScreen = target.checked;
    updateRoundScreen();
  }
})

// @ts-ignore
window.spacewar = {
  scene,
  options: sceneOptions,
}

// Handle ship being destroyed by removing object listeners (updates and removals) and turning off key bindings.
scene.addEventListener('removeObject', (e: Event) => {
  if (e instanceof RemoveObjectEvent) {
    const o = e.object;
    const controlsData = controlsSetupMap.get(o.name);
    if (typeof controlsData !== 'undefined') {
      const updateObjectControls = controlsData.updateObjectControls;
      if (typeof updateObjectControls !== 'undefined') {
        o.removeEventListener('updated', updateObjectControls);
      }
      controlsData.enabled = false;
    }
  }
})

scene.render();

type ShipCtlKeyBinding = {
  shipName: string,
  action: 'rotate-left' | 'rotate-right' | 'rotate-slow' | 'drive' | 'torpedo'
};

const shipsCtlKeyMap = new Map<string, ShipCtlKeyBinding>([
  ["KeyA", {"shipName": 'ship-1', "action": "rotate-left"}],
  ["KeyD", {"shipName": 'ship-1', "action": "rotate-right"}],
  ["KeyS", {"shipName": 'ship-1', "action": "drive"}],
  ["KeyW", {"shipName": 'ship-1', "action": "torpedo"}],
  ["ShiftLeft", {"shipName": 'ship-1', "action": "rotate-slow"}],

  ["ArrowLeft", {"shipName": 'ship-2', "action": "rotate-left"}],
  ["ArrowRight", {"shipName": 'ship-2', "action": "rotate-right"}],
  ["ArrowDown", {"shipName": 'ship-2', "action": "drive"}],
  ["ArrowUp", {"shipName": 'ship-2', "action": "torpedo"}],
  ["ShiftRight", {"shipName": 'ship-2', "action": "rotate-slow"}],
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
  const ship = scene.getObjectByName(binding.shipName) as Ship;
  if (typeof ship === 'undefined') {
    return;
  }
  const controlData = controlsSetupMap.get(binding.shipName);
  if (typeof controlData !== 'undefined' && controlData.enabled) {
    const ship = scene.getObjectByName(binding.shipName) as Ship;
    if (typeof ship === 'undefined') {
      return;
    }
    switch (binding.action) {
      case 'rotate-left':
        ship.setRotateDirection('left');
        break;
      case 'rotate-right':
        ship.setRotateDirection('right');
        break;
      case 'rotate-slow':
        ship.setRotateFactor('slow');
        break;
      case "drive":
        ship.switchDriveOn();
        break;
      case "torpedo":
        ship.fireTorpedo();
        break;
    }
  }
})

document.addEventListener('keyup', (e: KeyboardEvent) => {
  const binding = convertKeyToControl(e.code);
  if (typeof binding === 'undefined') {
    return;
  }
  const ship = scene.getObjectByName(binding.shipName) as Ship;
  if (typeof ship === 'undefined') {
    return;
  }
  switch (binding.action) {
    case 'rotate-left':
    case 'rotate-right':
      ship.setRotateDirection('not');
      break;
    case 'rotate-slow':
      ship.setRotateFactor('fast');
      break;
    case "drive":
      ship.switchDriveOff();
      break;
  }
})

const controlsSetupMap = new Map<string, { enabled: boolean, updateObjectControls: () => void }>();
[ship1Controls, ship2Controls].forEach((controls) => {
  if (controls) {
    const controlData = setupControls(controls);
    if (typeof controlData !== 'undefined') {
      const [shipName, updateObjectControls] = controlData;
      controlsSetupMap.set(shipName, {enabled: true, updateObjectControls});
    }
  }
})

function setupUI(options: SceneOptions) {

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

  roundScreenControl.checked = !! options.roundScreen;

  const ship1Controls = document.querySelector<HTMLElement>('#ship-1-controls');

  const ship2Controls = document.querySelector<HTMLElement>('#ship-2-controls');

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
  return { screenEl, startStopButton, stepButton, roundScreenControl, ship1Controls, ship2Controls }
}

function setupControls(controlBlock: HTMLElement) {
  const shipName = controlBlock.dataset.objectName;
  if (typeof shipName === 'undefined') {
    return;
  }
  const ship = scene.getObjectByName(shipName);
  if (!ship) {
    return;
  }
  const positionXControl = controlBlock.querySelector<HTMLElement>('.position-x');
  if (!positionXControl) {
    throw new Error(`${shipName} position X control not available!`);
  }
  const positionYControl = controlBlock.querySelector<HTMLElement>('.position-y');
  if (!positionYControl) {
    throw new Error(`${shipName} position Y control not available!`);
  }
  const facingControl = controlBlock.querySelector<HTMLElement>('.ship-facing');
  if (!facingControl) {
    throw new Error(`${shipName} facing control not available!`);
  }

  const velocityMagnitudeControl = controlBlock.querySelector<HTMLElement>('.ship-velocity-magnitude');
  if (!velocityMagnitudeControl) {
    throw new Error(`${shipName} velocity magnitude control not available!`);
  }

  const velocityDirectionControl = controlBlock.querySelector<HTMLElement>('.ship-velocity-direction');
  if (!velocityDirectionControl) {
    throw new Error(`${shipName} velocity direction control not available!`);
  }

  const driveStatusEl = controlBlock.querySelector<HTMLElement>('.engine-state');
  if (!driveStatusEl) {
    throw new Error(`${shipName} drive status control not available!`);
  }

  // Update the display for the ship based on the ship object. Called when an updated event is received.
  const updateObjectControls = () => {
    positionXControl.innerText = roundTo(ship.position.x, 1).toString();
    positionYControl.innerText = roundTo(ship.position.y, 1).toString();
    facingControl.innerText = roundTo(ship.facing, 2).toString();
    velocityMagnitudeControl.innerText = roundTo(ship.velocity.magnitude, 2).toString();
    velocityDirectionControl.innerText = roundTo(ship.velocity.direction, 2).toString();
    if (ship instanceof Ship) {
      driveStatusEl.innerText = ship.engineStatus() ? 'on' : 'off';
    }
  }
  updateObjectControls();

  ship.addEventListener('updated', updateObjectControls)
  return [shipName, updateObjectControls] as  [string, typeof updateObjectControls]
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
