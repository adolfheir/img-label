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
import { IPointData, IMidPointData } from '../typings';
import { SmoothGraphics as Graphics, DashLineShader } from '@pixi/graphics-smooth';
import CustomContainer from './custom-continer';
import { pointToPointDistance } from './utils';

export class MidPointRender extends BaseRender<IMidPointData> {
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
        // const fillColor = isActive ? 0xed9d47 : 0xF14E4E; // 内圆填充颜色
        // const fillThickness = isHover ? 6 : 3; // 内圆边框宽度
        const fillColor = 0xed9d47;
        const fillThickness = 6;
        // const strokeThickness = 1; // 边框宽度

        // graphics.lineStyle(strokeThickness / scale, strokeColor);
        graphics.beginFill(fillColor);
        graphics.drawCircle(x, y, fillThickness / scale);
        graphics.endFill();

        return graphics;
      });
      this.container.addChild(...graphicsList);
    }
  }

  getDis(item: IMidPointData, localPoint: Point): number {
    let dis = pointToPointDistance(localPoint, item.data);
    return dis;
  }

  onMouseMove = (e: FederatedPointerEvent) => {
    this.emit(RenderEvent.Mousemove, this.formatEvent(e));
  };

  onMouseOut = (e: FederatedPointerEvent) => {
    this.emit(RenderEvent.Mouseout, this.formatEvent(e));
  };

  onClick = (e: FederatedPointerEvent) => {
    this.emit(RenderEvent.Click, this.formatEvent(e));
  };

  enableHover() {
    this.disableHover();
    this.container.addEventListener(ContainerEvent.Mousemove, this.onMouseMove);
    this.container.addEventListener(ContainerEvent.Mouseout, this.onMouseOut);
  }

  disableHover() {
    this.container.removeEventListener(ContainerEvent.Mousemove, this.onMouseMove);
    this.container.removeEventListener(ContainerEvent.Mouseout, this.onMouseOut);
  }

  enableClick() {
    this.disableClick();
    //其实效果要求的是mousedown
    this.container.addEventListener(ContainerEvent.Click, this.onClick);
  }

  disableClick() {
    this.container.removeEventListener(ContainerEvent.Click, this.onClick);
  }
}
