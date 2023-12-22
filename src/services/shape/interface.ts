// import { Graphics, Sprite, Container, DisplayObject, Matrix } from 'pixi.js';
import { SmoothGraphics as Graphics, DashLineShader } from '@pixi/graphics-smooth';

/* 非归一化rect */
export type Rect = {
  id: String | Number;
  x: number;
  y: number;
  w: number;
  h: number;
};

export type DrawFn = (props: {
  item: Rect;
  firstHoverShapTime?: DOMHighResTimeStamp;
  firstSelectShapTime?: DOMHighResTimeStamp;
  hoverShapId?: String | Number;
  selectShapId?: String | Number;
  delta: number;
  scale: number;
}) => Graphics[];

export interface IShapeService {
  remove: (key: String | Number) => void;
  add: (rect: Rect | Rect[]) => void;
  destroy: () => void;
  setDrawFn: (drawFn: DrawFn) => void;
}
