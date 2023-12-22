import { first, last, cloneDeep } from 'lodash';
import { DrawEvent, RenderEvent, DEFAULT_POLYGON_HELPER_CONFIG } from '../constants';
import { PolygonMode } from '../mode';
import { DeepPartial, IDashLineData, IMidPointData, IPointData, IPolygonData, IMouseEvent, Position } from '../typings';
import {
  createDashLine,
  createLineFeature,
  createPointFeature,
  getDefaultPolygonProperties,
  isSameData,
} from '../utils/data';
import type { ICoreService } from '../../core/interface';
import { Point } from 'pixi.js';

export class PolygonDrawer extends PolygonMode {
  constructor(CoreService: ICoreService) {
    super(CoreService);

    this.sceneRender.on(RenderEvent.DblClick, this.drawPolygonFinish);
    this.bindPointRenderEvent();
    this.bindSceneEvent();
    this.bindMidPointRenderEvent();
    this.bindLineRenderEvent();
    this.bindPolygonRenderEvent();
  }

  protected getHelper() {
    return cloneDeep(DEFAULT_POLYGON_HELPER_CONFIG);
  }

  setData(data: IPolygonData[]) {
    const polygonFeatures = data.map((polygon) => {
      polygon.properties = {
        ...getDefaultPolygonProperties(),
        ...(polygon.properties ?? {}),
      };
      if (!polygon.properties.nodes?.length) {
        let positions = polygon.data;
        positions = positions.slice(0, positions.length);
        polygon.properties.nodes = positions.map((position) => {
          return createPointFeature(position);
        });
      }
      if (!polygon.properties.line) {
        const nodes = polygon.properties.nodes as IPointData[];
        polygon.properties.line = createLineFeature([...nodes, createPointFeature(first(nodes)!.data)]);
      }
      return polygon as IPolygonData;
    });
    this.source.setData({
      point: [],
      midPoint: [],
      dashLine: [],
      polygon: polygonFeatures,
      line: polygonFeatures.map((feature) => feature.properties.line),
    });

    if (this.editPolygon) {
      this.setActivePolygon(this.editPolygon);
    }
  }

  onPointCreate(e: IMouseEvent): IPointData | undefined {
    if (!this.calcLimitAble(e.localPoint)) return;

    if (!this.addable || this.dragPoint) {
      return;
    }

    const feature = super.onPointCreate(e);
    const drawPolygon = this.drawPolygon;
    const drawLine = this.drawLine;
    if (feature) {
      if (drawPolygon) {
        this.syncPolygonNodes(drawPolygon, [...drawPolygon.properties.nodes, feature]);
        this.setDashLineData([createDashLine([e.localPoint, drawPolygon.properties.nodes[0].data])]);
        const nodeLength = drawPolygon.properties.nodes.length;
        if (nodeLength > 1) {
          this.setHelper('drawFinish');
        }
      } else if (drawLine) {
        this.handleCreatePolygon([feature], drawLine);
        this.setHelper('drawContinue');
      }

      if (drawLine || drawPolygon) {
        //关闭事件响应 完成后打开
        this.disablePolygonRenderAction();
      }

      this.emit(DrawEvent.AddNode, feature, drawPolygon, this.getPolygonData());
    }
    return feature;
  }

  drawPolygonFinish = () => {
    const drawPolygon = this.drawPolygon;
    const nodes = drawPolygon?.properties.nodes ?? [];
    if (!drawPolygon || nodes.length < 3) {
      return;
    }
    //关闭事件响应 完成后打开
    this.enablePolygonRenderAction();

    drawPolygon.properties.isDraw = false;
    this.syncPolygonNodes(drawPolygon, nodes);
    this.setActivePolygon(drawPolygon);
    const { autoActive, editable } = this.options;
    if (!autoActive || !editable) {
      this.handlePolygonUnClick(drawPolygon);
    }
    if (editable) {
      this.setHelper(autoActive ? 'pointHover' : 'polygonHover');
    } else {
      this.setHelper(this.addable ? 'draw' : null);
    }
    this.emit(DrawEvent.Add, drawPolygon, this.getPolygonData());
  };

  onPointClick(e: IMouseEvent<IPointData>) {
    const drawPolygon = this.drawPolygon;
    const feature = e.source!;

    if (!drawPolygon) {
      return;
    }

    const nodes = drawPolygon.properties.nodes;
    if (nodes.length >= 3 && (isSameData(first(nodes), feature) || isSameData(last(nodes), feature))) {
      requestAnimationFrame(() => {
        this.drawPolygonFinish();
      });
    } else {
      // const [lng, lat] = feature.geometry.coordinates;
      e.localPoint = feature.data as Point;
      this.onPointCreate(e);
    }
  }

  onPointDragging(e: IMouseEvent): IPointData | undefined {
    const feature = this.dragPoint;
    const editPolygon = this.editPolygon;
    if (feature && editPolygon) {
      const { line } = editPolygon.properties;
      line.properties.nodes = line.properties.nodes.map((node) => {
        return isSameData(node, feature) ? feature : node;
      });
      const lineNodes = line.properties.nodes;
      const nodes = lineNodes.slice(0, lineNodes.length - 1);
      const firstLineNode = first(lineNodes)!;
      const lastLineNode = last(lineNodes)!;
      const isSame = isSameData(firstLineNode, feature) || isSameData(lastLineNode, feature);
      if (isSame) {
        firstLineNode.data = lastLineNode.data = e.localPoint;
      }
      if (this.options.adsorbOptions && isSame) {
        const adsorbPosition = this.resetAdsorbLngLat(e);
        if (adsorbPosition) {
          firstLineNode.data = lastLineNode.data = adsorbPosition;
        }
      }
      super.onPointDragging(e);
      this.syncPolygonNodes(editPolygon, nodes);
      this.setActivePolygon(editPolygon);
    }
    return feature;
  }

  onLineDragging(e: IMouseEvent) {
    const dragPolygon = this.dragPolygon;
    const feature = super.onLineDragging(e);
    if (feature && dragPolygon) {
      const lineNodes = feature.properties.nodes;
      this.syncPolygonNodes(dragPolygon, lineNodes.slice(0, lineNodes.length - 1));
      this.emit(DrawEvent.Dragging, dragPolygon, this.getPolygonData());
    }
    return feature;
  }

  onMidPointClick(e: IMouseEvent<IMidPointData>): IPointData | undefined {
    const feature = super.onMidPointClick(e);
    const editPolygon = this.editPolygon;
    if (feature && editPolygon) {
      this.emit(DrawEvent.Edit, editPolygon, this.getPolygonData());
      this.emit(DrawEvent.AddNode, feature, editPolygon, this.getPolygonData());
    }
    return feature;
  }

  onSceneMouseMove(e: IMouseEvent) {
    const drawPolygon = this.drawPolygon;
    const nodes = drawPolygon?.properties.nodes ?? [];
    if (!drawPolygon || !nodes.length) {
      return;
    }
    if (this.options.adsorbOptions) {
      this.resetAdsorbLngLat(e);
    }
    const mousePosition = e.localPoint;
    const dashLineData: IDashLineData[] = [];
    dashLineData.push(createDashLine([mousePosition, first(nodes)!.data]));
    if (nodes.length > 1) {
      dashLineData.push(createDashLine([mousePosition, last(nodes)!.data]));
    }
    if (this.options.liveUpdate && nodes.length >= 2) {
      const nodePositions = nodes.map((v) => v['data']);
      drawPolygon.data = [
        ...nodePositions,
        {
          x: mousePosition.x,
          y: mousePosition.y,
        },
        nodePositions[0],
      ];
      this.setPolygonData(this.getPolygonData());
    }
    this.setDashLineData(dashLineData);
  }

  removeNode(node: IPointData | string, feature: IPolygonData | string) {
    const targetFeature = this.getTargetFeature(feature) as IPolygonData | undefined;
    const targetNode = this.getTargetFeature(node, targetFeature?.properties.nodes ?? []);
    if (targetFeature && targetNode) {
      const nodes = targetFeature?.properties.nodes ?? [];
      if (nodes.length < 4) {
        return;
      }
      this.syncPolygonNodes(
        targetFeature,
        nodes.filter((node) => !isSameData(targetNode, node)),
      );
      this.emit(DrawEvent.RemoveNode, targetNode, targetFeature, this.getLineData());
      this.emit(DrawEvent.Edit, targetFeature, this.getPolygonData());
    }
  }

  onPointContextMenu(e: IMouseEvent<IPointData>) {
    const editPolygon = this.editPolygon;
    let deleteNode = e.source!;
    const nodes = editPolygon?.properties.nodes ?? [];
    if (!editPolygon || nodes.length < 4) {
      return;
    }
    if (!nodes.find((node) => isSameData(node, deleteNode))) {
      deleteNode = nodes[0];
    }
    this.removeNode(deleteNode, editPolygon);
    return deleteNode;
  }

  bindPointRenderEvent() {
    super.bindPointRenderEvent();
    this.pointRender?.on(RenderEvent.Contextmenu, this.onPointContextMenu.bind(this));
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
}
