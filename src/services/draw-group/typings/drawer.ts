import { Content, Props as TippyProps } from 'tippy.js';
import { IBsaeData, ILineData, IPointData, IPolygonData, Position } from './source';
import { HistoryConfig } from './source';

/**
 * 鼠标指针类型
 */
export type ICursorType =
  | 'draw'
  | 'pointHover'
  | 'pointDrag'
  | 'lineHover'
  | 'lineDrag'
  | 'polygonHover'
  | 'polygonDrag';

/**
 * 鼠标指针类型键值对
 */
export type ICursor = Record<ICursorType, string>;

export type PopupOptions = Partial<TippyProps>;

export type KeyBoardConfig = Partial<{
  remove: string[] | false;
  revert: string[] | false;
  redo: string[] | false;
}>;

//世界坐标-图片原点就是原点
export type LimitBox = {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
} | null;

/**
 * 距离文案配置
 */
export interface IDistanceOptions {
  showTotalDistance: boolean;
  showDashDistance: boolean;
  showWhen: ('normal' | 'active')[];
  format: (meters: number, points: IPointData[]) => string;
}

/**
 * 面积文案配置
 */
export interface IAreaOptions {
  format: (squareMeters: number, polygonFeature: IPolygonData) => string;
  showWhen: ('normal' | 'active')[];
}

export type AdsorbTargetFeature = IPointData | ILineData | IPolygonData;

export interface IAdsorbOptions {
  data: 'drawData' | 'allDrawData' | AdsorbTargetFeature[] | ((position: Position) => AdsorbTargetFeature[]);
  pointAdsorbPixel: number;
  lineAdsorbPixel: number;
}

export type AdsorbResult = {
  points: IPointData[];
  lines: ILineData[];
};

export interface IBaseModeOptions<F extends IBsaeData = IBsaeData> {
  cursor: ICursor;
  initialData?: F[];
  editable: boolean;
  autoActive: boolean;
  multiple: boolean;
  helper: any | boolean;
  maxCount: number;
  limitBox: LimitBox;

  popup: PopupOptions | boolean;
  history: HistoryConfig | false;
  keyboard: KeyBoardConfig | false;
}
