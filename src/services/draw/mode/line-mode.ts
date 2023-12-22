import { RenderEvent } from '../constants';
import { LineRender } from '../render';
import {
  DeepPartial,
  DataUpdater,
  ILineProperties,
  ILineData,
  IPointData,
  IMouseEvent,
  Position,
  IMidPointData,
  IDashLineData,
} from '../typings';
import { createLineFeature, createPointFeature, updateTargetData, isSameData } from '../utils/data';
import { MidPointMode } from './mid-point-mode';
import { cloneDeep } from 'lodash';
import { Point } from 'pixi.js';

export abstract class LineMode extends MidPointMode {
  /**
   * 获取line类型对应的render
   * @protected
   */
  protected get lineRender(): LineRender | undefined {
    return this.render.line;
  }

  /**
   * 获取正在被拖拽的线
   * @protected
   */
  protected get dragLine() {
    return this.getLineData().find((feature) => feature.properties.isDrag);
  }

  /**
   * 正在绘制的线
   * @protected
   */
  protected get drawLine() {
    return this.getLineData().find((feature) => feature.properties.isDraw);
  }

  /**
   * 当前高亮的结点
   * @protected
   */
  protected get editLine() {
    return this.getLineData().find((feature) => {
      const { isActive, isDraw } = feature.properties;
      return !isDraw && isActive;
    });
  }

  /**
   * 当前悬停的线
   * @protected
   */
  protected get hoverLine() {
    return this.getLineData().find((feature) => {
      return feature.properties.isHover;
    });
  }

  protected previousPosition: Position = { x: 0, y: 0 };

  getDragLine() {
    return this.dragLine;
  }

  getDrawLine() {
    return this.drawLine;
  }

  getEditLine() {
    return this.editLine;
  }

  /**
   * 获取 position 经过吸附作用后的 position，若无吸附效果则返回原始数据
   * @param position
   */
  getAdsorbPosition(position: Position): Position | null {
    return position;

    // const { adsorbOptions } = this.options;
    // if (typeof adsorbOptions === 'boolean') {
    //     return position;
    // }
    // const scene = this.scene;
    // const { data, pointAdsorbPixel, lineAdsorbPixel } = adsorbOptions;
    // let adsorbPosition: Position | null = null;
    // const { points, lines } = getAdsorbFeature(data, this, position);
    // if (points.length && pointAdsorbPixel > 0) {
    //     adsorbPosition = getAdsorbPoint(position, points, adsorbOptions, scene);
    // }

    // if (!adsorbPosition && lines.length && lineAdsorbPixel > 0) {
    //     adsorbPosition = getAdsorbLine(position, lines, adsorbOptions, scene);
    // }

    // return adsorbPosition;
  }

  bindSceneEvent() {
    this.sceneRender.on(RenderEvent.Mousemove, this.onSceneMouseMove.bind(this));
  }

  bindPointRenderEvent() {
    super.bindPointRenderEvent();
    this.pointRender?.on(RenderEvent.Click, this.onPointClick.bind(this));
  }

  bindLineRenderEvent() {
    this.lineRender?.on(RenderEvent.UnClick, this.onLineUnClick.bind(this));
    this.lineRender?.on(RenderEvent.Mousemove, this.onLineMouseMove.bind(this));
    this.lineRender?.on(RenderEvent.Mouseout, this.onLineMouseOut.bind(this));
    this.lineRender?.on(RenderEvent.Dragstart, this.onLineDragStart.bind(this));
    this.lineRender?.on(RenderEvent.Dragging, this.onLineDragging.bind(this));
    this.lineRender?.on(RenderEvent.Dragend, this.onLineDragEnd.bind(this));
  }
  /**
   * 创建LineFeature
   * @param point
   */
  handleCreateLine(point: IPointData) {
    const newLine = createLineFeature([point], {
      isActive: true,
      isDraw: true,
    });
    this.setLineData((features) => {
      return updateTargetData<ILineData>({
        target: newLine,
        data: [...features, newLine],
        otherHandler: (feature) => {
          feature.properties.isActive = false;
        },
      });
    });
    this.setPointData([point]);
    return newLine;
  }

  /**
   * 同步当前编辑线中的结点
   * @param line
   * @param nodes
   */
  syncLineNodes(line: ILineData, nodes: IPointData[]) {
    this.setLineData((features) =>
      updateTargetData({
        target: line,
        data: features,
        targetHandler: (feature) => {
          feature.data = nodes.map((v) => v['data']);
          feature.properties.nodes = nodes;
        },
      }),
    );
    if (isSameData(line, this.editLine)) {
      this.setMidPointData(this.getMidPointsByLine(line));
    }
    this.setPointData(line.properties.nodes);
    return line;
  }

  setActiveLine(line: ILineData, properties: Partial<ILineProperties> = {}) {
    this.setLineData((features) =>
      updateTargetData({
        target: line,
        data: features,
        targetHandler: (feature) => {
          feature.properties = {
            ...feature.properties,
            isDraw: false,
            isActive: true,
            isDrag: false,
            isHover: false,
            ...properties,
          };
        },
        otherHandler: (feature) => {
          feature.properties = {
            ...feature.properties,
            isDraw: false,
            isActive: false,
            isDrag: false,
          };
        },
      }),
    );
    this.setPointData(
      (line?.properties?.nodes ?? []).map((feature) => {
        feature.properties = {
          ...feature.properties,
          isHover: false,
          isActive: false,
        };
        return feature;
      }),
    );
    this.setMidPointData(this.getMidPointsByLine(line));
    this.setDashLineData([]);
    return line;
  }

  clearActiveLine() {
    this.source.setData({
      point: [],
      line: this.getLineData().map((feature) => {
        feature.properties = {
          ...feature.properties,
          isActive: false,
          isHover: false,
        };
        return feature;
      }),
      midPoint: [],
    });
  }

  handleLineUnClick(link: ILineData) {
    this.clearActiveLine();
    return link;
  }

  handleLineHover(line: ILineData) {
    if (this.drawLine) {
      return;
    }
    this.setCursor('lineHover');
    if (!isSameData(line, this.hoverLine)) {
      this.setLineData((features) =>
        updateTargetData({
          target: line,
          data: features,
          targetHandler: (feature) => {
            feature.properties.isHover = true;
          },
          otherHandler: (feature) => {
            feature.properties.isHover = false;
          },
        }),
      );
    }
    return line;
  }

  handleLineUnHover(line: ILineData) {
    if (this.drawLine) {
      return;
    }
    this.resetCursor();
    this.setLineData((features) =>
      features.map((feature) => {
        feature.properties.isHover = false;
        return feature;
      }),
    );
    return line;
  }

  handleLineDragStart(line: ILineData) {
    this.setActiveLine(line, {
      isDrag: true,
      isActive: true,
    });
    this.CoreService.ableZoomAndScale(false);
    // this.scene.setMapStatus({
    //     dragEnable: false,
    // });
    this.setCursor('lineDrag');
    return line;
  }

  handleLineDragging(line: ILineData, { x, y }: Position) {
    const nodes = cloneDeep(line.properties.nodes);
    const { x: preX, y: preY } = this.previousPosition;
    nodes.forEach((node) => {
      node.data.x = node.data.x + x - preX;
      node.data.y = node.data.y + y - preY;
    });
    if (!this.calcLimitAble(nodes.map((v) => v['data']))) return;

    this.syncLineNodes(line, nodes);
    this.setActiveLine(line, {
      isDrag: true,
    });
    this.setCursor('lineDrag');
    this.previousPosition = { x, y };
    return line;
  }

  handleLineDragEnd(line: ILineData) {
    line.properties.isDrag = false;
    this.setLineData((features) => features);
    this.CoreService.ableZoomAndScale(true);
    // this.scene.setMapStatus({
    //     dragEnable: true,
    // });
    return line;
  }

  resetAdsorbLngLat(e: IMouseEvent) {
    if (!this.options.adsorbOptions) {
      return;
    }
    const adsorbPosition = this.getAdsorbPosition(e.localPoint);
    if (adsorbPosition) {
      e.localPoint = new Point(adsorbPosition.x, adsorbPosition.y);
      // resetEventLngLat(e, adsorbPosition);
    }
    return adsorbPosition;
  }

  /**
   * 创建点之后，对应线段的处理
   * @param e
   */
  onPointCreate(e: IMouseEvent): IPointData | undefined {
    if (this.editLine) {
      return;
    }
    this.resetAdsorbLngLat(e);
    const point = super.onPointCreate(e as IMouseEvent<IPointData>);
    const drawLine = this.drawLine;
    if (!point) {
      return;
    }
    if (drawLine) {
      this.syncLineNodes(drawLine, [...drawLine.properties.nodes, point]);
      this.setDashLineData([]);
    } else {
      this.handleCreateLine(point);
    }
    return point;
  }

  onPointDragStart(e: IMouseEvent<IPointData>) {
    const editLine = this.editLine;
    if (!editLine) {
      return;
    }
    this.setHelper('pointDrag');
    return super.onPointDragStart(e);
  }

  onPointDragging(e: IMouseEvent): IPointData | undefined {
    const dragPoint = super.onPointDragging(e as IMouseEvent<IPointData>);
    if (dragPoint) {
      const adsorbPosition = this.resetAdsorbLngLat(e);
      if (adsorbPosition) {
        dragPoint.data = cloneDeep(adsorbPosition);
      }
    }
    const editLine = this.editLine;
    if (editLine && dragPoint) {
      this.syncLineNodes(
        editLine,
        editLine.properties.nodes.map((node) => {
          if (isSameData(dragPoint, node)) {
            return dragPoint;
          }
          return node;
        }),
      );
      this.setActiveLine(editLine);
    }
    return dragPoint;
  }

  onPointDragEnd(e: IMouseEvent): IPointData | undefined {
    const editLine = this.editLine;
    if (editLine) {
      const dragPoint = super.onPointDragEnd(e);
      this.setPointData((features) => {
        return features.map((feature) => {
          feature.properties.isActive = false;
          return feature;
        });
      });
      this.setHelper('pointHover');
      return dragPoint;
    }
  }

  onLineUnClick(e: IMouseEvent) {
    const editLine = this.editLine;
    if (!editLine) {
      return;
    }
    return this.handleLineUnClick(editLine);
  }

  onLineMouseMove(e: IMouseEvent<ILineData>) {
    if (this.drawLine) {
      return;
    }
    if (!this.dragLine && !this.drawLine && this.options.editable) {
      this.setHelper('lineHover');
    }
    return this.handleLineHover(e.source!);
  }

  onLineMouseOut(e: IMouseEvent<ILineData>) {
    if (this.drawLine) {
      return;
    }
    if (!this.dragLine && !this.drawLine) {
      this.setHelper(this.addable ? 'draw' : null);
    }
    return this.handleLineUnHover(e.source!);
  }

  onLineDragStart(e: IMouseEvent<ILineData>) {
    if (!this.options.editable || this.drawLine) {
      return;
    }
    this.previousPosition = e.localPoint;
    this.setHelper('lineDrag');

    return this.handleLineDragStart(e.source!);
  }

  onLineDragging(e: IMouseEvent) {
    const dragLine = this.dragLine;
    if (!dragLine) {
      return;
    }
    return this.handleLineDragging(dragLine, e.localPoint);
  }

  onLineDragEnd(e: IMouseEvent) {
    const dragLine = this.dragLine;
    if (!dragLine) {
      return;
    }
    this.setHelper('lineHover');
    return this.handleLineDragEnd(dragLine);
  }

  onPointMouseMove(e: IMouseEvent<IPointData>) {
    const feature = super.onPointMouseMove(e);
    if (!this.dragLine && !this.drawLine && !this.dragPoint) {
      this.setHelper('pointHover');
    }
    return feature;
  }

  onPointMouseOut(e: IMouseEvent<IPointData>) {
    const feature = super.onPointMouseOut(e);
    if (!this.dragLine && !this.drawLine && !this.dragPoint) {
      this.setHelper(this.addable ? 'draw' : null);
    }
    return feature;
  }

  onMidPointHover(e: IMouseEvent<IMidPointData>) {
    super.onMidPointHover(e);
    this.setHelper('midPointHover');
  }

  onMidPointUnHover(e: IMouseEvent<IMidPointData>) {
    super.onMidPointUnHover(e);
    this.setHelper(null);
  }

  onPointClick(e: IMouseEvent<IPointData>) {}

  /**
   * 获取线数据
   */
  getLineData() {
    return this.source.getRenderData<ILineData>('line');
  }

  /**
   * 设置线数据
   * @param data
   */
  setLineData(data: DataUpdater<ILineData>) {
    return this.source.setRenderData('line', data);
  }

  /**
   * 获取线数据
   */
  getDashLineData() {
    return this.source.getRenderData<IDashLineData>('dashLine');
  }

  /**
   * 设置线数据
   * @param data
   */
  setDashLineData(data: DataUpdater<IDashLineData>) {
    return this.source.setRenderData('dashLine', data);
  }

  onMidPointClick(e: IMouseEvent<IMidPointData>): IPointData | undefined {
    const editLine = this.editLine;
    const feature = e.source;
    if (!editLine || !feature || this.dragPoint) {
      return;
    }
    const nodes = editLine.properties.nodes;
    const { startId, endId } = feature.properties;
    const startIndex = nodes.findIndex((feature) => feature.properties.id === startId);
    const endIndex = nodes.findIndex((feature) => feature.properties.id === endId);
    if (startIndex > -1 && endIndex > -1) {
      const newNode = createPointFeature(feature.data, {
        isDrag: true,
        isHover: true,
      });
      this.setHelper('pointDrag');
      nodes.splice(endIndex, 0, newNode);
      editLine.properties.nodes = nodes;
      // editLine.geometry.coordinates = coordAll(featureCollection(nodes));
      this.syncLineNodes(editLine, nodes);
      this.setActiveLine(editLine);
      return newNode;
    }
  }

  enableSceneRenderAction() {
    this.sceneRender.enableDrag();
    this.sceneRender.enableMouseMove();
    this.sceneRender.enableDblClick();
  }

  disableSceneRenderAction() {
    this.sceneRender.disableDrag();
    this.sceneRender.disableMouseMove();
    this.sceneRender.disableDblClick();
  }

  enableLineRenderAction() {
    const { editable } = this.options;
    this.lineRender?.enableUnClick();
    if (editable) {
      this.lineRender?.enableHover();
      this.lineRender?.enableDrag();
    }
  }

  disableLineRenderAction() {
    this.lineRender?.disableUnClick();
    this.lineRender?.disableHover();
    this.lineRender?.disableDrag();
  }
}
