import { Matrix } from 'pixi.js';
import { PointDrawer, LineDrawer, PolygonDrawer } from './draw';

export interface IDrawService {
  drawMode?: PolygonDrawer;
  changeMode: () => void;
  destroy: () => Promise<void> | void;
}
