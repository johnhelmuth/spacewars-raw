import {Vector, type Point, translateVector, rotateVertices } from "./types/geometry.ts";

const drawingT = document.querySelector('#test-drawing-template') as HTMLTemplateElement;
if (! drawingT) {
  throw new Error("Couldn't find 'test-drawing-template'");
}
const drawingList = document.querySelector('#drawing-list') as HTMLUListElement;

const logItemT = document.querySelector('#test-log-item-template') as HTMLTemplateElement;
if (! logItemT) {
  throw new Error("Couldn't find 'test-log-item-template");
}
const logList = document.querySelector('#log-list') as HTMLUListElement;

const verts = [
  { x: 2, y: 32 },
  { x: 63, y: 48 },
  { x: 32, y: 32 },
  { x: 63, y: 16 },
]

const rotatePoint = { x: 32, y: 32};
logDrawing(`Base verts `, svgFromVerts(verts, rotatePoint));
const numTests = 16;
for (let i = 1 ; i <= numTests; i++) {
  const direction = i * 360/numTests;
  const rotatedVerts = rotateVertices(verts, rotatePoint, direction);
  logDrawing(`Test ${i+1} ${direction}deg`, svgFromVerts(rotatedVerts, rotatePoint));
}

function svgFromVerts(verts: Point[], rotatePoint: Point) {
  const shape = verts.map((v: Point) => {
    return `<circle cx="${v.x}" cy="${v.y}" r="2" fill="red" />`
  }).join('\n')
  return `
          <svg
            class="test-object"
            height="256" width="256"
            viewBox="-128 -128 256 256"
            preserveAspectRatio="xMidYMid meet"
          >
            <g>
              ${shape}
            </g>
            <g><circle cx="${rotatePoint.x}" cy="${rotatePoint.y}" r="1" fill="green"/></g>
          </svg>
    `;
}

function logDrawing(label: string, svg: string) {
  const drawingItem = document.importNode(drawingT.content, true);
  const labelEl = drawingItem.querySelector('.drawing-label');
  if (labelEl) {
    labelEl.textContent = label;
  }
  const drawingEl = drawingItem.querySelector('.drawing');
  if (drawingEl) {
    drawingEl.innerHTML = svg;
  }
  drawingList.appendChild(drawingItem)
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