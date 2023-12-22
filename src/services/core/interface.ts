import { Application, Sprite, Container, DisplayObject, Matrix, ICanvas } from 'pixi.js';
/* 默认缩放 */
export type Limit = {
  maxZoom: number;
  minZoom: number;

  /* 限制移动 */
  padding: number; //离容器的距离
  box?: {
    //在试图范围内的box没缩放的原始尺寸 坐标都是（0，0）开始
    width: number;
    height: number;
  };
};

export interface ICoreService {
  dom?: HTMLElement;
  app: Application<HTMLCanvasElement>;
  globalContainer: Container<DisplayObject>;

  init: (dom: HTMLDivElement) => Promise<void> | void;
  ableZoomAndScale: (able: boolean) => void;
  applyMatrix: (newMatrix: Matrix) => void;
  extractScreenCanvas: () => Promise<ICanvas>;

  setLimit: (limit: Partial<Limit>) => void;
  destroy: () => void;
}
