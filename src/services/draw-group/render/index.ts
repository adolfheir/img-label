import { IRenderType } from '../typings';
import { DashLineRender } from './dash-line-render';
import { LineRender } from './line-render';
import { MidPointRender } from './mid-point-render';
// export * from './text-render';
import { PointRender } from './point-render';
import { PolygonRender } from './polygon-render';

export * from './base-render';
export * from './point-render';
export * from './dash-line-render';
export * from './line-render';
export * from './mid-point-render';

export * from './polygon-render';
export * from './scene-render';

/**
 * renderType与render的映射
 */
export const RENDER_MAP: Record<
  IRenderType,
  | typeof PointRender
  | typeof LineRender
  | typeof DashLineRender
  | typeof MidPointRender
  // | typeof TextRender
  | typeof PolygonRender
> = {
  point: PointRender,
  line: LineRender,
  dashLine: DashLineRender,
  midPoint: MidPointRender,
  // text: TextRender,
  polygon: PolygonRender,
};
