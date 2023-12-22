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
    } else console.error('pointToPolygonDistance', point, polygon);
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

export const MultipleLine2Polygon = (line: MultipleLine, width: number): Polygon => {
  const polygon: Polygon = [];

  // 处理每一段线段
  for (let i = 0; i < line.length - 1; i++) {
    const currentPoint = line[i];
    const nextPoint = line[i + 1];

    const dx = nextPoint.x - currentPoint.x;
    const dy = nextPoint.y - currentPoint.y;

    // 计算单位向量
    const length = Math.sqrt(dx * dx + dy * dy);
    const nx = -dy / length;
    const ny = dx / length;

    // 计算当前线段两侧的顶点坐标
    const leftVertex: Point = {
      x: currentPoint.x - (nx * width) / 2,
      y: currentPoint.y - (ny * width) / 2,
    };

    const rightVertex: Point = {
      x: currentPoint.x + (nx * width) / 2,
      y: currentPoint.y + (ny * width) / 2,
    };

    polygon.push(rightVertex);
    polygon.unshift(leftVertex);

    if (i === line.length - 2) {
      const leftVertex: Point = {
        x: nextPoint.x - (nx * width) / 2,
        y: nextPoint.y - (ny * width) / 2,
      };

      const rightVertex: Point = {
        x: nextPoint.x + (nx * width) / 2,
        y: nextPoint.y + (ny * width) / 2,
      };
      polygon.push(rightVertex);
      polygon.unshift(leftVertex);
    }
  }
  polygon.push(polygon[0]);

  return polygon;
};

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

export const mock = [
  313.03532068323887, 320.86046807075087, 312.9088199417612, 317.66296942924913, 775.4823079352179, 302.5649523128314,
  780.0848795647821, 299.1803601871687, 693.5344291139867, 532.6213149805516, 695.7765083860135, 535.8634506444486,
  497.7893390951758, 528.990704828577, 497.7299968423242, 532.1901545464232,
];

export const mockEnd = [
  313.03532068323887, 320.86046807075087,

  775.4823079352179, 302.5649523128314,

  693.5344291139867, 532.6213149805516,

  497.7893390951758, 528.990704828577, 497.7299968423242, 532.1901545464232,

  695.7765083860135, 535.8634506444486, 780.0848795647821, 299.1803601871687, 312.9088199417612, 317.66296942924913,
];
