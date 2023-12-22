import { injectable, inject } from 'inversify';
import {
  Assets,
  Sprite,
  Container,
  DisplayObject,
  FederatedPointerEvent,
  ObservablePoint,
  Matrix,
  Transform,
} from 'pixi.js';
import { TYPES } from '../../types';
import { SmoothGraphics as Graphics, DashLineShader } from '@pixi/graphics-smooth';
import type { ICoreService } from '../core/interface';
import type { IDrawFaceService, Point, Rect } from './interface';
import { Event } from './interface';
export type { IDrawFaceService } from './interface';
import { EventEmitter } from 'eventemitter3';

@injectable()
export class DrawFaceService extends EventEmitter<`${Event}`> implements IDrawFaceService {
  private CoreService: ICoreService;

  /* 缓存所有清理函数 */
  private destoryfnList: Function[] = [];

  //维护所有点的container
  private facePointListContainter: Container<DisplayObject>;

  private pointList: Point[] = [];
  private able: boolean = false;
  //完成后的框
  private faceRect?: Rect;

  constructor(
    @inject(TYPES.ICore)
    CoreService: ICoreService,
  ) {
    super();
    this.CoreService = CoreService;

    this.facePointListContainter = new Container();
    this.facePointListContainter.zIndex = 1;
    this.CoreService.globalContainer.addChild(this.facePointListContainter);

    let handlerClick = this.handleClick.bind(this);

    this.CoreService.app.stage.addEventListener('click', handlerClick);

    this.destoryfnList.push(() => {
      this.CoreService.app.stage.removeEventListener('click', handlerClick);
    });

    //启动循环
    let loop = this.loop.bind(this);
    this.CoreService.app.ticker.add(loop);
    this.destoryfnList.push(() => {
      this.CoreService.app.ticker.remove(loop);
    });
  }

  //渲染：每次都重新new Graphics 数据不大更灵活
  loop(delta: number) {
    this.facePointListContainter.children.forEach((v) => {
      (v as Graphics).clear();
      v.destroy();
      this.facePointListContainter.removeChild(v);
    });

    let scale = this.CoreService.globalContainer.localTransform.a;
    let graphicsList = this.pointList.map((item) => {
      const { x, y } = item;

      let graphics = new Graphics();
      // 设置绘制样式
      const fillColor = 0xf14e4e; // 内圆填充颜色
      const fillThickness = 3; // 内圆边框宽度
      const strokeColor = 0xffffff; // 边框颜色
      const strokeThickness = 1; // 边框宽度

      graphics.lineStyle(strokeThickness / scale, strokeColor);
      graphics.beginFill(fillColor);
      graphics.drawCircle(x, y, fillThickness / scale);
      graphics.endFill();

      return graphics;
    });

    if (this.faceRect) {
      const { x, y, w, h } = this.faceRect;
      let rectGraphics = new Graphics();
      graphicsList.push(rectGraphics);
      rectGraphics.lineStyle({
        width: 1 / scale,
        color: 'rgb(241, 78, 78)',
      });
      rectGraphics.drawRect(x, y, w, h);
    }

    if (graphicsList.length > 0) {
      this.facePointListContainter.addChild(...graphicsList);
    }
  }

  handleClick(event: FederatedPointerEvent) {
    let conatiner = this.facePointListContainter;
    if (conatiner && this.able) {
      //换local 坐标
      let wordPoint = event.global.clone();
      let localPoint = this.CoreService.globalContainer.localTransform.applyInverse(wordPoint);
      let _wordPoint = this.CoreService.globalContainer.localTransform.apply(localPoint);

      if (this.pointList.length < 5) {
        this.pointList.push(localPoint);
      }
      if (this.pointList.length == 5) {
        this.able = false;
        //下一帧发 保证点位能先看到
        setTimeout(() => {
          this.emit(Event['onFaceDrawDone']);
        }, 16);
      }
    }
  }

  reset(able = true) {
    this.pointList = [];
    this.faceRect = undefined;
    this.able = able;
  }

  setFaceRect(faceRect: Rect) {
    this.reset(false);
    this.faceRect = faceRect;
  }

  async destroy() {
    while (this.destoryfnList.length) {
      const close = this.destoryfnList.pop();
      if (close) {
        try {
          close();
        } catch (error) {
          console.log('err', error);
        }
      }
    }
    this.removeAllListeners();
    this.reset(false);
    this.facePointListContainter?.destroy();
  }
}
