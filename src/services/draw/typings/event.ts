import { Point } from 'pixi.js';

import { IBsaeData } from './source';

/* ============================== Index =============================== */

export interface IMouseEvent<T = IBsaeData> {
  wordPoint: Point;
  localPoint: Point;
  source?: T;
}
