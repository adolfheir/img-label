import { cloneDeep, last } from 'lodash';
import { Point } from 'pixi.js';
import type { ICoreService } from '../../core/interface';
import { DrawEvent, RenderEvent, DEFAULT_LINE_HELPER_CONFIG } from '../constants';
import { ILineModeOptions, LineMode } from '../mode';
import { DeepPartial, IMouseEvent, ILineData, IMidPointData, IPointData, IRenderType, Position } from '../typings';
import { createDashLine, createPointFeature, getDefaultLineProperties, isSameData } from '../utils/data';

export type ILineDrawerOptions = ILineModeOptions<ILineData>;

export class LineDrawer extends LineMode<ILineDrawerOptions> {
  constructor(CoreService: ICoreService, options: DeepPartial<ILineDrawerOptions>) {
    super(CoreService, options);

    this.sceneRender.on(RenderEvent.DblClick, this.drawLineFinish);
    this.bindPointRenderEvent();
    this.bindSceneEvent();
    this.bindMidPointRenderEvent();
    this.bindLineRenderEvent();
  }

  protected get dragItem() {
    return this.dragLine;
  }

  protected get editItem() {
    return this.editLine;
  }

  setData(lines: ILineData[]) {
    const lineFeatures = lines.map((line) => {
      line.properties = {
        ...getDefaultLineProperties(),
        ...(line.properties ?? {}),
      };
      if (!line.properties.nodes?.length) {
        line.properties.nodes = line.data.map((position) => {
          return createPointFeature(position);
        });
      }
      return line as ILineData;
    });
    this.source.setData({
      point: [],
      midPoint: [],
      dashLine: [],
      line: lineFeatures,
    });

    if (this.editLine) {
      this.setActiveLine(this.editLine);
    }
  }

  getData(): ILineData[] {
    return this.getLineData();
  }

  getRenderTypes(): IRenderType[] {
    return ['line', 'dashLine', 'midPoint', 'point'];
  }

  bindPointRenderEvent = () => {
    super.bindPointRenderEvent();
    this.pointRender?.on(RenderEvent.Contextmenu, this.onPointContextMenu.bind(this));
  };

  drawLineFinish = () => {
    const drawLine = this.drawLine;
    const nodes = drawLine?.properties.nodes ?? [];
    if (!drawLine || nodes?.length <= 1) {
      return;
    }
    this.setActiveLine(drawLine);
    const { autoActive, editable } = this.options;
    if (!autoActive || !editable) {
      this.handleLineUnClick(drawLine);
    }
    if (editable && autoActive) {
      this.setHelper('pointHover');
    } else {
      this.setHelper(this.addable ? 'draw' : null);
    }
    this.emit(DrawEvent.Add, drawLine, this.getLineData());
  };

  onPointClick(e: IMouseEvent<IPointData>) {
    const drawLine = this.drawLine;
    const nodes = drawLine?.properties.nodes ?? [];
    const feature = e.source!;
    if (isSameData(feature, last(nodes))) {
      requestAnimationFrame(() => {
        this.drawLineFinish();
      });
    } else {
      const { x, y } = feature.data;
      e.localPoint = new Point(x, y);
      this.onPointCreate(e);
    }
  }

  removeNode(node: IPointData | string, feature: ILineData | string) {
    const targetFeature = this.getTargetData(feature) as ILineData | undefined;
    const targetNode = this.getTargetData(node, targetFeature?.properties.nodes ?? []);
    if (targetFeature && targetNode) {
      const nodes = targetFeature?.properties.nodes ?? [];
      if (nodes.length < 3) {
        return;
      }
      this.syncLineNodes(
        targetFeature,
        nodes.filter((node) => !isSameData(targetNode, node)),
      );
      this.emit(DrawEvent.RemoveNode, targetNode, targetFeature, this.getLineData());
      this.emit(DrawEvent.Edit, targetFeature, this.getLineData());
    }
  }

  onPointContextMenu(e: IMouseEvent<IPointData>) {
    const editLine = this.editLine;
    const deleteNode = e.source!;
    const nodes = editLine?.properties.nodes ?? [];
    if (!editLine || nodes.length < 3) {
      return;
    }
    this.removeNode(deleteNode, editLine);
    this.CoreService.ableZoomAndScale(true);
    return deleteNode;
  }

  onPointCreate(e: IMouseEvent) {
    if (!this.calcLimitAble(e.localPoint)) return;

    if (!this.addable) {
      return;
    }
    const feature = super.onPointCreate(e);
    if (feature) {
      this.setHelper('drawFinish');
      this.emit(DrawEvent.AddNode, feature, this.drawLine, this.getLineData());
    }
    return feature;
  }

  onPointDragEnd(e: IMouseEvent): IPointData | undefined {
    const editLine = this.editLine;
    const feature = super.onPointDragEnd(e);
    if (editLine && feature) {
      this.emit(DrawEvent.Edit, editLine, this.getLineData());
    }
    return feature;
  }

  onLineDragStart(e: IMouseEvent<ILineData>) {
    const feature = super.onLineDragStart(e);
    if (feature) {
      this.emit(DrawEvent.DragStart, feature, this.getLineData());
    }
    return feature;
  }

  onLineDragging(e: IMouseEvent) {
    const feature = super.onLineDragging(e);
    if (feature) {
      this.emit(DrawEvent.Dragging, feature, this.getLineData());
    }
    return feature;
  }

  onLineDragEnd(e: IMouseEvent): ILineData | undefined {
    const feature = super.onLineDragEnd(e);
    if (feature) {
      this.emit(DrawEvent.DragEnd, feature, this.getLineData());
      this.emit(DrawEvent.Edit, feature, this.getLineData());
    }
    return feature;
  }

  onMidPointClick(e: IMouseEvent<IMidPointData>): IPointData | undefined {
    const editLine = this.editLine;
    const feature = super.onMidPointClick(e);
    if (editLine && feature) {
      this.emit(DrawEvent.Edit, editLine, this.getLineData());
      this.emit(DrawEvent.AddNode, feature, editLine, this.getLineData());
    }
    return feature;
  }

  onSceneMouseMove(e: IMouseEvent) {
    const drawLine = this.drawLine;
    if (!drawLine) {
      return;
    }
    const lastNode = last(drawLine.properties.nodes)!;
    let mousePosition = e.localPoint as Position;
    if (this.options.adsorbOptions) {
      mousePosition = this.getAdsorbPosition(mousePosition) ?? mousePosition;
    }
    this.setDashLineData([createDashLine([mousePosition, lastNode.data])]);
  }

  setActiveFeature(target: ILineData | string | null | undefined) {
    const targetFeature = this.getTargetData(target);
    if (targetFeature) {
      this.setActiveLine(targetFeature as ILineData);
    } else {
      this.clearActiveLine();
    }
  }

  resetFeatures() {
    let features = this.getLineData();
    if (this.drawLine) {
      features = features.filter((feature) => !feature.properties.isDraw);
      this.source.setData({
        point: [],
        dashLine: [],
        midPoint: [],
      });
    }
    if (this.editLine) {
      this.handleLineUnClick(this.editLine);
    }
    this.setLineData(
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

  enablePointRenderAction() {
    super.enablePointRenderAction();
    if (this.options.editable) {
      this.pointRender?.enableContextMenu();
    }
  }

  disablePointRenderAction() {
    super.disablePointRenderAction();
    this.pointRender?.disableContextMenu();
  }

  bindEnableEvent(): void {
    super.bindEnableEvent();
    this.enableSceneRenderAction();
    this.enablePointRenderAction();
    this.enableLineRenderAction();
    this.enableMidPointRenderAction();
    this.sceneRender.enableDblClick();
  }

  unbindEnableEvent(): void {
    super.unbindEnableEvent();
    this.disableSceneRenderAction();
    this.disablePointRenderAction();
    this.disableLineRenderAction();
    this.disableMidPointRenderAction();
    this.sceneRender.disableDblClick();
  }

  bindThis() {
    // super.bindThis();
    this.bindPointRenderEvent = this.bindPointRenderEvent.bind(this);
    this.bindSceneEvent = this.bindSceneEvent.bind(this);
    this.bindLineRenderEvent = this.bindLineRenderEvent.bind(this);
    this.bindMidPointRenderEvent = this.bindMidPointRenderEvent.bind(this);
  }
}
