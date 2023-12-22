import EventEmitter from 'eventemitter3';
import { injectable, inject } from 'inversify';
import { debounce, isArray } from 'lodash';
import {
  Assets,
  Sprite,
  Container,
  DisplayObject,
  FederatedPointerEvent,
  ObservablePoint,
  Matrix,
  Transform,
  Polygon,
  State,
  Point,
  Graphics,
  GraphicsData,
  GraphicsGeometry,
} from 'pixi.js';
import { IBsaeData } from '../typings/source';
import { ContainerEvent, StageEvent, RenderEvent } from '../constants';
import { BaseRender } from './base-render';
import { IPointData, ILineData } from '../typings';
// import { SmoothGraphics as Graphics, DashLineShader } from '@pixi/graphics-smooth';
import CustomContainer from './custom-continer';
import { pointToSegmentDistance, pointToMultipleLine, MultipleLine2Polygon, sortPoints, mock } from './utils';

// hack方案 缓存一个数组 geometry.points只能在nextTick获取在这边实现
let hitAreaTempMap: { [key: string]: any } = {};

type PreviousClick = {
  time: number;
  x: number;
  y: number;
};

export class LineRender extends BaseRender<ILineData> {
  render(delta: number) {
    this.container.children.forEach((v) => {
      //@ts-ignore
      // let id: string = v["__ID__"];
      // hitAreaTempMap[id] = (v as Graphics).geometry.points;
      // console.log("point", (v as Graphics).geometry.points);

      (v as Graphics).clear();
      v.destroy();
      this.container.removeChild(v);
    });

    let scale = this.getScale();

    let graphicsList = this.data
      .filter((v) => v['data'].length >= 2)
      .map((item) => {
        const { data, properties } = item;
        const { isActive, isHover, id } = properties;

        const color = isActive ? 0xed9d48 : 0x1990ff; // 内圆填充颜色
        let width = 2;

        let graphics = new Graphics();
        // 设置线条样式
        graphics.lineStyle(width / scale, color, 1); // 参数1：线宽，参数2：颜色

        // 绘制线条
        for (let i = 0; i < data.length; i++) {
          const item = data[i];
          if (i === 0) {
            graphics.moveTo(item.x, item.y); // 设置起点坐标
          } else {
            graphics.lineTo(item.x, item.y); // 绘制到指定坐标
          }
        }

        //TODO: 选线段
        // let polygon = MultipleLine2Polygon(data, (width / scale) + 2) //给 4px buffer
        // // console.log("point", graphics.geometry.points)
        // graphics.beginFill(color);
        // // graphics.drawPolygon(...polygon.map(v => new Point(v.x, v.y)));
        // graphics.drawPolygon(...sortPoints(mock));
        // // graphics.drawPolygon(mock);
        // graphics.endFill();

        // 暂时简单处理点击区域
        // 复杂处理see https://www.cnblogs.com/3body/p/14981937.html
        //@ts-ignore
        graphics['__ID__'] = id;
        if (isArray(hitAreaTempMap[id])) {
          let points = sortPoints(hitAreaTempMap[id]);
          // graphics.hitArea = new Polygon(...points)
        }

        return graphics;
      });
    if (graphicsList.length > 0) {
      this.container.addChild(...graphicsList);
    }
  }

  getDis = (item: ILineData, localPoint: Point) => {
    if (item.data.length < 2) {
      return Number.MAX_SAFE_INTEGER;
    }
    let dis = pointToMultipleLine(localPoint, item.data);
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
    let isUnclick = (e.target as CustomContainer)?.__IS_DRAW_CONTAINER__ !== true;
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
}
