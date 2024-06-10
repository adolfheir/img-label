import 'reflect-metadata/lite';

export { TYPES } from './types';

export { CoreService } from './services/core';
export * from './services/core/interface';

export { ImgService } from './services/img';
export * from './services/img/interface';

export { CropService } from './services/crop';
export * from './services/crop/interface';

export { ShapeService } from './services/shape';
export * from './services/shape/interface';
export { drawFn } from './services/shape/draw';
export { drawFn as drawFn2 } from './services/shape/draw2';

export { FaceService } from './services/face';
export * from './services/face/interface';

export { DrawGroupService } from './services/draw-group';
export * from './services/draw-group/interface';

export { createContainer } from './inversify.config';
export type { Container } from './inversify.config';
