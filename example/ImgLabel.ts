//奇怪case 理论上不需要
import 'reflect-metadata';
import {
  createContainer,
  ICoreService,
  IDrawFaceService,
  IImgService,
  IShapeService,
  ICropService,
  TYPES,
  IDrawService,
  Container,
} from '../src';
// import type { Container } from "inversify"
import { mockRectList, mockImg } from './mock';

export class ImgLabel {
  private container: Container;
  private coreServices: ICoreService;
  private imgServices: IImgService;
  private shapeService?: IShapeService;
  private drawFaceService?: IDrawFaceService;
  private corpService?: ICropService;
  private drawService?: IDrawService;

  public constructor(dom: HTMLDivElement) {
    // 创建ioc容器
    this.container = createContainer();

    // 依赖注入
    this.coreServices = this.container.get<ICoreService>(TYPES.ICore);
    this.coreServices.init(dom);
    // return

    this.imgServices = this.container.get<IImgService>(TYPES.IImg);
    this.imgServices.loadImg(mockImg, true).then(() => {
      this.initDraw();
    });

    // this.initShap()

    //@ts-ignore
    // window.init = this.initCrop.bind(this)
  }

  async initDraw() {
    this.drawService = this.container.get<IDrawService>(TYPES.IDraw);
    this.drawService.changeMode();
    this.drawService?.drawMode?.setLimitBox({
      minX: 0,
      minY: 0,
      maxX: this.imgServices.imgSprite?.width!,
      maxY: this.imgServices.imgSprite?.height!,
    });
  }

  async initShap() {
    this.shapeService = this.container.get<IShapeService>(TYPES.IShape);
    this.shapeService.add(mockRectList);
  }

  async initCrop() {
    this.corpService = this.container.get<ICropService>(TYPES.ICrop);
    this.corpService.init();
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
    this.corpService.setOptions({
      cropBoxLimited: cropBoxLimited,
    });
    // 设置预览
    //@ts-ignore
    // window.coreServices = this.coreServices
    // console.log("stage", this.coreServices.app.stage.width, this.coreServices.app.stage.height)
    // // let image = await this.coreServices.app.view.toDataURL()
    // const image = await this.coreServices.app.renderer.extract.canvas(this.coreServices.app.stage,

    //   new Rectangle(
    //     0, 0, this.coreServices.app.renderer.width, this.coreServices.app.renderer.height,
    //     //   {
    //     //   x: 0, y: 0,
    //     //    width: this.coreServices.app.renderer.width,
    //     //   height: this.coreServices.app.renderer.height,
    //     // }
    //   )
    // );
    // // const canvas = await this.coreServices.app.renderer.plugins.extract.canvas();
    // // console.log("canvas", image)
    let canvas = await this.coreServices.extractScreenCanvas();

    this.corpService.setPreview(canvas as unknown as HTMLElement);
  }

  public async destroy() {
    // TODO: 清理其他 Service 例如 IconService
    await this.imgServices.destroy();
    // this.shapeService.destroy();
    this.coreServices.destroy();
  }
}

export default ImgLabel;
