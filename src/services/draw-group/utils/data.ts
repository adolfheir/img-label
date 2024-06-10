import { isNil, pick } from 'lodash';
import {
  Position,
  IBsaeData,
  IPointData,
  ILineData,
  IPolygonData,
  IDashLineData,
  ILineProperties,
  IPointProperties,
  IPolygonProperties,
} from '../typings';

export const getUuid = (() => {
  let count = 1;
  return (prefix: string) => {
    return `${prefix}-${count++}`;
  };
})();

export const isSameData = <F extends IBsaeData>(d?: F | null, d1?: F | null) => {
  return !isNil(d) && d?.properties?.id === d1?.properties?.id;
};

/**
 * 对target数据使用targetHandler，对target以外数据采用otherHandler
 * @param target
 * @param data
 * @param targetHandler
 * @param otherHandler
 */
export const updateTargetData = <F = IBsaeData>({
  target,
  data,
  targetHandler,
  otherHandler,
}: {
  target: F;
  data: F[];
  targetHandler?: (item: F, index: number) => F | void;
  otherHandler?: (item: F, index: number) => F | void;
}) => {
  return data.map((item, index) => {
    const handler = isSameData(target as IBsaeData, item as IBsaeData) ? targetHandler : otherHandler;
    return handler?.(item, index) ?? item;
  });
};

export const getDefaultPointProperties = () => {
  return {
    id: getUuid('point'),
    isHover: false,
    isActive: false,
    isDrag: false,
    createTime: Date.now(),
  };
};

export const createPointFeature = (pos: Position, properties: Partial<IPointProperties> = {}) => {
  let point: IPointData = {
    data: pos,
    properties: {
      ...getDefaultPointProperties(),
      ...properties,
    },
  };
  return point;
};

export const getDefaultLineProperties = () => {
  return {
    id: getUuid('line'),
    isHover: false,
    isActive: false,
    isDrag: false,
    isDraw: false,
    createTime: Date.now(),
  };
};

export const createLineFeature = (nodes: IPointData[], properties: Partial<ILineProperties> = {}) => {
  let line: ILineData = {
    data: nodes.map((v) => v['data']),
    properties: {
      ...getDefaultLineProperties(),
      id: getUuid('line'),
      nodes,
      ...properties,
    },
  };
  return line;
};

export const getDefaultDashLineProperties = () => {
  return {
    id: getUuid('dash-line'),
    isDraw: false,
    isActive: false,
  };
};

export const createDashLine = (positions: Position[]) => {
  let dashLine: IDashLineData = {
    data: positions,
    properties: {
      ...getDefaultDashLineProperties(),
    },
  };
  return dashLine;
};

export const getDefaultPolygonProperties = () => {
  return {
    id: getUuid('polygon'),
    isHover: false,
    isActive: false,
    isDrag: false,
    isDraw: false,
    createTime: Date.now(),
  };
};

export const createPolygonFeature = (nodes: IPointData[], properties: Partial<IPolygonProperties> = {}) => {
  let line: IPolygonData = {
    data: nodes.map((v) => v['data']),
    properties: {
      ...getDefaultPolygonProperties(),
      nodes,
      // line: [],
      ...properties,
    } as IPolygonProperties,
  };
  return line;
};
