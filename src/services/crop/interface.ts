import { Matrix } from 'pixi.js';
import EventEmitter from 'eventemitter3';

export enum Event {
  onCropChange = 'onCropChange',
  onCropStart = 'onCropStart',
  onCropEnd = 'onCropEnd',
}

export interface ICropService extends EventEmitter<`${Event}`> {
  init: () => void;
  setOptions: (props: {
    disabled?: boolean;
    showMask?: boolean;
    minCropBoxWidth?: number | string;
    minCropBoxHeight?: number | string;
    cropBoxLimited?: {
      width: number;
      height: number;
      left: number;
      top: number;
    };
  }) => void;

  //设置预览
  setPreview: (dom: HTMLElement) => void;

  destroy: () => Promise<void>;
}
