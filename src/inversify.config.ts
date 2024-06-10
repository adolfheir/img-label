import { EventEmitter } from 'eventemitter3';
import { Container, decorate, injectable } from 'inversify';
import { CoreService } from './services/core';
import { ICoreService } from './services/core/interface';
import { CropService } from './services/crop';
import { ICropService } from './services/crop/interface';
import { DrawGroupService } from './services/draw-group';
import { IDrawGroupService } from './services/draw-group/interface';
import { FaceService } from './services/face';
import { IFaceService } from './services/face/interface';
import { ImgService } from './services/img';
import { IImgService } from './services/img/interface';
import { ShapeService } from './services/shape';
import { IShapeService } from './services/shape/interface';
import { Shape } from './services/shape/interface';
import { TYPES } from './types';

// @see https://github.com/inversify/InversifyJS/blob/master/wiki/container_api.md#defaultscope
// export const container = new Container();

// @see https://github.com/inversify/InversifyJS/blob/master/wiki/inheritance.md#what-can-i-do-when-my-base-class-is-provided-by-a-third-party-module
decorate(injectable(), EventEmitter);

let idCounter = 0;
export const createContainer = () => {
  const container = new Container({ defaultScope: 'Singleton' });

  container.bind<ICoreService>(TYPES.ICore).to(CoreService).inSingletonScope();

  container.bind<IImgService>(TYPES.IImg).to(ImgService).inSingletonScope();

  container
    .bind<IShapeService<Shape>>(TYPES.IShape)
    .to(ShapeService<Shape>)
    .inSingletonScope();

  container.bind<IDrawGroupService>(TYPES.IDrawGroup).to(DrawGroupService).inSingletonScope();

  container.bind<IFaceService>(TYPES.IFace).to(FaceService).inSingletonScope();

  container.bind<ICropService>(TYPES.ICrop).to(CropService).inSingletonScope();

  return container;
};

// export const destroy = (container: Container) => {
//   // 获取所有可重置服务
//   // const resettableServices = container.getAll<IResettableService>('IResettableService');
//   // resettableServices.forEach((service) => service.reset());
// };

export type { Container };
