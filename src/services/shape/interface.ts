// import { Graphics, Sprite, Container, DisplayObject, Matrix } from 'pixi.js';
import { extend } from 'lodash';
import { SmoothGraphics as Graphics, DashLineShader } from '@pixi/graphics-smooth';
import EventEmitter from 'eventemitter3';

/* 非归一化rect */
type Rect = {
  id: String | Number;
  x: number;
  y: number;
  w: number;
  h: number;
};

export interface Shape extends Rect {
  hoverAbele?: boolean;
  selectAble?: boolean;
}

export enum ShapeServiceEvent {
  onShapeSelectChange = 'shape-select-change',
}

export type DrawFn<T extends Shape> = (props: {
  item: T;
  lastHoverTime?: DOMHighResTimeStamp;
  lastSelectTime?: DOMHighResTimeStamp;
  hoverShapId?: String | Number;
  selectShapId?: String | Number;
  delta: number;
  scale: number;
}) => Graphics[];

export interface IShapeService<T extends Shape> extends EventEmitter<`${ShapeServiceEvent}`> {
  init: () => void;
  remove: (key?: String | Number) => void;
  add: (rect: T | T[]) => void;
  replace: (replaceHandle: (T | T[]) | ((d: T[]) => T | T[])) => void;
  destroy: () => void;
  setDrawFn: (drawFn: DrawFn<T>) => void;
}
