import { injectable, inject } from 'inversify';
import {
  Assets,
  Sprite,
  Container,
  DisplayObject,
  FederatedPointerEvent,
  ObservablePoint,
  Point,
  Matrix,
  Transform,
} from 'pixi.js';
import { TYPES } from '../../types';
import type { ICoreService } from '../core/interface';
import type { IImgService } from './interface';

export type { IImgService } from './interface';

@injectable()
export class ImgService implements IImgService {
  @inject(TYPES.ICore) private readonly CoreService!: ICoreService;

  imgSprite?: Sprite;

  async loadImg(url: string, autoFit: boolean = true) {
    //清理
    await this.destroy();
    //加载图片
    let sprite = await new Promise<Sprite>((resolve, reject) => {
      const sprite = Sprite.from(url);
      sprite.texture.baseTexture.on('loaded', () => {
        resolve(sprite);
      });
      sprite.texture.baseTexture.on('error', (error) => {
        reject(error);
      });
      if (sprite.texture.baseTexture.valid) {
        resolve(sprite);
      }
    });
    sprite.zIndex = -1;
    this.imgSprite = sprite;
    if (autoFit) {
      let fitMartix = this.getFitMatrix();
      const { width, height } = sprite;
      //设置容器limit
      this.CoreService.setLimit({
        minZoom: fitMartix.a,
        box: {
          width: width,
          height: height,
        },
      });
      this.CoreService.applyMatrix(fitMartix);
    }

    this.CoreService.globalContainer.addChild(this.imgSprite);
  }

  getFitMatrix() {
    if (!this.imgSprite) {
      throw new Error('yoou must do loadImg before');
    }

    let { width: boxWidth, height: boxHeight } = this.CoreService.app.view;
    let { width: imageWidth, height: imageHeight } = this.imgSprite;

    // 计算缩放比例
    const scaleX = boxWidth / imageWidth;
    const scaleY = boxHeight / imageHeight;
    const scale = Math.min(scaleX, scaleY);

    // 计算平移量以居中对齐图片
    const translateX = (boxWidth - imageWidth * scale) / 2;
    const translateY = (boxHeight - imageHeight * scale) / 2;

    // 构建变换矩阵
    const matrix = new Matrix();
    matrix.setTransform(translateX, translateY, 0, 0, scale, scale, 0, 0, 0);
    return matrix;
  }

  async destroy() {
    if (this.imgSprite) {
      this.CoreService?.globalContainer?.removeChild(this.imgSprite);
      this.imgSprite?.destroy();
      this.imgSprite = undefined;
    }
  }
}
