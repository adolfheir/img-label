import 'reflect-metadata';

import { Container, decorate, injectable } from 'inversify';
import { CoreService, ICoreService } from './services/core';
import { ImgService, IImgService } from './services/img';
import { ShapeService, IShapeService } from './services/shape';
import { DrawFaceService, IDrawFaceService } from './services/drawFace';
import { CropService, ICropService } from './services/crop';
import { IDrawService, DrawService } from './services/draw';
import { EventEmitter } from 'eventemitter3';
import { TYPES } from './types';

// @see https://github.com/inversify/InversifyJS/blob/master/wiki/container_api.md#defaultscope
// export const container = new Container();

// @see https://github.com/inversify/InversifyJS/blob/master/wiki/inheritance.md#what-can-i-do-when-my-base-class-is-provided-by-a-third-party-module
decorate(injectable(), EventEmitter);

let idCounter = 0;
export const createContainer = () => {
  const container = new Container();

  container.bind<ICoreService>(TYPES.ICore).to(CoreService).inSingletonScope();

  container.bind<IImgService>(TYPES.IImg).to(ImgService).inSingletonScope();

  container.bind<IShapeService>(TYPES.IShape).to(ShapeService).inSingletonScope();

  container.bind<IDrawService>(TYPES.IDraw).to(DrawService).inSingletonScope();

  container.bind<IDrawFaceService>(TYPES.IDrawFace).to(DrawFaceService).inSingletonScope();

  container.bind<ICropService>(TYPES.ICrop).to(CropService).inSingletonScope();

  return container;
};

export type { Container };
