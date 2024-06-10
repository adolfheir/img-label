import EventEmitter from 'eventemitter3';
import { Matrix } from 'pixi.js';

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

export enum FaceEvent {
  'onFaceDrawDone' = 'onFaceDrawDone',
}

export interface IFaceService extends EventEmitter<`${FaceEvent}`> {
  reset: (able: boolean) => void;
  setFaceRect: (rect: Rect) => void;
  destroy: () => Promise<void>;
}
