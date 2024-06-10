import { Polygon as PixiPolygon } from 'pixi.js';

type Point = {
  x: number;
  y: number;
};
type Line = [Point, Point];

type MultipleLine = Point[]; //多段线

type Polygon = Point[];

// 的欧几里得距离公式
export const pointToPointDistance = (p0: Point, p1: Point) => {
  const distance = Math.sqrt((p1.x - p0.x) ** 2 + (p1.y - p0.y) ** 2);
  return distance;
};

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

//点到多段线的距离
export const pointToMultipleLine = (point: Point, polygon: MultipleLine): number => {
  const distances: number[] = [];
  for (let i = 0; i < polygon.length - 1; i++) {
    const segmentStart = polygon[i];
    const segmentEnd = polygon[(i + 1) % polygon.length];
    const distance = pointToSegmentDistance(point, [segmentStart, segmentEnd]);
    distances.push(distance);
  }

  // 计算最小距离
  const minDistance = Math.min(...distances);
  return minDistance;
};

//点到Polygon的距离
export function pointToPolygonDistance(point: Point, polygon: Polygon): number {
  const distances: number[] = [];
  for (let i = 0; i < polygon.length; i++) {
    const segmentStart = polygon[i];
    const segmentEnd = polygon[(i + 1) % polygon.length];
    const distance = pointToSegmentDistance(point, [segmentStart, segmentEnd]);
    if (distance) {
      distances.push(distance);
    } else {
      console.error('pointToPolygonDistance', point, polygon);
    }
    // distance && distances.push(distance);
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

// export const multipleLine2PolygonPoints = (line: MultipleLine, distance: number): PixiPolygon => {
//   const numPoints = line.length;
//   const output = [];

//   for (let i = 0; i < numPoints - 1; i++) {
//     // 当前点
//     const { x, y } = line[i];

//     // 起点
//     const x0 = line[i].x;
//     const y0 = line[i].y;

//     // 终点
//     const x1 = line[i + 1].x;
//     const y1 = line[i + 1].y;

//     // 获取线段的角度
//     const a = Math.atan2(-x1 + x0, y1 - y0);
//     const deltaX = distance * Math.cos(a);
//     const deltaY = distance * Math.sin(a);

//     // 在起点添加 x, y
//     output[i * 2] = x + deltaX;
//     output[i * 2 + 1] = y + deltaY;

//     // 在终点添加反射的 x, y
//     output[output.length - 1 - i * 2 - 1] = x - deltaX;
//     output[output.length - 1 - i * 2] = y - deltaY;
//   }

//   // 闭合图形
//   output.push(output[0], output[1]);

//   return new PixiPolygon(output);
// };

export const sortPoints = (data: number[]) => {
  let list1 = [];
  let list2 = [];

  for (let i = 0; i < data.length; i += 4) {
    list1.push({
      x: data[i],
      y: data[i + 1],
    });
    list2.push({
      x: data[i + 2],
      y: data[i + 3],
    });
  }
  let ret = list1.concat(list2.reverse());
  return ret;
};
