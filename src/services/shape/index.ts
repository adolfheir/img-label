/* 此处维护container作为缩放矩阵的画布 */
import { has, isNil } from 'lodash';
import { isArray } from 'lodash';
import { injectable, inject } from 'inversify';
import {
  Application,
  Sprite,
  Container,
  DisplayObject,
  FederatedPointerEvent,
  Point,
  Matrix,
  Transform,
  Texture,
  ColorSource,
  WRAP_MODES,
} from 'pixi.js';
import { addEventListener } from '../../helpers/addEventListener';
import { TYPES } from '../../types';
import type { ICoreService } from '../core/interface';
import type { IShapeService, Rect, DrawFn } from './interface';
import { SmoothGraphics as Graphics, DashLineShader } from '@pixi/graphics-smooth';
export type { IShapeService } from './interface';
import { pointInPolygon, pointToSegmentDistance, pointToPolygonDistance, rectListToPolygon } from './utils';
// import { drawFn } from "./draw"
import { drawFn } from './draw2';

@injectable()
export class ShapeService implements IShapeService {
  private CoreService: ICoreService;
  // @inject(TYPES.ICore) private readonly CoreService!: ICoreService;

  //维护所有od框的container
  private shapContainer: Container<DisplayObject>;
  private rectList: Rect[] = [];
  private hoverShapId?: String | Number;
  private firstHoverShapTime?: DOMHighResTimeStamp;
  private selectShapId?: String | Number;
  private firstSelectShapTime?: DOMHighResTimeStamp;

  /* 缓存所有清理函数 */
  private destoryfnList: Function[] = [];

  private drawFn: DrawFn = drawFn.bind(this);

  constructor(
    @inject(TYPES.ICore)
    CoreService: ICoreService,
  ) {
    this.CoreService = CoreService;
    //所有shape 放到一个container
    this.shapContainer = new Container();
    this.shapContainer.zIndex = 1;

    this.CoreService.globalContainer.addChild(this.shapContainer);
    //事件监听
    let handlerClick = this.hitTest.bind(this, 'click');
    let handlerMouseOver = this.hitTest.bind(this, 'mousemove');

    this.CoreService.app.stage.addEventListener('click', handlerClick);
    this.CoreService.app.stage.addEventListener('mousemove', handlerMouseOver);

    this.destoryfnList.push(() => {
      this.CoreService.app.stage.removeEventListener('click', handlerClick);
      this.CoreService.app.stage.removeEventListener('mousemove', handlerMouseOver);
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
    this.shapContainer.children.forEach((v) => {
      (v as Graphics).clear();
      v.destroy();
      this.shapContainer.removeChild(v);
    });
    let allGraphicsList: Graphics[] = [];
    for (const item of this.rectList) {
      const { hoverShapId, selectShapId } = this;
      const scale = this.CoreService.globalContainer.localTransform.a;
      // let isHover = item['id'] === this.hoverShapId;
      // let isSelect = item['id'] === this.selectShapId;
      let graphicsList: Graphics[] = this.drawFn({
        firstSelectShapTime: this.firstSelectShapTime,
        firstHoverShapTime: this.firstHoverShapTime,
        hoverShapId,
        selectShapId,
        delta,
        item,
        scale,
      });
      allGraphicsList.push(...graphicsList);
    }
    if (allGraphicsList.length > 0) {
      this.shapContainer.addChild(...allGraphicsList);
    }
  }

  hitTest(eventType: 'click' | 'mousemove', event: FederatedPointerEvent) {
    let wordPoint = event.global.clone();
    //换local 坐标
    let localPoint = this.CoreService.globalContainer.localTransform.applyInverse(wordPoint);
    //碰撞检测
    let rectangles = this.rectList;
    let minDistance = Infinity;
    let nearestRectangle = null;

    for (let i = 0; i < rectangles.length; i++) {
      const rectangle = rectangles[i];
      let polygon = rectListToPolygon(rectangle);
      // 检查点是否在矩形内部
      if (pointInPolygon(localPoint, polygon)) {
        let dis = pointToPolygonDistance(localPoint, polygon);
        if (dis < minDistance) {
          minDistance = dis;
          nearestRectangle = rectangle;
        }
      }
    }
    if (nearestRectangle) {
      if (eventType == 'click') {
        this.selectShapId = nearestRectangle.id === this.selectShapId ? undefined : nearestRectangle?.id;
        this.firstSelectShapTime = performance.now();
      }
      if (eventType === 'mousemove' && nearestRectangle.id !== this.hoverShapId) {
        this.hoverShapId = nearestRectangle?.id;
        this.firstHoverShapTime = performance.now();
      }
    }
  }

  add(rect: Rect | Rect[]) {
    let rectList = isArray(rect) ? rect : [rect];
    this.rectList.push(...rectList);
  }

  /* 没传id 清理所有 */
  remove(id?: String | Number) {
    if (isNil(id)) {
      this.rectList.filter((v) => v['id'] !== id);
    } else {
      this.rectList = [];
    }
  }

  setDrawFn(drawFn: DrawFn) {
    this.drawFn = drawFn.bind(this);
  }

  destroy() {
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
    this.remove();
    this.shapContainer.destroy();
  }
}
