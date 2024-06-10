import { injectable, inject } from 'inversify';
import { TYPES } from '../../types';
import type { ICoreService } from '../core/interface';
import {
  PointDrawer,
  LineDrawer,
  PolygonDrawer,
  IPointDrawerOptions,
  ILineDrawerOptions,
  IPolygonDrawerOptions,
} from './draw';
import type { DeepPartial, DrawInfoMap, DrawType, IDrawGroupService, UseDrawGroupConfig } from './interface';

@injectable()
export class DrawGroupService implements IDrawGroupService {
  @inject(TYPES.ICore) private readonly CoreService!: ICoreService;

  drawInfoMap: DrawInfoMap = {};

  get pointDrawer() {
    return this.drawInfoMap['point'];
  }
  get lineDrawer() {
    return this.drawInfoMap['line'];
  }
  get polygonDrawer() {
    return this.drawInfoMap['polygon'];
  }

  activeDrawType?: DrawType;
  get activeDrawer() {
    let drawtype = this.activeDrawType;
    switch (drawtype) {
      case 'point':
        return this.pointDrawer;
      case 'line':
        return this.lineDrawer;
      case 'polygon':
        return this.polygonDrawer;
      default:
        return undefined;
    }
  }
  constructor() {}

  initDrawer(groupConfig: UseDrawGroupConfig) {
    for (const key in groupConfig) {
      const config = groupConfig[key as keyof UseDrawGroupConfig];
      if (config) {
        switch (key) {
          case 'point':
            this.drawInfoMap['point'] = new PointDrawer(this.CoreService, config as DeepPartial<IPointDrawerOptions>);
            break;
          case 'line':
            this.drawInfoMap['line'] = new LineDrawer(this.CoreService, config as DeepPartial<ILineDrawerOptions>);
            break;
          case 'polygon':
            this.drawInfoMap['polygon'] = new PolygonDrawer(
              this.CoreService,
              config as DeepPartial<IPolygonDrawerOptions>,
            );
            break;
        }
      }
    }
  }

  setActiveDraw(target: DrawType) {
    this.activeDrawType = target;
    for (const key in this.drawInfoMap) {
      const draw = this.drawInfoMap[key as keyof DrawInfoMap];
      let able = target == key;
      if (able) {
        draw?.enable();
      } else {
        draw?.disable();
      }
    }
  }

  destroy() {
    for (const key in this.drawInfoMap) {
      const draw = this.drawInfoMap[key as keyof DrawInfoMap];
      draw?.destroy();
    }
    this.activeDrawType = undefined;
  }
}
