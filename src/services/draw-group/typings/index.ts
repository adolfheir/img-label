export * from './drawer';
export * from './event';
export * from './helper';
export * from './render';
export * from './source';

/**
 * 赋予参数对象T深度可选
 */
export type DeepPartial<T> = {
  [P in keyof T]?: DeepPartial<T[P]>;
};
