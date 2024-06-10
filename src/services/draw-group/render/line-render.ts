import { debounce, isArray } from 'lodash';
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
  Polygon,
  State,
  Point,
  Graphics,
  GraphicsData,
  GraphicsGeometry,
} from 'pixi.js';
import { ContainerEvent, StageEvent, RenderEvent, DocumentEvent } from '../constants';
import { IPointData, ILineData } from '../typings';
import { IBsaeData } from '../typings/source';
import { BaseRender } from './base-render';
// import { SmoothGraphics as Graphics, DashLineShader } from '@pixi/graphics-smooth';
import CustomContainer from './custom-continer';
import { pointToSegmentDistance, pointToMultipleLine, sortPoints } from './utils';

// hack方案 缓存一个数组 geometry.points只能在nextTick获取在这边实现

type PreviousClick = {
  time: number;
  x: number;
  y: number;
};

export class LineRender extends BaseRender<ILineData> {
  render() {
    let removeList = this.container.removeChildren();
    removeList.map((v) => v?.destroy?.());

    let scale = this.getScale();
    let graphicsList = this.data
      .filter((v) => v['data'].length >= 2)
      .map((item) => {
        const { data, properties } = item;
        const { isActive, isHover, id } = properties;

        const color = isActive ? 0xed9d48 : 0x1990ff; // 内圆填充颜色
        let width = 2;

        let graphics = new Graphics();
        // graphics.interactive = true;
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

        // 实现点击热区
        // see https://www.cnblogs.com/3body/p/14981937.html
        //see https://github.com/bigtimebuddy/pixi-v6-line-hitarea-example/blob/master/src/index.ts
        function lineToPolygon(distance: number, points: number[]) {
          const numPoints = points.length / 2;
          const output = new Array(points.length * 2);
          for (let i = 0; i < numPoints; i++) {
            const j = i * 2;

            // Position of current point
            const x = points[j];
            const y = points[j + 1];

            // Start
            const x0 = points[j - 2] !== undefined ? points[j - 2] : x;
            const y0 = points[j - 1] !== undefined ? points[j - 1] : y;

            // End
            const x1 = points[j + 2] !== undefined ? points[j + 2] : x;
            const y1 = points[j + 3] !== undefined ? points[j + 3] : y;

            // Get the angle of the line
            const a = Math.atan2(-x1 + x0, y1 - y0);
            const deltaX = distance * Math.cos(a);
            const deltaY = distance * Math.sin(a);

            // Add the x, y at the beginning
            output[j] = x + deltaX;
            output[j + 1] = y + deltaY;

            // Add the reflected x, y at the end
            output[output.length - 1 - j - 1] = x - deltaX;
            output[output.length - 1 - j] = y - deltaY;
          }
          // close the shape
          output.push(output[0], output[1]);

          return new Polygon(output);
        }
        const shape = lineToPolygon(graphics.line.width * 2 + 1, graphics.currentPath.points);
        graphics.hitArea = shape;

        return graphics;
      });
    //先渲染

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
    const time = performance.now();
    this.previousUnclick = { x, y, time };
    this.unclickAble = true;
  };
  private onDisableUnclick = (e: FederatedPointerEvent) => {
    const { x = 0, y = 0 } = e.global;
    const time = performance.now();

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

  private dragSource: ILineData | undefined;

  onMouseDown = (e: FederatedPointerEvent) => {
    e.stopPropagation();
    e.stopPropagation();
    let formatEvent = this.formatEvent(e);
    this.dragSource = formatEvent.source;
    this.emit(RenderEvent.Dragstart, formatEvent);
  };

  onDragging = (e: MouseEvent) => {
    if (this.dragSource) {
      this.emit(RenderEvent.Dragging, this.formatDocumentEvent(e, this.dragSource));
    }
  };

  private debounceOnDragEnd = debounce((e: MouseEvent, source?: ILineData) => {
    this.emit(RenderEvent.Dragend, this.formatDocumentEvent(e, source));
  }, 0);

  onDragEnd = (e: MouseEvent) => {
    let dragSource = this.dragSource;
    this.dragSource = undefined;
    this.debounceOnDragEnd(e, dragSource);
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
    document.addEventListener(DocumentEvent.Mousemove, this.onDragging);
    document.addEventListener(DocumentEvent.Mouseup, this.onDragEnd);
  }

  disableDrag() {
    this.container.removeEventListener(ContainerEvent.Mousedown, this.onMouseDown);
    document.removeEventListener(DocumentEvent.Mousemove, this.onDragging);
    document.removeEventListener(DocumentEvent.Mouseup, this.onDragEnd);
  }
}
