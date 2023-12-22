import { injectable, inject } from 'inversify';
import {
  Assets,
  Sprite,
  Container,
  DisplayObject,
  FederatedPointerEvent,
  ObservablePoint,
  Point,
  Matrix,
  Transform,
} from 'pixi.js';
import { TYPES } from '../../types';
import type { ICoreService } from '../core/interface';
import type { IDrawService } from './interface';

export type { IDrawService } from './interface';

import { PointDrawer, LineDrawer, PolygonDrawer } from './draw';
import { BaseMode } from './mode';

export * from './typings';

@injectable()
export class DrawService implements IDrawService {
  @inject(TYPES.ICore) private readonly CoreService!: ICoreService;

  public drawMode?: PolygonDrawer;

  changeMode = () => {
    this.destroy();
    // let drawMode = new PointDrawer(this.CoreService)
    this.drawMode = new PolygonDrawer(this.CoreService);
  };

  destroy = () => {
    this.drawMode?.destroy();
    this.drawMode = undefined;
  };
}
