import { cloneDeep } from 'lodash';
import { Shape } from 'src/services/shape/draw2';
import {
  createContainer,
  ICoreService,
  IImgService,
  IShapeService,
  ICropService,
  TYPES,
  IDrawGroupService,
  Container,
  drawFn2,
  CropServiceEvent,
  CropBoxData,
  drawFn,
} from '../src';
// } from '../es';
// import type { Container } from "inversify"
import { mockRectList, mockImg } from './mock';

export class ImgLabel {
  private container: Container;
  private coreServices: ICoreService;
  private imgServices: IImgService;
  private shapeService?: IShapeService<Shape>;
  private corpService?: ICropService;
  private drawGroupService?: IDrawGroupService;

  public constructor(dom: HTMLDivElement) {
    // 创建ioc容器
    this.container = createContainer();

    // 依赖注入
    this.coreServices = this.container.get<ICoreService>(TYPES.ICore);
    this.coreServices.init(dom);

    //@ts-ignore
    console.log('limit', this.coreServices.id, cloneDeep(this.coreServices.limit));

    this.coreServices.ableZoomAndScale(true);

    this.imgServices = this.container.get<IImgService>(TYPES.IImg);
    this.imgServices.loadImg(mockImg, true).then(() => {
      // console.log('loadImg end');
      this.initDraw();
    });
  }

  async initDraw() {
    this.drawGroupService = this.container.get<IDrawGroupService>(TYPES.IDrawGroup);
    this.drawGroupService.initDrawer({
      polygon: {
        limitBox: {
          minX: 0,
          minY: 0,
          maxX: this.imgServices.imgSprite?.width!,
          maxY: this.imgServices.imgSprite?.height!,
        },
      },
      line: {
        limitBox: {
          minX: 0,
          minY: 0,
          maxX: this.imgServices.imgSprite?.width!,
          maxY: this.imgServices.imgSprite?.height!,
        },
      },
    });
    this.drawGroupService.setActiveDraw('polygon');
  }

  changeDrawMode() {
    console.log('draw', this.drawGroupService?.activeDrawer?.getData());
    let type: 'line' | 'polygon' = this.drawGroupService?.activeDrawType == 'line' ? 'polygon' : 'line';
    this.drawGroupService?.setActiveDraw(type);
  }

  async initShap() {
    this.shapeService = this.container.get<IShapeService<Shape>>(TYPES.IShape);
    this.shapeService.init();
    this.shapeService.setDrawFn(drawFn);
    this.shapeService.replace(mockRectList as Shape[]);
  }

  async initCrop() {
    //获取图片坐标
    let { width, height } = this.imgServices.imgSprite!;

    //转世界坐标
    let { x, y } = this.coreServices.globalContainer.localTransform.apply({ x: 0, y: 0 });
    let { x: x1, y: y1 } = this.coreServices.globalContainer.localTransform.apply({ x: width, y: height });

    let cropBoxLimited = {
      width: x1 - x,
      height: y1 - y,
      left: x,
      top: y,
    };

    //配置预览图
    let canvas = await this.coreServices.extractScreenCanvas();
    // this.corpService?.setPreview(canvas as unknown as HTMLCanvasElement);

    // let initialCropBoxData={
    //   width: 262,
    //   height: 253,
    //   left: 209,
    //   top: 182,
    // }

    let option = {
      cropBoxLimited: cropBoxLimited,
      // initialCropBoxData: {
      //   width: 262,
      //   height: 253,
      //   left: 209,
      //   top: 182,
      // },
      // initialCropBoxData: {
      //   width: 100,
      //   height: 100,
      //   left: 0,
      //   top: 0,
      // },
      previewDom: canvas as unknown as HTMLCanvasElement,
    };

    this.corpService = this.container.get<ICropService>(TYPES.ICrop);

    this.corpService.init(option);

    const handlerCropChange = (data?: CropBoxData) => {
      console.log('handlerCropChange', data);
      // setCropRect(
      //   data
      //     ? {
      //         x: data.left,
      //         y: data.top,
      //         w: data.width,
      //         h: data.height,
      //       }
      //     : undefined,
      // );
    };
    this?.corpService?.addListener(CropServiceEvent['onCropChange'], handlerCropChange);
    this?.corpService?.addListener(CropServiceEvent['onCropStart'], (data?: CropBoxData) => {
      // props?.onCropChange?.();
      console.log('onCropStart');
    });
    this?.corpService?.addListener(CropServiceEvent['onCropEnd'], handlerCropChange);
  }

  destoryCrop() {
    console.log('getCropData', this.corpService?.getCropData());
    this.corpService?.destroy();
  }

  public async destroy() {
    // TODO: 清理其他 Service 例如 IconService

    this.shapeService?.destroy();
    this.corpService?.destroy();
    this.drawGroupService?.destroy();
    this.imgServices.destroy();
    this.coreServices?.destroy();
    this.container?.unbindAll();
  }
}

export default ImgLabel;
