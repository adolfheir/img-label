import { Matrix } from 'pixi.js';
import { PointDrawer, LineDrawer, PolygonDrawer } from './draw';
import { IPointDrawerOptions, ILineDrawerOptions, IPolygonDrawerOptions } from './draw';
import { DeepPartial } from './typings/index';

export * from './typings';

export enum DrawTypeEnum {
  'point' = 'point',
  'line' = 'line',
  'polygon' = 'polygon',
  // 'rect' = 'rect',
  // 'circle' = 'circle',
}

export type DrawInfoMap = {
  [DrawTypeEnum.point]?: PointDrawer;
  [DrawTypeEnum.line]?: LineDrawer;
  [DrawTypeEnum.polygon]?: PolygonDrawer;
};

export type DrawType = `${DrawTypeEnum}`;

export type UseDrawGroupConfig = {
  point?: DeepPartial<IPointDrawerOptions> | boolean;
  line?: DeepPartial<ILineDrawerOptions> | boolean;
  polygon?: DeepPartial<IPolygonDrawerOptions> | boolean;
};

type ValueOf<T> = T[keyof T];

export interface IDrawGroupService {
  initDrawer: (groupConfig: UseDrawGroupConfig) => void;
  activeDrawType?: DrawType;
  activeDrawer?: ValueOf<DrawInfoMap>;
  setActiveDraw: (type: DrawType) => void;

  destroy: () => Promise<void> | void;
}
