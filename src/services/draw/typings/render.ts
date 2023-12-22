import { BaseRender, LineRender, MidPointRender, DashLineRender, PointRender, PolygonRender } from '../render';

/**
 * Render key => value 映射关系
 */
export type RenderMap = Partial<{
  point: PointRender;
  line: LineRender;
  polygon: PolygonRender;
  midPoint: MidPointRender;
  dashLine: DashLineRender;
}>;

export type IRenderType = 'point' | 'line' | 'polygon' | 'midPoint' | 'dashLine';
// | 'text';
