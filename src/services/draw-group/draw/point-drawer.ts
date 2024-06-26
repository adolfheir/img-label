// import { DEFAULT_POINT_STYLE, DrawEvent } from '../constant';
import { cloneDeep } from 'lodash';
import type { ICoreService } from '../../core/interface';
// import { DEFAULT_POINT_HELPER_CONFIG } from '../constant/helper';
import { DrawEvent, DEFAULT_POINT_HELPER_CONFIG } from '../constants';
import { PointMode } from '../mode';
import { IPointData, IRenderType, IMouseEvent, IPointHelperOptions, DeepPartial } from '../typings';
import { IBaseModeOptions } from '../typings/drawer';
import { getDefaultPointProperties, isSameData } from '../utils/data';

export interface IPointDrawerOptions extends IBaseModeOptions<IPointData> {
  helper: IPointHelperOptions | boolean;
}

export class PointDrawer extends PointMode<IPointDrawerOptions> {
  constructor(CoreService: ICoreService, options: DeepPartial<IPointDrawerOptions>) {
    super(CoreService, options);

    this.bindPointRenderEvent();
  }

  protected get dragItem() {
    return this.dragPoint;
  }

  protected get editItem() {
    return this.editPoint;
  }

  getDefaultOptions(options: DeepPartial<IPointDrawerOptions>) {
    const defaultOptions = {
      ...this.getCommonOptions(options),
      helper: cloneDeep(DEFAULT_POINT_HELPER_CONFIG),
      initialData: options.initialData as IPointData[] | undefined,
    };
    return defaultOptions;
  }

  bindEnableEvent(): void {
    super.bindEnableEvent();
    this.enablePointRenderAction();
  }

  unbindEnableEvent(): void {
    super.unbindEnableEvent();
    this.disablePointRenderAction();
  }

  getRenderTypes(): IRenderType[] {
    return ['point'];
  }

  setData(points: IPointData[]) {
    this.setPointData(
      points.map((point) => {
        point.properties = {
          ...getDefaultPointProperties(),
          ...(point.properties ?? {}),
        };
        return point as IPointData;
      }),
    );
  }

  getData() {
    return this.getPointData();
  }

  onPointCreate(e: IMouseEvent<IPointData>): IPointData | undefined {
    if (!this.calcLimitAble(e.localPoint)) return;

    if (!this.addable) {
      this.setPointData((dataList) => {
        return dataList.map((data) => {
          data.properties = {
            ...data.properties,
            isHover: false,
            isActive: false,
          };
          return data;
        });
      });
      return;
    }
    const newData = super.onPointCreate(e);
    if (!newData) {
      return;
    }
    if (this.options.editable) {
      this.setHelper('pointHover');
    }
    this.emit(DrawEvent.Add, newData, this.getData());
    return newData;
  }

  onPointMouseMove(e: IMouseEvent<IPointData>) {
    const data = super.onPointMouseMove(e);
    if (this.options.editable && !this.dragPoint) {
      this.setHelper('pointHover');
    }
    return data;
  }

  onPointMouseOut(e: IMouseEvent<IPointData>) {
    const data = super.onPointMouseOut(e);
    this.setHelper(this.addable ? 'draw' : null);
    return data;
  }

  onPointDragStart(e: IMouseEvent<IPointData>) {
    const dragPoint = super.onPointDragStart(e);
    this.setHelper('pointDrag');
    this.emit(DrawEvent.DragStart, dragPoint, this.getData());
    return dragPoint;
  }

  onPointDragging(e: IMouseEvent<IPointData>) {
    const dragPoint = super.onPointDragging(e);
    if (dragPoint && this.options.editable) {
      this.emit(DrawEvent.Dragging, dragPoint, this.getData());
    }
    return dragPoint;
  }

  onPointDragEnd(e: IMouseEvent<IPointData>) {
    const dragPoint = super.onPointDragEnd(e);
    if (dragPoint && this.options.editable) {
      this.setHelper('pointHover');
      this.emit(DrawEvent.DragEnd, dragPoint, this.getData());
      this.emit(DrawEvent.Edit, dragPoint, this.getData());
    }
    return dragPoint;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onSceneMouseMove(e: IMouseEvent): void {}

  setActiveData(target: IPointData | string | null | undefined) {
    const targetData = this.getTargetData(target);
    this.setPointData((oldData) =>
      oldData.map((data) => {
        data.properties.isActive = isSameData(targetData, data);
        return data;
      }),
    );
  }

  resetFeatures() {
    this.setPointData((dataList) => {
      return dataList.map((data) => {
        data.properties = {
          ...data.properties,
          isDrag: false,
          isActive: false,
          isHover: false,
        };
        return data;
      });
    });
  }
}
