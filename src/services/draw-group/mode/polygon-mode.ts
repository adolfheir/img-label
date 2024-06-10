import { cloneDeep, first, isEqual, last } from 'lodash';
import { DEFAULT_AREA_OPTIONS, DEFAULT_POLYGON_HELPER_CONFIG, DrawEvent, RenderEvent } from '../constants';
import { PolygonRender } from '../render';
import {
  DataUpdater,
  IMouseEvent,
  ILineData,
  IMidPointData,
  IPointData,
  IPolygonData,
  IPolygonHelperOptions,
  IPolygonProperties,
  IRenderType,
  IBsaeData,
  DeepPartial,
} from '../typings';
import { IAreaOptions } from '../typings/drawer';
import { createPointFeature, createPolygonFeature, isSameData, updateTargetData } from '../utils/data';
import { ILineModeOptions, LineMode } from './line-mode';

export interface IPolygonModeOptions<F extends IBsaeData = IBsaeData> extends ILineModeOptions<F> {
  areaOptions: false | IAreaOptions;
  helper: IPolygonHelperOptions | boolean;
}

export abstract class PolygonMode<T extends IPolygonModeOptions> extends LineMode<T> {
  protected get dragItem() {
    return this.dragPolygon;
  }

  protected get editItem() {
    return this.editPolygon;
  }

  /**
   * 获取polygon类型对应的render
   * @protected
   */
  protected get polygonRender(): PolygonRender | undefined {
    return this.render.polygon;
  }

  /**
   * 获取正在被拖拽的线
   * @protected
   */
  protected get dragPolygon() {
    return this.getPolygonData().find((feature) => feature.properties.isDrag);
  }

  /**
   * 正在绘制的线
   * @protected
   */
  protected get drawPolygon() {
    return this.getPolygonData().find((feature) => feature.properties.isDraw);
  }

  /**
   * 当前高亮的结点
   * @protected
   */
  protected get editPolygon() {
    return this.getPolygonData().find((feature) => {
      const { isActive, isDraw } = feature.properties;
      return !isDraw && isActive;
    });
  }

  /**
   * 当前悬停的线
   * @protected
   */
  protected get hoverPolygon() {
    return this.getPolygonData().find((feature) => {
      return feature.properties.isHover;
    });
  }

  getDragPolygon() {
    return this.dragPolygon;
  }

  getDrawPolygon() {
    return this.drawPolygon;
  }

  getEditPolygon() {
    return this.editPolygon;
  }

  getRenderTypes(): IRenderType[] {
    return ['polygon', 'line', 'dashLine', 'midPoint', 'point'];
  }

  getData(): IPolygonData[] {
    return this.getPolygonData();
  }

  getDefaultOptions(options: DeepPartial<T>): T {
    const newOptions: T = {
      ...super.getDefaultOptions(options),
      areaOptions: false,
      helper: cloneDeep(DEFAULT_POLYGON_HELPER_CONFIG),
    };
    if (options.areaOptions) {
      newOptions.areaOptions = {
        ...DEFAULT_AREA_OPTIONS,
        ...options.areaOptions,
      };
    }
    return newOptions;
  }

  /**
   * 获取线数据
   */
  getPolygonData() {
    return this.source.getRenderData<IPolygonData>('polygon');
  }

  /**
   * 设置线数据
   * @param data
   */
  setPolygonData(data: DataUpdater<IPolygonData>) {
    return this.source.setRenderData('polygon', data);
  }

  handleCreatePolygon(points: IPointData[], line: ILineData) {
    const newPolygon = createPolygonFeature(points, {
      nodes: points,
      line,
      isActive: true,
      isDraw: true,
    });
    this.setPolygonData((features) =>
      updateTargetData({
        target: newPolygon,
        data: [...features, newPolygon],
        otherHandler: (feature) => {
          feature.properties.isActive = false;
        },
      }),
    );
    return newPolygon;
  }

  handlePolygonUnClick(polygon: IPolygonData) {
    this.clearActivePolygon();
    return polygon;
  }

  handlePolygonHover(polygon: IPolygonData) {
    this.setCursor('polygonHover');
    if (!isSameData(polygon, this.hoverPolygon)) {
      this.setPolygonData((features) =>
        updateTargetData({
          target: polygon,
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
    return polygon;
  }

  handlePolygonUnHover() {
    this.resetCursor();
    this.setPolygonData((features) =>
      features.map((feature) => {
        feature.properties.isHover = false;
        return feature;
      }),
    );
  }

  handlePolygonDragStart(polygon: IPolygonData) {
    this.setActivePolygon(polygon, {
      isDrag: true,
    });
    this.CoreService.ableZoomAndScale(false);
    // this.scene.setMapStatus({
    //   dragEnable: false,
    // });
    this.setCursor('polygonDrag');
    return polygon;
  }

  bindPolygonRenderEvent() {
    this.polygonRender?.on(RenderEvent.UnClick, this.onPolygonUnClick.bind(this));
    this.polygonRender?.on(RenderEvent.Mousemove, this.onPolygonHover.bind(this));
    this.polygonRender?.on(RenderEvent.Mouseout, this.onPolygonUnHover.bind(this));
    this.polygonRender?.on(RenderEvent.Dragstart, this.onPolygonDragStart.bind(this));
    this.polygonRender?.on(RenderEvent.Dragging, this.onPolygonDragging.bind(this));
    // this.polygonRender?.on(
    //   RenderEvent.Dragend,
    //   this.onPolygonDragEnd.bind(this),
    // );
  }

  syncPolygonNodes(polygon: IPolygonData, nodes: IPointData[], syncAll = false) {
    // const positions = coordAll(featureCollection([...nodes, first(nodes)!]));

    // const positions = [...nodes, first(nodes)]

    const { isDraw, line } = polygon.properties;
    polygon.data = nodes.map((v) => v['data']);
    polygon.properties.nodes = nodes;
    // polygon.geometry.coordinates = [
    //   booleanClockwise(lineString(positions)) ? positions : positions.reverse(),
    // ];
    this.setPolygonData((features) => {
      return features.map((feature) => {
        if (isSameData(feature, polygon)) {
          return polygon;
        }
        return feature;
      });
    });
    if (!isSameData(this.drawPolygon, polygon) || syncAll) {
      const oldLineNodes = line.properties.nodes;
      const newLineNodes = [...nodes];
      const firstNode = first(newLineNodes)!;
      if (oldLineNodes.length === nodes.length) {
        newLineNodes.push(createPointFeature(firstNode.data));
      } else {
        newLineNodes.push(last(oldLineNodes)!);
      }
      const lastNode = last(newLineNodes)!;
      if (!isEqual(firstNode.data, lastNode.data)) {
        lastNode.data = cloneDeep(firstNode.data);
      }
      this.syncLineNodes(line, newLineNodes);
    }
    return polygon;
  }

  setActivePolygon(polygon: IPolygonData, properties: Partial<IPolygonProperties> = {}) {
    if (!polygon) {
      return;
    }
    this.setActiveLine(polygon.properties.line, properties);
    this.setPolygonData((features) =>
      updateTargetData({
        target: polygon,
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
    return polygon;
  }

  clearActivePolygon() {
    this.setPolygonData((features) => {
      return features.map((feature) => {
        feature.properties = {
          ...feature.properties,
          isActive: false,
          isHover: false,
        };
        return feature;
      });
    });
    this.clearActiveLine();
  }

  onLineDragStart(e: IMouseEvent<ILineData>) {
    const line = super.onLineDragStart(e);
    const polygon = this.getPolygonData().find((feature) => isSameData(feature.properties.line, line));
    if (polygon) {
      this.setActivePolygon(polygon, {
        isDrag: true,
      });
      this.emit(DrawEvent.DragStart, polygon, this.getPolygonData());
    }
    return line;
  }

  onLineUnClick(e: IMouseEvent) {
    return this.editLine;
  }

  onLineDragEnd(e: IMouseEvent) {
    const feature = super.onLineDragEnd(e);
    const dragPolygon = this.dragPolygon;
    if (feature && dragPolygon) {
      dragPolygon.properties.isDrag = false;
      this.emit(DrawEvent.DragEnd, dragPolygon, this.getPolygonData());
      this.emit(DrawEvent.Edit, dragPolygon, this.getPolygonData());
    }
    return feature;
  }

  onPolygonUnClick(e: IMouseEvent) {
    const editPolygon = this.editPolygon;
    if (!editPolygon) {
      return;
    }
    return this.handlePolygonUnClick(editPolygon);
  }

  onPolygonHover(e: IMouseEvent<IPolygonData>) {
    if (this.drawPolygon) {
      return;
    }
    if (!this.dragPolygon) {
      this.setHelper('polygonHover');
    }
    return this.handlePolygonHover(e.source!);
  }

  onPolygonUnHover(e: IMouseEvent<IPolygonData>) {
    if (this.drawPolygon) {
      return;
    }
    this.setHelper(this.addable ? 'draw' : null);
    return this.handlePolygonUnHover();
  }

  onPolygonDragStart(e: IMouseEvent<IPolygonData>) {
    if (!this.options.editable || this.drawPolygon) {
      return;
    }
    const polygon = e.source!;
    this.previousPosition = e.localPoint;
    this.setHelper('polygonDrag');
    this.emit(DrawEvent.DragStart, polygon, this.getPolygonData());
    return this.handlePolygonDragStart(polygon);
  }

  onPolygonDragging(e: IMouseEvent<IPolygonData>) {
    const dragPolygon = this.dragPolygon as IPolygonData;
    if (dragPolygon) {
      const nodes = cloneDeep(dragPolygon.properties.nodes);
      const { x, y } = e.localPoint;
      const { x: prevX, y: prevY } = this.previousPosition;
      let disx = x - prevX;
      let disy = y - prevY;
      //限制点位在框内
      if (this.options.limitBox) {
        let newDisx = disx;
        let newDisy = disy;
        let limitBox = this.options.limitBox;
        const minX = Math.min(...nodes.map((point) => point.data.x));
        const maxX = Math.max(...nodes.map((point) => point.data.x));
        const minY = Math.min(...nodes.map((point) => point.data.y));
        const maxY = Math.max(...nodes.map((point) => point.data.y));

        if (minX + disx < limitBox.minX) {
          newDisx = limitBox.minX - minX;
        }
        if (maxX + disx > limitBox.maxX) {
          newDisx = limitBox.maxX - maxX;
        }
        if (minY + disy < limitBox.minY) {
          newDisy = limitBox.minY - minY;
        }
        if (maxY + disy > limitBox.maxY) {
          newDisy = limitBox.maxY - maxY;
        }
        disx = newDisx;
        disy = newDisy;
      }

      nodes.forEach((node) => {
        node.data.x = node.data.x + disx;
        node.data.y = node.data.y + disy;
      });

      if (!this.calcLimitAble(nodes.map((v) => v['data']))) return;
      this.previousPosition = { x, y };

      this.syncPolygonNodes(dragPolygon, nodes, true);
      this.emit(DrawEvent.Dragging, dragPolygon, this.getPolygonData());
    }
  }

  onMidPointClick(e: IMouseEvent<IMidPointData>): IPointData | undefined {
    const editPolygon = this.editPolygon;
    const feature = super.onMidPointClick(e);
    if (feature && editPolygon) {
      const lineNodes = editPolygon.properties.line.properties.nodes;
      this.syncPolygonNodes(editPolygon, lineNodes.slice(0, lineNodes.length - 1));
      this.setActivePolygon(editPolygon);
    }
    return feature;
  }

  onPointDragEnd(e: IMouseEvent): IPointData | undefined {
    const editPolygon = this.editPolygon;
    const feature = super.onPointDragEnd(e);
    if (feature && editPolygon) {
      this.emit(DrawEvent.Edit, editPolygon, this.getPolygonData());
    }
    return feature;
  }

  enablePolygonRenderAction() {
    const { editable } = this.options;
    this.polygonRender?.enableUnClick();
    if (editable) {
      this.polygonRender?.enableHover();
      this.polygonRender?.enableDrag();
    }
  }

  disablePolygonRenderAction() {
    this.polygonRender?.disableUnClick();
    this.polygonRender?.disableHover();
    this.polygonRender?.disableDrag();
  }

  bindEnableEvent(): void {
    super.bindEnableEvent();
    this.enableSceneRenderAction();
    this.enablePointRenderAction();
    this.enableLineRenderAction();
    this.enableMidPointRenderAction();
    this.enablePolygonRenderAction();
  }

  unbindEnableEvent(): void {
    super.unbindEnableEvent();
    this.disableSceneRenderAction();
    this.disablePointRenderAction();
    this.disableLineRenderAction();
    this.disableMidPointRenderAction();
    this.disablePolygonRenderAction();
  }

  bindThis() {
    // super.bindThis();

    this.bindPointRenderEvent = this.bindPointRenderEvent.bind(this);
    this.bindSceneEvent = this.bindSceneEvent.bind(this);
    this.bindLineRenderEvent = this.bindLineRenderEvent.bind(this);
    this.bindMidPointRenderEvent = this.bindMidPointRenderEvent.bind(this);
    this.bindPolygonRenderEvent = this.bindPolygonRenderEvent.bind(this);
  }

  // setActiveFeature(target: Feature | string | null | undefined) {
  //   const targetFeature = this.getTargetData(target);
  //   if (targetFeature) {
  //     this.setActivePolygon(targetFeature as IPolygonData);
  //   } else {
  //     this.clearActivePolygon();
  //   }
  // }

  resetFeatures() {
    let features = this.getPolygonData();
    if (this.drawPolygon) {
      features = features.filter((feature) => !feature.properties.isDraw);
      this.source.setData({
        point: [],
        dashLine: [],
        midPoint: [],
      });
      this.setLineData((features) => {
        return features.filter((feature) => {
          return !feature.properties.isDraw;
        });
      });
    }
    if (this.editPolygon) {
      this.handlePolygonUnClick(this.editPolygon);
    }
    this.setPolygonData(
      features.map((feature) => {
        feature.properties = {
          ...feature.properties,
          isDrag: false,
          isActive: false,
          isHover: false,
        };
        return feature;
      }),
    );
  }
}
