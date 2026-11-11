import {
  type Point,
  rotateVertices,
  pointsToBoundingBox,
  magDirToPoint,
  pointToMagDir
} from "./types/geometry.ts";

const drawingT = document.querySelector('#test-drawing-template') as HTMLTemplateElement;
if (! drawingT) {
  throw new Error("Couldn't find 'test-drawing-template'");
}
const drawingList = document.querySelector('#drawing-list') as HTMLUListElement;

const logItemT = document.querySelector('#test-log-item-template') as HTMLTemplateElement;
if (! logItemT) {
  throw new Error("Couldn't find 'test-log-item-template");
}
// const logList = document.querySelector('#log-list') as HTMLUListElement;

const verts = [
  { x: 32, y: 2 },
  { x: 64, y: 62 },
  { x: 32, y: 32 },
  { x: 0, y: 62 },
];


const rotatePoint = { x: 32, y: 32};
logDrawing(`Base verts `,
  svgFromVerts(verts, rotatePoint, 0, { x: 0, y: -100}),
);

const numTests = 8;
for (let i = 0 ; i < numTests; i++) {
  const direction = (i) * 360/numTests;
  const magnitude = 100;
  const rotatedVerts = rotateVertices(verts, rotatePoint, direction);
  const testPoint = magDirToPoint(magnitude, direction);
  const testMagDir = pointToMagDir(testPoint);
  const testPoint2 = magDirToPoint(testMagDir.magnitude, testMagDir.direction);
  logDrawing(
    `Test ${i+1} ${direction}deg`,
    svgFromVerts(rotatedVerts, rotatePoint),
    svgFromVerts(verts, rotatePoint, direction, testPoint),
    `<h4>Test {magnitude, direction} {${magnitude}, ${direction}}</h4>` +
    `<ul><li>` +
    [
      `magDirToPoint(${magnitude}, ${direction}deg): (${testPoint.x}, ${testPoint.y})`,
      `pointToMagDir({ x: ${testPoint.x}, y: ${testPoint.y}): {magnitude: ${testMagDir.magnitude}, direction: ${testMagDir.direction}}`,
      `magDirToPoint(${testMagDir.magnitude}, ${testMagDir.direction}deg): (${testPoint2.x}, ${testPoint2.y})`,
      `Input direction: ${direction}deg, output direction: ${testMagDir.direction}deg`,
    ].join('</li><li>') +
    '</li></ul>'
  );
}

function svgFromVerts(verts: Point[], rotatePoint: Point, direction?: number, testPoint?: Point) {
  const bb = pointsToBoundingBox(verts);
  const points = [] as string[];
  const pathCommands = [] as string[];
  for (const v of verts) {
    points.push(`<circle cx="${v.x}" cy="${v.y}" r="5" fill="red" />`)
    pathCommands.push(`${pathCommands.length < 1 ? "M " : "L "} ${v.x} ${v.y}`)
  }
  const hasDirection = typeof direction !== 'undefined';
  const styles = [
    ['transform',[
      `translate(${-rotatePoint.x}px,${-rotatePoint.y}px)`,
      hasDirection ? `rotate(${direction}deg)` : '',
    ].join(' ')
    ]
  ];
  if (hasDirection) {
    styles.push(['transform-origin', `${rotatePoint.x}px ${rotatePoint.y}px`]);
  }

  const stylesString = styles.map(([property, value]) => `${property}: ${value};`).join(' ');
  return `
          <svg
            class="test-object"
            height="256" width="256"
            viewBox="-128 -128 256 256"
            preserveAspectRatio="xMidYMid meet"
          >
            <g>
              <rect x="-33" y="-33" width="66" height="66" fill="none" stroke="lightgrey" />
              <circle cx="0" cy="0" r="7" fill="lightgrey"/>
            </g>
            <svg 
              height="64"
              width="64"
              style="${stylesString}"
              viewBox="0 0 64 64"
            >
              ${points.join('')}
              <path d="${pathCommands.join('')} Z" fill="none" stroke="blue" />
              <rect x="${bb.x}" y="${bb.y}" width="${bb.width}" height="${bb.height}" fill="none" stroke="black" />
            </svg>
            ${typeof testPoint !== 'undefined' ? `<circle cx="${testPoint.x}" cy="${testPoint.y}" r="7" fill="green" />` : ''}
          </svg>
    `;
}

function logDrawing(label: string, svg: string, svg2?: string, notes?: string) {
  const drawingItem = document.importNode(drawingT.content, true);
  const labelEl = drawingItem.querySelector('.drawing-label');
  if (labelEl) {
    labelEl.textContent = label;
  }
  const drawingEl = drawingItem.querySelector('.drawing');
  if (drawingEl) {
    drawingEl.innerHTML = svg + (svg2 ?? '');
  }
  if (typeof notes !== 'undefined') {
    const notesEl = drawingItem.querySelector('.notes');
    if (notesEl) {
      notesEl.innerHTML = notes;
    }
  }
  drawingList.appendChild(drawingItem)
}
//
// function logVector(msg: string, v?: Vector) {
//   const logItem = document.importNode(logItemT.content, true);
//   const msgEl = logItem.querySelector('.msg');
//   if (msgEl) {
//     msgEl.textContent = msg;
//   }
//   if (typeof v !== 'undefined') {
//     const vecXYEl = logItem.querySelector('.vector-xy');
//     const vecMagDirEl = logItem.querySelector('.vector-mag-dir');
//     if (vecXYEl) {
//       vecXYEl.textContent = `${v.x}, ${v.y}`;
//     }
//     if (vecMagDirEl) {
//       vecMagDirEl.textContent = `${v.magnitude}, ${v.direction}`;
//     }
//   }
//   logList.appendChild(logItem);
// }