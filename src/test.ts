import {Vector} from "./types/geometry.ts";

const logItemT = document.querySelector('#test-log-item-template') as HTMLTemplateElement;
if (! logItemT) {
  throw new Error("Couldn't find 'test-log-item-template");
}
const logList = document.querySelector('#log-list') as HTMLUListElement;

const magnitude = 1;
for (let i = 0 ; i <= 16; i++) {
  const direction = i * 360/16;
  const v1 = new Vector({ magnitude, direction })
  const v2 = new Vector({ x: v1.x, y: v1.y });
  const v3 = new Vector({ magnitude: v2.magnitude, direction: v2.direction });
  logVector(`Test ${i}`);
  logVector(`V1 Set mag, dir: ${v1.magnitude}, ${v1.direction}`, v1)
  logVector(`V2 Set   x,   y: ${v1.x}, ${v1.y}`, v2)
  logVector(`V3 Set mag, dir: ${v2.magnitude}, ${v2.direction}`, v3)
}



function logVector(msg: string, v?: Vector) {
  const logItem = document.importNode(logItemT.content, true);
  const msgEl = logItem.querySelector('.msg');
  if (msgEl) {
    msgEl.textContent = msg;
  }
  if (typeof v !== 'undefined') {
    const vecXYEl = logItem.querySelector('.vector-xy');
    const vecMagDirEl = logItem.querySelector('.vector-mag-dir');
    if (vecXYEl) {
      vecXYEl.textContent = `${v.x}, ${v.y}`;
    }
    if (vecMagDirEl) {
      vecMagDirEl.textContent = `${v.magnitude}, ${v.direction}`;
    }
  }
  logList.appendChild(logItem);
}