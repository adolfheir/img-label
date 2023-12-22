import { Matrix, Sprite } from 'pixi.js';

export interface IImgService {
  loadImg: (url: string, autoFit?: boolean) => Promise<void>;
  imgSprite?: Sprite;
  getFitMatrix: () => Matrix;
  destroy: () => Promise<void>;
}
