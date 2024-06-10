import type { ICoreService } from '../../core/interface';
import { RenderMap } from './render';

export interface Position {
  x: number;
  y: number;
}

export interface IBaseProperties {
  id: string;
  isDraw?: boolean;
  isActive?: boolean;
  [key: string]: any;
}

export interface IBsaeData<
  data extends Position | Position[] = Position | Position[],
  P extends IBaseProperties = IBaseProperties,
> {
  data: data;
  properties: P;
}

/* ============================== 点类型 =============================== */
export interface IPointProperties extends IBaseProperties {
  isHover?: boolean;
  isDrag?: boolean;
  createTime: number;
}
export type IPointData = IBsaeData<Position, IPointProperties>;

/* ============================== 线类型 =============================== */
export interface ILineProperties extends IBaseProperties {
  nodes: IPointData[];
  isHover?: boolean;
  isDrag?: boolean;
  createTime: number;
}

export type ILineData = IBsaeData<Position[], ILineProperties>;

/* ============================== 面类型 =============================== */
export interface IPolygonProperties extends IBaseProperties {
  nodes: IPointData[];
  line: ILineData;
  isHover?: boolean;
  isDrag?: boolean;
  createTime: number;
}

export type IPolygonData = IBsaeData<Position[], IPolygonProperties>;

/* ============================== 中点 =============================== */
export interface IMidPointProperties extends IBaseProperties {
  startId: string;
  endId: string;
}

export type IMidPointData = IBsaeData<Position, IMidPointProperties>;

/* ============================== 虚线 =============================== */
export type IDashLineData = IBsaeData<Position[], IBaseProperties>;

export type DataUpdater<F> = F[] | ((newData: F[]) => F[]);

/* ============================== 汇总 =============================== */

// 文本Feature Properties类型
export interface ITextProperties extends IBaseProperties {
  type: 'distance' | 'totalDistance' | 'dash' | 'area';
  text: string;
  meters: number;
}
export type ITextData = IBsaeData<Position[], IBaseProperties>;

export interface SourceData {
  point: IPointData[];
  line: ILineData[];
  polygon: IPolygonData[];
  midPoint: IMidPointData[];
  dashLine: IDashLineData[];
}

export type HistoryConfig = {
  maxSize: number;
};

/**
 * Source构造器中传输的配置
 */
export interface SourceOptions {
  CoreService: ICoreService;
  data?: Partial<SourceData>;
  render: RenderMap;
  history?: HistoryConfig;
}
