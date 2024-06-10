import { RenderEvent } from '../constants';
import { MidPointRender } from '../render';
import { DeepPartial, ILineData, IMidPointData, DataUpdater, IMouseEvent, IPointData, IBsaeData } from '../typings';
import { IBaseModeOptions } from '../typings/drawer';
import { getUuid } from '../utils/data';
import { BaseMode } from './base-mode';
import { PointMode } from './point-mode';

export interface IMidPointModeOptions<F extends IBsaeData = IBsaeData> extends IBaseModeOptions<F> {
  showMidPoint: boolean;
}

export abstract class MidPointMode<T extends IMidPointModeOptions> extends PointMode<T> {
  /**
   * 获取midPoint类型对应的render
   * @protected
   */
  protected get midPointRender(): MidPointRender | undefined {
    return this.render.midPoint;
  }

  getCommonOptions(options: DeepPartial<T>): T {
    // @ts-ignore
    return {
      ...super.getCommonOptions(options),
      showMidPoint: true,
    };
  }

  bindMidPointRenderEvent() {
    this.midPointRender?.on(RenderEvent.Click, this.onMidPointClick.bind(this));
    this.midPointRender?.on(RenderEvent.Mousemove, this.onMidPointHover.bind(this));
    this.midPointRender?.on(RenderEvent.Mouseout, this.onMidPointUnHover.bind(this));
  }

  /**
   * 获取中点数据
   */
  getMidPointData() {
    return this.source.getRenderData<IMidPointData>('midPoint');
  }

  /**
   * 设置中点数据
   * @param data
   */
  setMidPointData(data: DataUpdater<IMidPointData>) {
    return this.source.setRenderData('midPoint', data);
  }

  /**
   * 计算并返回传入线段的中点数组
   * @param line
   */
  getMidPointsByLine(line: ILineData): IMidPointData[] {
    const nodes = line.properties.nodes;
    if (!this.options.showMidPoint || nodes.length < 2) {
      return [];
    }
    const midPoints: IMidPointData[] = [];
    for (let index = 0; index < nodes.length - 1; index++) {
      const point1 = nodes[index].data;
      const point2 = nodes[index + 1].data;

      const midX = (point1.x + point2.x) / 2;
      const midY = (point1.y + point2.y) / 2;
      const center = { x: midX, y: midY };

      const newMidPoint = {
        data: center,
        properties: {
          id: getUuid('midPoint'),
          startId: nodes[index].properties?.id ?? '',
          endId: nodes[index + 1].properties?.id ?? '',
        },
      } as IMidPointData;

      midPoints.push(newMidPoint);
    }
    return midPoints;
  }

  abstract onMidPointClick(e: IMouseEvent<IMidPointData>): IPointData | undefined;

  onMidPointHover(e: IMouseEvent<IMidPointData>) {
    this.setCursor('pointHover');
  }

  onMidPointUnHover(e: IMouseEvent<IMidPointData>) {
    this.resetCursor();
  }

  enableMidPointRenderAction() {
    this.midPointRender?.enableClick();
    this.midPointRender?.enableHover();
  }

  disableMidPointRenderAction() {
    this.midPointRender?.disableClick();
    this.midPointRender?.disableHover();
  }
}
