import { isEqual } from 'lodash';
import EventEmitter from 'eventemitter3';
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
  Point,
} from 'pixi.js';
import type { ICoreService } from '../../core/interface';
import { IMouseEvent } from '../typings';
import { IBsaeData, IPointData, Position } from '../typings/source';
import { getUuid } from '../utils/data';
import { CustomContainer } from './custom-continer';
import { pointToPointDistance, pointToPolygonDistance, pointToSegmentDistance } from './utils';

export abstract class BaseRender<T = IBsaeData> extends EventEmitter {
  /**
   * 全局service
   */
  protected CoreService: ICoreService;

  /**
   * stage
   */
  protected stage: Container;

  /**
   * 图层container
   */
  protected container: Container<DisplayObject>;

  /**
   * 当前展示的数据
   */
  protected data: T[] = [];

  /**
   * hidden
   */
  protected isHidden: boolean = false;

  /**
   * 缓存所有清理函数
   */
  protected destoryfnList: Function[] = [];

  constructor(CoreService: ICoreService) {
    super();

    this.CoreService = CoreService;

    this.container = new CustomContainer(getUuid('draw-container'));
    this.container.eventMode = 'static';
    this.CoreService.globalContainer.addChild(this.container);

    this.stage = this.CoreService.app.stage;
  }

  /**
   * 子类继承时需要实现该方法并实现渲染
   */
  abstract render(): void;

  protected getScale() {
    return this.CoreService.globalContainer.localTransform.a;
  }

  /**
   * 显示所有图层
   */
  show() {
    this.isHidden = false;
  }

  /**
   * 隐藏所有图层
   */
  hide() {
    this.isHidden = true;
  }

  /**
   * 设置数据
   * @param features 设置对应的Feature数组
   */
  setData(data: T[]) {
    this.data = data;
    this.render();
  }

  /**
   * 子类继承时需要实现该方法
   */
  abstract getDis(item: T, localPoint: Point): number;

  formatEvent = (event: FederatedPointerEvent, debug = false) => {
    //坐标转换
    let wordPoint: Point;
    let localPoint: Point;
    wordPoint = event.global.clone();
    localPoint = this.CoreService.globalContainer.localTransform.applyInverse(wordPoint);
    //找出最接近的数据
    let source;
    let min = Number.MAX_SAFE_INTEGER;
    // if ((event.target as CustomContainer)?.__IS_DRAW_CONTAINER__ == true) {
    if (event.target == this.container) {
      // console.log('targegt', event.target)
      for (let i = 0; i < this.data.length; i++) {
        const item = this.data[i];
        let dis = this.getDis(item, localPoint);
        if (dis < min) {
          source = item;
          min = dis;
        }
        if (debug) {
          //@ts-ignore
          // console.log('dis', item.properties.id, dis, item, localPoint);
        }
      }
      //@ts-ignore
      // console.log('end', source?.properties?.id, this.data);
    }

    return {
      wordPoint,
      localPoint,
      source,
    } as IMouseEvent<T>;
  };

  formatDocumentEvent = (event: MouseEvent, source?: T) => {
    const { clientX, clientY } = event;
    // 获取目标元素的边界框
    const rect = this.CoreService.dom!.getBoundingClientRect();
    // 计算点击位置相对于目标元素的坐标
    const offsetX = clientX - rect.left;
    const offsetY = clientY - rect.top;
    let wordPoint = {
      x: offsetX,
      y: offsetY,
    };
    const localPoint = this.CoreService.globalContainer.localTransform.applyInverse(wordPoint);
    let formatEvent = {
      wordPoint,
      localPoint,
      source: source,
    };
    return formatEvent;
  };

  /**
   * render销毁时，需要删除container &ticket
   */
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
    this.removeAllListeners();
    this.container?.destroy();
  }
}
