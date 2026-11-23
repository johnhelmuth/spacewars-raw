import {BoundingBox, Vector} from "../types/geometry.ts";

export class Renderer extends EventTarget {

  bbToViewBox(bb: BoundingBox): string {
    return `${bb.x} ${bb.y} ${bb.width} ${bb.height}`;
  }

  inscribedPolygonVertices(r: number, numberOfVertices: number) {
    const baseAngle = 360 / numberOfVertices;
    const angles = [] as number[];
    for (let a = 0; a < 360; a += baseAngle) {
      angles.push(a);
    }
    return angles
      .map(angle => {
        const {x, y} = new Vector({magnitude: r, direction: angle});
        return {x, y};
      })
  }

  inscribedPolystarPath(r: number, numberOfRays: number) {
    return this.inscribedPolygonVertices(r, numberOfRays)
      .reduce((s, {x, y}) => {
        return s + `M 0,0 L ${x},${y} `
      }, '');
  }

  inscribedPolygonPath(r: number, numberOfVertices: number) {
    return this.inscribedPolygonVertices(r, numberOfVertices)
      .reduce((s, {x, y}) => {
        const action = s ? 'L ' : 'M ';
        return s + `${action} ${x},${y} `
      }, '') + 'Z';
  }

  inscribedTrianglePath(r: number) {
    return this.inscribedPolygonPath(r, 3);
  }

  inscribedSquarePath(r: number) {
    return this.inscribedPolygonPath(r, 4);
  }
}