import EventEmitter from 'eventemitter3';
import { debounce } from 'lodash';
import { BaseMode } from '../mode';
import {
  Assets,
  Sprite,
  Container,
  DisplayObject,
  FederatedPointerEvent,
  ObservablePoint,
  Matrix,
  Transform,
  State,
  Point,
} from 'pixi.js';
import { ContainerEvent, StageEvent, RenderEvent } from '../constants';
import { IBsaeData, IPointData, Position } from '../typings/source';
import { IMouseEvent } from '../typings';
import type { ICoreService } from '../../core/interface';

type PreviousClick = {
  time: number;
  x: number;
  y: number;
};

export class SceneRender extends EventEmitter {
  /**
   * 全局service
   */
  protected CoreService: ICoreService;

  /**
   * stage
   */
  protected stage: Container;

  constructor(CoreService: ICoreService) {
    super();
    this.CoreService = CoreService;
    this.stage = this.CoreService.app.stage;
  }

  private previousClick?: PreviousClick;
  onDblClick = (e: FederatedPointerEvent) => {
    const { x = 0, y = 0 } = e.global;
    const time = Date.now();

    if (this.previousClick) {
      const { x: oldX, y: oldY, time: oldTime } = this.previousClick;
      if (time - oldTime < 300 && Math.abs(x - oldX) < 5 && Math.abs(y - oldY) < 5) {
        this.emit(RenderEvent.DblClick, this.formatEvent(e));
      }
    }
    this.previousClick = { x, y, time };
  };

  onMouseMove = (e: FederatedPointerEvent) => {
    this.emit(RenderEvent.Mousemove, this.formatEvent(e));
  };

  private isDrag = false;

  onMouseDown = (e: FederatedPointerEvent) => {
    e.stopPropagation();
    this.isDrag = true;
    this.emit(RenderEvent.Dragstart, this.formatEvent(e));
  };

  onDragging = (e: FederatedPointerEvent) => {
    if (this.isDrag) {
      this.emit(RenderEvent.Dragging, this.formatEvent(e));
    }
  };

  private debounceOnDragEnd = debounce((e: FederatedPointerEvent) => {
    this.emit(RenderEvent.Dragend, this.formatEvent(e));
  }, 0);

  onDragEnd = (e: FederatedPointerEvent) => {
    this.isDrag = false;
    this.debounceOnDragEnd(e);
  };

  enableDrag() {
    this.disableDrag();
    this.stage.addEventListener(StageEvent.Mousedown, this.onMouseDown);
    this.stage.addEventListener(StageEvent.Mousemove, this.onDragging);
    this.stage.addEventListener(StageEvent.Mouseup, this.onDragEnd);
  }

  disableDrag() {
    this.stage.removeEventListener(StageEvent.Mousedown, this.onMouseDown);
    this.stage.removeEventListener(StageEvent.Mousemove, this.onDragging);
    this.stage.removeEventListener(StageEvent.Mouseup, this.onDragEnd);
  }

  enableMouseMove() {
    this.disableMouseMove();
    this.stage.addEventListener(StageEvent.Mousemove, this.onMouseMove);
  }

  disableMouseMove() {
    this.stage.removeEventListener(StageEvent.Mousemove, this.onMouseMove);
  }

  enableDblClick() {
    this.disableDblClick();
    this.stage.addEventListener(StageEvent.Mousedown, this.onDblClick);
  }

  disableDblClick() {
    this.stage.removeEventListener(StageEvent.Mousedown, this.onDblClick);
  }

  formatEvent = (event: FederatedPointerEvent, debug = false) => {
    //坐标转换
    let wordPoint: Point;
    let localPoint: Point;
    wordPoint = event.global.clone();
    localPoint = this.CoreService.globalContainer.localTransform.applyInverse(wordPoint);

    //找出最接近的数据
    // let source
    // let min = Number.MAX_SAFE_INTEGER

    return {
      wordPoint,
      localPoint,
      // source
    } as IMouseEvent<IBsaeData>;
  };

  /**
   * render销毁时，需要删除container &ticket
   */
  destroy() {
    this.removeAllListeners();
  }
}
