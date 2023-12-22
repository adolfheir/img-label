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
import { IBsaeData, IDashLineData } from '../typings/source';
import { ContainerEvent, StageEvent, RenderEvent } from '../constants';
import { BaseRender } from './base-render';
import { IPointData, IMidPointData } from '../typings';
import { SmoothGraphics as Graphics, DashLineShader } from '@pixi/graphics-smooth';
import CustomContainer from './custom-continer';
import { pointToPointDistance, pointToPolygonDistance, pointToSegmentDistance } from './utils';

const dashShader = new DashLineShader({ dash: 5, gap: 5 });

export class DashLineRender extends BaseRender<IDashLineData> {
  render(delta: number) {
    this.container.children.forEach((v) => {
      (v as Graphics).clear();
      v.destroy();
      this.container.removeChild(v);
    });
    let scale = this.getScale();
    let graphicsList = this.data
      .filter((v) => v['data'].length >= 2)
      .map((item) => {
        const { data, properties } = item;
        const { isActive, isHover } = properties;

        const color = 0xed9d48;
        let size = 2;

        let graphics = new Graphics();
        // 设置线条样式
        graphics.lineStyle({
          width: size / scale,
          color: color,
          shader: dashShader,
        }); // 参数1：线宽，参数2：颜色

        // 绘制线条
        for (let i = 0; i < data.length; i++) {
          const item = data[i];
          if (i === 0) {
            graphics.moveTo(item.x, item.y); // 设置起点坐标
          } else {
            graphics.lineTo(item.x, item.y); // 绘制到指定坐标
          }
        }

        return graphics;
      });

    if (graphicsList.length > 0) {
      this.container.addChild(...graphicsList);
    }
  }

  getDis(item: IDashLineData, localPoint: Point): number {
    return 0;
  }
}
