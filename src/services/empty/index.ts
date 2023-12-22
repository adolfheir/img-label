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
import type { ITestService } from './interface';

export type { ITestService } from './interface';

@injectable()
export class TestService implements ITestService {
  @inject(TYPES.ICore) private readonly CoreService!: ICoreService;

  async destroy() {}
}
