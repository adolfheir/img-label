/* 此处维护container作为缩放矩阵的画布 */
import { isFunction, isNil } from 'lodash';
import { isArray } from 'lodash';
import { SmoothGraphics as Graphics, DashLineShader } from '@pixi/graphics-smooth';
import EventEmitter from 'eventemitter3';
import { injectable, inject } from 'inversify';
import { Container, DisplayObject, FederatedPointerEvent } from 'pixi.js';
import { TYPES } from '../../types';
import type { ICoreService } from '../core/interface';
import drawFn from './draw';
import { IShapeService, Shape, DrawFn, ShapeServiceEvent } from './interface';
import { pointInPolygon, pointToPolygonDistance, rectListToPolygon } from './utils';

@injectable()
export class ShapeService<T extends Shape> extends EventEmitter<`${ShapeServiceEvent}`> implements IShapeService<T> {
  private CoreService: ICoreService;
  // @inject(TYPES.ICore) private readonly CoreService!: ICoreService;

  //维护所有od框的container
  private shapContainer: Container<DisplayObject> | undefined = undefined;

  private rectList: T[] = [];

  private hoverShapId?: String | Number;
  private lastHoverTime?: DOMHighResTimeStamp;
  private selectShapId?: String | Number;
  private lastSelectTime?: DOMHighResTimeStamp;

  /* 缓存所有清理函数 */
  private destoryfnList: Function[] = [];

  private drawFn: DrawFn<T> = drawFn.bind(this);

  constructor(
    @inject(TYPES.ICore)
    CoreService: ICoreService,
  ) {
    super();
    this.CoreService = CoreService;
  }
  init() {
    //所有shape 放到一个container
    this.shapContainer = new Container();
    this.shapContainer.zIndex = 1;
    this.CoreService.globalContainer.addChild(this.shapContainer);
    //事件监听
    let handlerClick = this.hitTest.bind(this, 'mousedown');
    let handlerMouseOver = this.hitTest.bind(this, 'mousemove');

    this.CoreService.app.stage.addEventListener('mousedown', handlerClick);
    this.CoreService.app.stage.addEventListener('mousemove', handlerMouseOver);

    this.destoryfnList.push(() => {
      this.CoreService.app.stage.removeEventListener('mousedown', handlerClick);
      this.CoreService.app.stage.removeEventListener('mousemove', handlerMouseOver);
    });

    //启动循环
    let loop = this.loop.bind(this);
    this.CoreService.app.ticker.add(loop);
    this.destoryfnList.push(() => {
      this.CoreService.app.ticker.remove(loop);
    });
  }

  //渲染：每次都重新new Graphics 数据不大的case 更灵活
  loop(delta: number) {
    let removeList = this.shapContainer?.removeChildren();
    (removeList ?? []).forEach((v) => v?.destroy?.());

    let allGraphicsList: Graphics[] = [];

    //排序
    let getWeight = (a: T) => {
      if (this.selectShapId == a?.id) {
        return 2;
      } else if (this.hoverShapId == a?.id) {
        return 1;
      } else {
        return 0;
      }
    };

    let rectList = this.rectList.sort((a, b) => {
      return getWeight(a) - getWeight(b);
    });

    for (const item of rectList) {
      const { hoverShapId, selectShapId } = this;
      const scale = this.CoreService.globalContainer.localTransform.a;
      // let isHover = item['id'] === this.hoverShapId;
      // let isSelect = item['id'] === this.selectShapId;
      let graphicsList: Graphics[] = this.drawFn({
        lastSelectTime: this.lastSelectTime,
        lastHoverTime: this.lastHoverTime,
        hoverShapId,
        selectShapId,
        delta,
        item,
        scale,
      });
      allGraphicsList.push(...graphicsList);
    }
    if (allGraphicsList.length > 0) {
      this.shapContainer?.addChild(...allGraphicsList);
    }
  }

  hitTest(eventType: 'mousedown' | 'mousemove', event: FederatedPointerEvent) {
    let wordPoint = event.global.clone();
    //换local 坐标
    let localPoint = this.CoreService.globalContainer.localTransform.applyInverse(wordPoint);
    //碰撞检测
    let rectangles = this.rectList;
    let minDistance = Infinity;
    let nearestRectangle = null;

    for (let i = 0; i < rectangles.length; i++) {
      const rectangle = rectangles[i];

      const { selectAble = true, hoverAbele = true } = rectangle;
      if ((eventType == 'mousedown' && !selectAble) || (eventType === 'mousemove' && !hoverAbele)) {
        continue;
      }
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
      if (eventType == 'mousedown') {
        this.selectShapId = nearestRectangle.id === this.selectShapId ? undefined : nearestRectangle?.id;
        this.lastSelectTime = performance.now();
      }
      if (eventType === 'mousemove' && nearestRectangle.id !== this.hoverShapId) {
        this.hoverShapId = nearestRectangle?.id;
        this.lastHoverTime = performance.now();
      }
    } else {
      //hover的时候取消
      if (eventType === 'mousemove') {
        this.hoverShapId = undefined;
        this.lastHoverTime = performance.now();
      }
      if (eventType == 'mousedown') {
        this.selectShapId = undefined;
        this.lastSelectTime = performance.now();
      }
    }

    if (eventType == 'mousedown') {
      this.emit(ShapeServiceEvent['onShapeSelectChange'], {
        selectShapId: this.selectShapId,
      });
    }
  }

  add(rect: T | T[]) {
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

  replace(replaceHandle: (T | T[]) | ((d: T[]) => T | T[])) {
    let data: T | T[] = [];
    if (isFunction(replaceHandle)) {
      data = replaceHandle(this.rectList);
    } else {
      data = replaceHandle;
    }
    this.rectList = isArray(data) ? data : [data];
  }

  setDrawFn(drawFn: DrawFn<T>) {
    this.drawFn = drawFn.bind(this);
  }

  resetState() {
    this.hoverShapId = undefined;
    this.lastHoverTime = undefined;
    this.selectShapId = undefined;
    this.lastSelectTime = undefined;
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
    //清理事件监听
    this.removeAllListeners();

    this.remove();
    this.resetState();

    //清理容器
    if (this.shapContainer) {
      this.CoreService?.globalContainer.removeChild(this.shapContainer);
    }
    let removeList = this.shapContainer?.removeChildren();
    (removeList ?? []).forEach((v) => v?.destroy?.());
    this.shapContainer?.destroy();
  }
}
