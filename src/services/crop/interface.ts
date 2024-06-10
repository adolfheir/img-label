import EventEmitter from 'eventemitter3';
import { Matrix } from 'pixi.js';

export type RequireSomeKey<T, K extends keyof T> = T & Required<Pick<T, K>>;

export enum CropServiceEvent {
  onCropChange = 'crop-change',
  onCropStart = 'crop-start',
  onCropEnd = 'crop-end',
}

export type CropBoxData = {
  width: number;
  height: number;
  left: number;
  top: number;
  minWidth: number;
  minHeight: number;
  maxWidth: number;
  maxHeight: number;
  minLeft: number;
  maxLeft: number;
  minTop: number;
  maxTop: number;
  oldLeft: number;
  oldTop: number;
};
export type InitialCropBoxData = RequireSomeKey<Partial<CropBoxData>, 'width' | 'height' | 'left' | 'top'>;

export type Option = {
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
};

export type InitOption = Option & {
  initialCropBoxData?: InitialCropBoxData;
  previewDom?: HTMLCanvasElement;
};

export interface ICropService extends EventEmitter<`${CropServiceEvent}`> {
  init: (props: InitOption) => void;

  //配置参数
  setOptions: (props: Option) => void;

  //设置预览
  setPreview: (dom: HTMLCanvasElement) => void;

  getCropData: () => CropBoxData;

  clearCropBox: () => void;
  //默认框
  setDefaultCropBox: (data: InitialCropBoxData) => void;

  //销毁
  destroy: () => Promise<void>;
}
