import { RenderEvent } from '../constants';
import { PointRender } from '../render';
import { IMouseEvent, IPointData, DataUpdater, Position } from '../typings';
import { IBaseModeOptions } from '../typings/drawer';
import { createPointFeature, isSameData, updateTargetData } from '../utils/data';
import { BaseMode } from './base-mode';

export abstract class PointMode<T extends IBaseModeOptions> extends BaseMode<T> {
  /**
   * 获取point类型对应的render
   * @protected
   */
  protected get pointRender(): PointRender | undefined {
    return this.render.point;
  }

  /**
   * 获取正在被拖拽的结点
   * @protected
   */
  protected get dragPoint() {
    return this.getPointData().find((feature) => feature.properties.isDrag);
  }

  /**
   * 当前高亮的结点
   * @protected
   */
  protected get editPoint() {
    return this.getPointData().find((feature) => {
      return feature.properties.isActive;
    });
  }

  /**
   * 当前悬停的结点
   * @protected
   */
  protected get hoverPoint() {
    return this.getPointData().find((feature) => {
      return feature.properties.isHover;
    });
  }

  getDragPoint() {
    return this.dragPoint;
  }

  getEditPoint() {
    return this.editPoint;
  }

  /**
   * 获取点数据
   */
  getPointData() {
    return this.source.getRenderData<IPointData>('point');
  }

  /**
   * 设置点数据
   * @param data
   */
  setPointData(data: DataUpdater<IPointData>) {
    return this.source.setRenderData('point', data);
  }

  /**
   * 绑定点Render相关事件
   */
  bindPointRenderEvent() {
    this.pointRender?.on(RenderEvent.UnClick, this.onPointCreate.bind(this));
    this.pointRender?.on(RenderEvent.Mousemove, this.onPointMouseMove.bind(this));
    this.pointRender?.on(RenderEvent.Mouseout, this.onPointMouseOut.bind(this));
    this.pointRender?.on(RenderEvent.Dragstart, this.onPointDragStart.bind(this));
    this.pointRender?.on(RenderEvent.Dragging, this.onPointDragging.bind(this));
    this.pointRender?.on(RenderEvent.Dragend, this.onPointDragEnd.bind(this));
  }

  /**
   * 创建点Feature
   * @param position
   */
  handleCreatePoint(e: IMouseEvent<IPointData>): IPointData {
    const { autoActive, editable } = this.options;

    const newPoint = createPointFeature({
      x: e.localPoint.x,
      y: e.localPoint.y,
    });

    this.setPointData((oldData) => {
      return updateTargetData<IPointData>({
        target: newPoint,
        data: [...oldData, newPoint],
        targetHandler: (item) => {
          item.properties = {
            ...item.properties,
            isHover: editable,
            isActive: autoActive && editable,
          };
        },
        otherHandler: (item) => {
          item.properties = {
            ...item.properties,
            isHover: false,
            isActive: false,
            isDrag: false,
          };
        },
      });
    });
    return newPoint;
  }

  handlePointHover(point: IPointData) {
    this.setCursor('pointHover');
    if (!isSameData(point, this.hoverPoint)) {
      this.setPointData((features) => {
        return updateTargetData<IPointData>({
          target: point,
          data: features,
          targetHandler: (item) => {
            item.properties.isHover = true;
          },
          otherHandler: (item) => {
            item.properties.isHover = false;
          },
        });
      });
    }
    return point;
  }

  handlePointUnHover(point: IPointData) {
    this.resetCursor();
    this.setPointData((features) =>
      features.map((feature) => {
        feature.properties.isHover = false;
        return feature;
      }),
    );
    return point;
  }

  handlePointDragStart(point: IPointData) {
    this.setPointData((features) => {
      return updateTargetData<IPointData>({
        target: point,
        data: features,
        targetHandler: (item) => {
          item.properties = {
            ...item.properties,
            isDrag: true,
            isActive: true,
          };
        },
        otherHandler: (item) => {
          item.properties = {
            ...item.properties,
            isDrag: false,
            isActive: false,
          };
        },
      });
    });
    this.CoreService.ableZoomAndScale(false);
    this.setCursor('pointDrag');
    return point;
  }

  handlePointDragging(point: IPointData, _pos: Position) {
    //处理limitbox
    let pos = _pos;
    if (this.options.limitBox) {
      let box = this.options.limitBox;
      pos.x = Math.max(box.minX, Math.min(pos.x, box.maxX));
      pos.y = Math.max(box.minY, Math.min(pos.y, box.maxY));
    }

    this.setPointData((prevData) => {
      return updateTargetData<IPointData>({
        target: point,
        data: prevData,
        targetHandler: (item) => {
          item.data = pos;
        },
      });
    });
    this.CoreService.ableZoomAndScale(false);
    this.setCursor('pointDrag');
    return point;
  }

  handlePointDragEnd(point: IPointData) {
    this.setPointData((features) => {
      return updateTargetData<IPointData>({
        target: point,
        data: features,
        targetHandler: (item) => {
          item.properties.isDrag = false;
        },
      });
    });
    this.CoreService.ableZoomAndScale(true);
    this.setCursor('pointHover');
    return point;
  }

  /**
   * 创建点回调
   * @param e
   */
  onPointCreate(e: IMouseEvent<IPointData>): IPointData | undefined {
    return this.handleCreatePoint(e);
  }

  onPointMouseMove(e: IMouseEvent<IPointData>) {
    return this.handlePointHover(e.source!);
  }

  onPointMouseOut(e: IMouseEvent<IPointData>) {
    return this.handlePointUnHover(e.source!);
  }

  /**
   * 开始拖拽点回调
   * @param e
   */
  onPointDragStart(e: IMouseEvent<IPointData>) {
    if (!this.options.editable) {
      return;
    }
    return this.handlePointDragStart(e.source!);
  }

  /**
   * 拖拽中点回调
   * @param e
   */
  onPointDragging(e: IMouseEvent<IPointData>) {
    const dragPoint = this.dragPoint;
    if (!this.options.editable || !dragPoint) {
      return;
    }
    return this.handlePointDragging(dragPoint, e.localPoint);
  }

  /**
   * 拖拽结束点回调
   * @param e
   */
  onPointDragEnd(e: IMouseEvent) {
    const dragPoint = this.dragPoint;
    if (!this.options.editable || !dragPoint) {
      return;
    }
    return this.handlePointDragEnd(dragPoint);
  }

  enablePointRenderAction() {
    const { editable } = this.options;
    if (this.enabled) {
      this.pointRender?.enableUnClick();
    }
    this.pointRender?.enableClick();
    if (editable) {
      this.pointRender?.enableHover();
      this.pointRender?.enableDrag();
    }
  }

  disablePointRenderAction() {
    this.pointRender?.disableUnClick();
    this.pointRender?.disableHover();
    this.pointRender?.disableDrag();
    this.pointRender?.disableClick();
  }
}
