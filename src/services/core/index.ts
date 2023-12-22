/* 此处维护container作为缩放矩阵的画布 */
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
import { SmoothGraphics as Graphics, DashLineShader } from '@pixi/graphics-smooth';
import { addEventListener } from '../../helpers/addEventListener';
import type { ICoreService, Limit } from './interface';

export type { ICoreService } from './interface';

/* 变换矩阵 */
/* a:水平缩放，d垂直缩放，b:旋转, c:倾斜 tx:水平偏移 ty:垂直偏移 */
// | a  b  tx |
// | c  d  ty |
// | 0  0  1  |

// applyInverse逆变换:  从世界坐标系转换到子元素的局部坐标系
// apply: 从子元素的局部坐标系转换到世界坐标系

/* 默认缩放 */

const defaultLimit: Limit = {
  maxZoom: 20,
  minZoom: 0.01,
  padding: 50,
};

@injectable()
export class CoreService implements ICoreService {
  public dom?: HTMLElement;

  /* 缓存所有清理函数 */
  private destoryfnList: Function[] = [];

  /* pixi */
  public app: Application<HTMLCanvasElement>;
  public globalContainer: Container<DisplayObject>;
  public boxContainer: Container<DisplayObject>;

  private boxGraphics?: Graphics; //截图框
  private limit: Limit = defaultLimit;

  private isZoomAndScaleAbel?: boolean;

  constructor() {
    this.app = new Application<HTMLCanvasElement>({
      //透明
      backgroundAlpha: 0,
      //抗锯齿
      antialias: true,
    });
    // 创建一个container
    this.globalContainer = new Container();
    this.globalContainer.sortableChildren = true; //层级控制
    this.boxContainer = new Container();
  }

  async init(dom: HTMLElement) {
    //dom 处理
    dom.appendChild(this.app.view);
    this.dom = dom;
    this.destoryfnList.push(
      addEventListener(dom, 'wheel', (event) => event.preventDefault()),
      addEventListener(dom, 'contextmenu', (event) => event.preventDefault()),
      // addEventListener(dom, "click", event => event.preventDefault())
    );

    //设置一个空container截屏用
    let graphics = new Graphics();
    // graphics.beginFill(0xFF0000); // 设置填充颜色为红色
    graphics.drawShape(this.app.renderer.screen);
    // graphics.endFill()
    this.boxGraphics = graphics;
    // graphics.zIndex = -99
    this.boxContainer.addChild(this.boxGraphics);
    this.app.stage.addChild(this.boxContainer);

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
    });

    /* ============================== 测试 =============================== */
    // this.globalContainer.interactive = true
    // this.boxContainer.interactive = true
    // this.globalContainer.addEventListener("click", (e) => {
    //   console.log("click globalContainer",)
    //   // e.stopPropagation()
    // })
    // this.boxContainer.addEventListener("click", (e) => {
    //   console.log("click boxGraphics",)
    //   // e.stopPropagation()
    // })
    // this.app.stage.addEventListener("click", (e) => {
    //   console.log("click stage", e.target === this.globalContainer, e.target === this.boxContainer)
    //   // e.stopPropagation()
    // })
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
  }

  setLimit(limit: Partial<Limit>) {
    this.limit = Object.assign(this.limit, limit);
  }

  ableZoomAndScale(able: boolean) {
    this.isZoomAndScaleAbel = able;
  }

  async extractScreenCanvas() {
    return await this.app.renderer.extract.canvas(this.app.stage, this.app.renderer.screen);
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

    this.app.destroy(true);
  }
}
