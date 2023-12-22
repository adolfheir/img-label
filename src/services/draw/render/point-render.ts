import EventEmitter from 'eventemitter3';
import { injectable, inject } from 'inversify';
import { debounce } from 'lodash';
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
import { IBsaeData } from '../typings/source';
import { ContainerEvent, StageEvent, RenderEvent } from '../constants';
import { BaseRender } from './base-render';
import { IPointData } from '../typings';
import { SmoothGraphics as Graphics, DashLineShader } from '@pixi/graphics-smooth';
import CustomContainer from './custom-continer';
import { pointToPointDistance, pointInPolygon, pointToPolygonDistance, pointToSegmentDistance } from './utils';

type PreviousClick = {
  time: number;
  x: number;
  y: number;
};

export class PointRender extends BaseRender<IPointData> {
  render(delta: number) {
    this.container.children.forEach((v) => {
      (v as Graphics).clear();
      v.destroy();
      this.container.removeChild(v);
    });
    if (this.data.length > 0) {
      let scale = this.getScale();
      let graphicsList = this.data.map((item) => {
        const { data, properties } = item;
        const { x, y } = data;
        const { isActive, isHover } = properties;

        let graphics = new Graphics();
        // 设置绘制样式
        const fillColor = isActive ? 0xed9d47 : 0x2c90ff; // 内圆填充颜色
        const fillThickness = isHover ? 8 : 6; // 内圆边框宽度
        const strokeColor = 0xffffff; // 边框颜色
        const strokeThickness = 2; // 边框宽度

        graphics.lineStyle(strokeThickness / scale, strokeColor);
        graphics.beginFill(fillColor);
        graphics.drawCircle(x, y, fillThickness / scale);
        graphics.endFill();

        return graphics;
      });
      this.container.addChild(...graphicsList);
    }
  }

  getDis = (item: IPointData, localPoint: Point) => {
    let dis = pointToPointDistance(localPoint, item.data);
    return dis;
  };

  /* 点击事件 */
  private previousUnclick?: PreviousClick;
  private unclickAble: boolean = false;
  private onAbleUnclick = (e: FederatedPointerEvent) => {
    const { x = 0, y = 0 } = e.global;
    const time = Date.now();
    this.previousUnclick = { x, y, time };
    this.unclickAble = true;
  };
  private onDisableUnclick = (e: FederatedPointerEvent) => {
    const { x = 0, y = 0 } = e.global;
    const time = Date.now();

    if (this.previousUnclick) {
      const { x: oldX, y: oldY, time: oldTime } = this.previousUnclick;
      if (time - oldTime < 300 && Math.abs(x - oldX) < 5 && Math.abs(y - oldY) < 5) {
      } else {
        this.unclickAble = false;
      }
    } else {
      this.unclickAble = false;
    }
  };

  onUnclick = (e: FederatedPointerEvent) => {
    // let isUnclick = (e.target as CustomContainer)?.__IS_DRAW_CONTAINER__ !== true
    let isUnclick = (e.target as CustomContainer) !== this.container;
    if (isUnclick && this.unclickAble) {
      this.emit(RenderEvent.UnClick, this.formatEvent(e));
    }
    this.unclickAble = false;
  };

  onMouseMove = (e: FederatedPointerEvent) => {
    this.emit(RenderEvent.Mousemove, this.formatEvent(e));
  };

  onMouseOut = (e: FederatedPointerEvent) => {
    this.emit(RenderEvent.Mouseout, this.formatEvent(e));
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

  onClick = (e: FederatedPointerEvent) => {
    this.emit(RenderEvent.Click, this.formatEvent(e));
  };

  onContextmenu = (e: FederatedPointerEvent) => {
    this.emit(RenderEvent.Contextmenu, this.formatEvent(e));
  };

  enableUnClick() {
    this.disableUnClick();
    this.stage.addEventListener(StageEvent.Mousedown, this.onAbleUnclick);
    this.stage.addEventListener(StageEvent.Mousemove, this.onDisableUnclick);
    this.stage.addEventListener(StageEvent.Click, this.onUnclick);
  }

  disableUnClick() {
    this.unclickAble = false;
    this.stage.removeListener(StageEvent.Mousedown, this.onAbleUnclick);
    this.stage.removeListener(StageEvent.Mousemove, this.onDisableUnclick);
    this.stage.removeListener(StageEvent.Mouseup, this.onUnclick);
  }

  enableHover() {
    this.disableHover();
    this.container.addEventListener(ContainerEvent.Mousemove, this.onMouseMove);
    this.container.addEventListener(ContainerEvent.Mouseout, this.onMouseOut);
  }

  disableHover() {
    this.container.removeEventListener(ContainerEvent.Mousemove, this.onMouseMove);
    this.container.removeEventListener(ContainerEvent.Mouseout, this.onMouseOut);
  }

  enableDrag() {
    this.disableDrag();
    this.container.addEventListener(ContainerEvent.Mousedown, this.onMouseDown);
    this.stage.addEventListener(StageEvent.Mousemove, this.onDragging);
    this.stage.addEventListener(StageEvent.Mouseup, this.onDragEnd);
  }

  disableDrag() {
    this.container.removeEventListener(ContainerEvent.Mousedown, this.onMouseDown);
    this.stage.removeEventListener(StageEvent.Mousemove, this.onDragging);
    this.stage.removeEventListener(StageEvent.Mouseup, this.onDragEnd);
  }

  enableClick() {
    this.disableClick();
    this.container.addEventListener(ContainerEvent.Click, this.onClick);
  }

  disableClick() {
    this.container.removeEventListener(ContainerEvent.Click, this.onClick);
  }

  enableContextMenu() {
    this.disableContextMenu();
    this.container.addEventListener(ContainerEvent.Contextmenu, this.onContextmenu);
  }

  disableContextMenu() {
    this.container.removeEventListener(ContainerEvent.Contextmenu, this.onContextmenu);
  }
}
