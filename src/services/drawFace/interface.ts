import { Matrix } from 'pixi.js';
import EventEmitter from 'eventemitter3';

export type Point = {
  x: number;
  y: number;
};

/* 非归一化rect */
export type Rect = {
  x: number;
  y: number;
  w: number;
  h: number;
};

export enum Event {
  'onFaceDrawDone' = 'onFaceDrawDone',
}

export interface IDrawFaceService extends EventEmitter<`${Event}`> {
  reset: (able: boolean) => void;
  setFaceRect: (rect: Rect) => void;
  destroy: () => Promise<void>;
}
