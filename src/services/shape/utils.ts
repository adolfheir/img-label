import { Rect } from './interface';
type Point = {
  x: number;
  y: number;
};
type Line = [Point, Point];

type Polygon = Point[];

//点到线的距离
//see https://stackoverflow.com/questions/50716161/2d-geometry-calculation-on-flat-surface/50718723#50718723
export const pointToSegmentDistance = (p0: Point, line: Line) => {
  let p1 = line[0];
  let p2 = line[1];

  let { x: x0, y: y0 } = p0;
  let { x: x1, y: y1 } = p1;
  let { x: x2, y: y2 } = p2;
  return (
    Math.abs((y2 - y1) * x0 - (x2 - x1) * y0 + x2 * y1 - y2 * x1) /
    Math.sqrt((y2 - y1) * (y2 - y1) + (x2 - x1) * (x2 - x1))
  );
};

//点到Polygon的距离
export function pointToPolygonDistance(point: Point, polygon: Polygon): number {
  const distances: number[] = [];

  for (let i = 0; i < polygon.length; i++) {
    const segmentStart = polygon[i];
    const segmentEnd = polygon[(i + 1) % polygon.length];
    const distance = pointToSegmentDistance(point, [segmentStart, segmentEnd]);
    distances.push(distance);
  }

  // 计算最小距离
  const minDistance = Math.min(...distances);

  return minDistance;
}

//点是否在多边形内
// see https://github.com/HarryStevens/geometric/blob/master/src/relationships/pointInPolygon.js
export function pointInPolygon(point: Point, polygon: Polygon): boolean {
  let x = point.x;
  let y = point.y;
  let inside = false;

  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].x;
    const yi = polygon[i].y;
    const xj = polygon[j].x;
    const yj = polygon[j].y;

    if (yi > y != yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) {
      inside = !inside;
    }
  }

  return inside;
}

export function rectListToPolygon(rect: Rect): Polygon {
  const { x, y, w, h } = rect;

  const topLeft: Point = { x, y };
  const topRight: Point = { x: x + w, y };
  const bottomRight: Point = { x: x + w, y: y + h };
  const bottomLeft: Point = { x, y: y + h };

  return [topLeft, topRight, bottomRight, bottomLeft];
}
