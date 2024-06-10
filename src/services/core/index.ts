/* 此处维护container作为缩放矩阵的画布 */
import { cloneDeep } from 'lodash';
import { SmoothGraphics as Graphics, DashLineShader } from '@pixi/graphics-smooth';
import EventEmitter from 'eventemitter3';
import { injectable } from 'inversify';
import {
  Application,
  Sprite,
  Container,
  DisplayObject,
  FederatedPointerEvent,
  ObservablePoint,
  Point,
  Matrix,
  Rectangle,
  Transform,
} from 'pixi.js';
import { addEventListener } from '../../helpers/addEventListener';
import { ICoreService, Limit, CoreServiceEvent } from './interface';

/* 变换矩阵 */
/* a:水平缩放，d垂直缩放，b:旋转, c:倾斜 tx:水平偏移 ty:垂直偏移 */
// | a  b  tx |
// | c  d  ty |
// | 0  0  1  |

// applyInverse逆变换:  从世界坐标系转换到子元素的局部坐标系
// apply: 从子元素的局部坐标系转换到世界坐标系

// globalpoint 此组件内可以理解为相对于canvas原点
// localpoint 此实现内理解为相对于坐标轴原点

/* 默认缩放 */

const defaultLimit: Limit = {
  maxZoom: 20,
  minZoom: 0.01,
  padding: 50,
};
@injectable()
export class CoreService extends EventEmitter<`${CoreServiceEvent}`> implements ICoreService {
  public dom?: HTMLElement;

  /* 缓存所有清理函数 */
  private destoryfnList: Function[] = [];

  /* pixi */
  public app: Application<HTMLCanvasElement>;
  public globalContainer: Container<DisplayObject>;
  public minScreenContainer: Container<DisplayObject>; //为了屏幕截图 保证舞台最小范围

  private boxGraphics?: Graphics; //截图框
  private limit: Limit = cloneDeep(defaultLimit);

  private isZoomAndScaleAbel?: boolean;
  constructor() {
    super();
    this.app = new Application<HTMLCanvasElement>({
      //透明
      backgroundAlpha: 0,
      //抗锯齿
      antialias: true,

      /* 模糊 */
      autoDensity: true,
    });
    (globalThis as any).__PIXI_APP__ = this.app;
    // 创建一个container
    this.globalContainer = new Container();
    this.globalContainer.sortableChildren = true; //层级控制
    this.minScreenContainer = new Container();
  }

  async init(dom: HTMLElement) {
    //dom 处理
    let { width, height } = dom.getBoundingClientRect();
    this.app.renderer.resize(width, height);
    dom.appendChild(this.app.view);
    dom.style.cursor = 'pointer';
    this.dom = dom;

    this.destoryfnList.push(
      addEventListener(dom, 'wheel', (event) => event.preventDefault()),
      addEventListener(dom, 'contextmenu', (event) => event.preventDefault()),
      addEventListener(window, 'resize', (event) => {
        let { width, height } = dom.getBoundingClientRect();
        this.app.renderer.resize(width, height);
      }),
    );

    //设置一个空container截屏用
    let graphics = new Graphics();
    graphics.drawShape(this.app.renderer.screen);
    this.boxGraphics = graphics;
    this.minScreenContainer.addChild(this.boxGraphics);
    this.app.stage.addChild(this.minScreenContainer);

    //全局container
    this.app.stage.addChild(this.globalContainer);

    /* 允许响应 */
    this.app.stage.eventMode = 'static';
    this.app.stage.hitArea = this.app.screen;

    let originalPos: ObservablePoint;
    let mouseDownPoint: Point;
    let isMoveAble: boolean = false;

    this.app.stage.addEventListener('pointerdown', (event: FederatedPointerEvent) => {
      if (!this.isZoomAndScaleAbel) return;

      // 记录下stage原来的位置
      originalPos = this.globalContainer.position.clone();
      // 记录下mouse down的位置
      mouseDownPoint = event.global.clone();
      isMoveAble = true;
    });
    this.app.stage.addEventListener('pointermove', (event: FederatedPointerEvent) => {
      let globalPos = event.global.clone();
      if (isMoveAble) {
        // 拖拽画布
        const dx = globalPos.x - mouseDownPoint.x;
        const dy = globalPos.y - mouseDownPoint.y;

        let matrix = this.globalContainer.localTransform.clone();
        matrix.tx = originalPos.x + dx;
        matrix.ty = originalPos.y + dy;
        this.applyMatrix(matrix);
      }
    });
    this.app.stage.addEventListener('pointerup', (event) => {
      isMoveAble = false;
    });
    let destory = addEventListener(document, 'mouseup', () => {
      isMoveAble = false;
    });
    this.destoryfnList.push(destory);

    /* 缩放实现 */
    this.app.stage.addEventListener('wheel', (event) => {
      if (!this.isZoomAndScaleAbel) return;

      //阻止不了放在dom层阻止
      // event.preventDefault();

      let delta = event.deltaY;
      let scalePoint = event.global;

      this.scaleTo(delta, scalePoint);

      // let newMatrix = this.globalContainer.localTransform.clone();
      // let prevZoom = newMatrix.a; //等比缩放
      // let zoomFactor = 0.998 ** delta;
      // let newZoom = prevZoom * zoomFactor;

      // //limit
      // newZoom = Math.max(this.limit.minZoom, Math.min(this.limit.maxZoom, newZoom));

      // zoomFactor = newZoom / prevZoom; //重新计算缩放因子
      // newMatrix.translate(-scalePoint.x, -scalePoint.y); // 先将点移动到原点
      // newMatrix.scale(zoomFactor, zoomFactor);
      // newMatrix.translate(scalePoint.x, scalePoint.y); // 将点移动回原来的位置

      // this.globalContainer.localTransform.toString();
      // this.applyMatrix(newMatrix);
    });

    /* ============================== 测试 =============================== */
    // this.globalContainer.interactive = true
    // this.minScreenContainer.interactive = true
    // this.globalContainer.addEventListener('click', (e) => {
    //   console.log('click globalContainer', e);
    //   // e.stopPropagation()
    // });
    // this.minScreenContainer.addEventListener('click', (e) => {
    //   console.log('click boxGraphics', e);
    //   // e.stopPropagation()
    // });
    // this.app.stage.addEventListener('click', (e) => {
    //   console.log('click stage', e);
    //   let wordPoint = e.global.clone();
    //   let loclaPoint = this.globalContainer.localTransform.applyInverse(wordPoint);
    //   let wordPoint2 = this.globalContainer.localTransform.apply(loclaPoint);
    //   console.log('wordPoint', wordPoint, loclaPoint, wordPoint2);
    // });
  }

  scaleTo(
    delta: number,
    origin?: {
      x: number;
      y: number;
    },
  ) {
    if (!this.isZoomAndScaleAbel) return;

    let scalePoint = origin;
    if (!scalePoint) {
      let { width = 0, height = 0 } = this.dom?.getBoundingClientRect() ?? {};
      scalePoint = {
        x: width / 2,
        y: height / 2,
      };
    }

    let newMatrix = this.globalContainer.localTransform.clone();
    let prevZoom = newMatrix.a; //等比缩放
    let zoomFactor = 0.998 ** delta;
    let newZoom = prevZoom * zoomFactor;

    //limit
    newZoom = Math.max(this.limit.minZoom, Math.min(this.limit.maxZoom, newZoom));

    zoomFactor = newZoom / prevZoom; //重新计算缩放因子
    newMatrix.translate(-scalePoint.x, -scalePoint.y); // 先将点移动到原点
    newMatrix.scale(zoomFactor, zoomFactor);
    newMatrix.translate(scalePoint.x, scalePoint.y); // 将点移动回原来的位置

    this.globalContainer.localTransform.toString();
    this.applyMatrix(newMatrix);
  }

  applyMatrix(newMatrix: Matrix) {
    /* 限制container不移出视口 */
    let { padding, box } = this.limit;
    if (box) {
      const { width: cw, height: ch } = this.app.view;
      const { width: bw, height: bh } = box;
      let topLeft = {
        x: 0 + padding,
        y: 0 + padding,
      };
      let bottomRight = {
        x: cw - padding,
        y: ch - padding,
      };
      let { x: tlx, y: tly } = topLeft;
      let { x: brx, y: bry } = bottomRight;
      let minX = tlx - bw * newMatrix.a;
      let minY = tly - bh * newMatrix.a;
      let maxX = brx;
      let maxY = bry;

      newMatrix.tx = Math.max(minX, Math.min(maxX, newMatrix.tx));
      newMatrix.ty = Math.max(minY, Math.min(maxY, newMatrix.ty));
    }

    this.globalContainer.setTransform(
      newMatrix?.tx,
      newMatrix?.ty,
      newMatrix?.a,
      newMatrix.d,
      Math.atan2(newMatrix.b, newMatrix.a),
      Math.atan2(-newMatrix.c, newMatrix.a),
      Math.atan2(newMatrix.b, newMatrix.d),
      0,
      0,
    );
    //渲染的时候回同步 这边立即同步
    this.globalContainer.updateTransform();

    this.emit(CoreServiceEvent['onTransformChange'], this.globalContainer.localTransform);
  }

  setLimit(limit: Partial<Limit>) {
    this.limit = Object.assign(this.limit, limit);
  }

  ableZoomAndScale(able: boolean) {
    this.isZoomAndScaleAbel = able;
  }

  async extractScreenCanvas() {
    let stageBounds = this.app.stage.getBounds();
    let x = 0;
    let y = 0;
    let w = this.app.renderer.screen.width;
    let h = this.app.renderer.screen.height;
    //保证原点坐标
    if (stageBounds.x < 0) {
      x = Math.abs(stageBounds.x);
    }
    if (stageBounds.y < 0) {
      y = Math.abs(stageBounds.y);
    }
    let rect: Rectangle = new Rectangle(x, y, w, h);

    return await this.app.renderer.extract.canvas(this.app.stage, rect);
  }

  destroy() {
    while (this.destoryfnList.length) {
      const close = this.destoryfnList.pop();
      if (close) {
        try {
          close();
        } catch (error) {
          console.log('err', error);
        }
      }
    }
    this.removeAllListeners();

    this.app.destroy(true);
  }
}
