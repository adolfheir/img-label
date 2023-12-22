import {
  Assets,
  Sprite,
  Container,
  DisplayObject,
  FederatedPointerEvent,
  ObservablePoint,
  Matrix,
  Transform,
} from 'pixi.js';

export class CustomContainer extends Container {
  public __IS_DRAW_CONTAINER__: boolean;
  id: string;

  constructor(id: string) {
    super();
    this.id = id;
    // 添加自定义属性
    this.__IS_DRAW_CONTAINER__ = true;
  }

  // // 添加自定义方法
  // customMethod() {
  //     console.log('Custom method called');
  // }
}

export default CustomContainer;
