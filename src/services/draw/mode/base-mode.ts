import EventEmitter from 'eventemitter3';
import { cloneDeep, debounce, fromPairs, isArray, isEqual, merge, toPairs } from 'lodash';
import Mousetrap from 'mousetrap';
import { SceneRender } from '../render';
import { RENDER_MAP } from '../../draw/render';
import { Source } from '../source';
import { Cursor, ICursorType, Popup, PopupContent } from '../interactive';
import { IBsaeData, IMouseEvent, IRenderType, Position, RenderMap } from '../typings';
import { DrawEvent } from '../constants';
import type { ICoreService } from '../../core/interface';
import { isSameData } from '../utils/data';

export type KeyBoardConfig = Partial<{
  remove: string[] | false;
  revert: string[] | false;
  redo: string[] | false;
}>;

export type LimitBox = {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
} | null;

export abstract class BaseMode extends EventEmitter<DrawEvent | keyof typeof DrawEvent> {
  /**
   * 全局service
   */
  protected CoreService: ICoreService;

  /**
   * 渲染器render对象
   */
  protected render: RenderMap;

  /**
   * scene相关事件管理
   * @protected
   */
  protected sceneRender: SceneRender;

  /**
   * 指针管理器
   * @protected
   */
  protected cursor: Cursor;

  /**
   * 指针管理器
   * @protected
   */
  protected source: Source;

  /**
   * 提示组件
   */
  protected popup?: Popup;

  /**
   * 当前Drawer是否为开启绘制状态
   */
  protected enabled = true;

  // 在 enable 时传入，用于判断当前是否支持添加操作
  protected allowCreate = true;

  /**
   * 本次enable添加的绘制物个数
   * @protected
   */
  protected addCount = 0;

  /**
   * 当期是否可以添加新的绘制物
   */
  get addable() {
    const data = this.getData();
    const { multiple, maxCount } = this.options;
    const drawItem = data.find((item) => item.properties.isDraw);
    if (!this.enabled) {
      return false;
    }
    if ((multiple && maxCount <= 0) || drawItem) {
      return true;
    }
    if (!multiple && this.addCount >= 1) {
      return false;
    }
    if (maxCount > 0 && data.length >= maxCount) {
      return false;
    }
    return true;
  }

  protected limitBox: {
    minX: number;
    maxX: number;
    minY: number;
    maxY: number;
  } | null = null;

  protected options: {
    editable: boolean;
    autoActive: boolean;
    multiple: boolean;
    helper: any | boolean;
    maxCount: number;
    /* 中点 */
    showMidPoint: boolean;
    /* line */
    adsorbOptions: boolean;

    distanceOptions: boolean;

    liveUpdate: boolean;

    keyboard: KeyBoardConfig;
  } = {
    editable: true,
    autoActive: true,
    multiple: true,
    helper: true,
    maxCount: 2,
    showMidPoint: true,
    adsorbOptions: true,
    //展示距离
    distanceOptions: false,

    liveUpdate: true,

    keyboard: {
      remove: ['del', 'backspace'],
      revert: ['command+z', 'ctrl+z'],
      redo: ['command+shift+z', 'ctrl+shift+z'],
    },
  };

  constructor(CoreService: ICoreService) {
    super();
    this.CoreService = CoreService;
    this.render = this.initRender();
    this.sceneRender = new SceneRender(CoreService);

    this.source = new Source({
      render: this.render,
    });
    this.cursor = new Cursor(CoreService);
    this.popup = new Popup(CoreService, {});

    this.options.helper = this.getHelper();

    //初始化
    // this.bindCommonEvent();
    this.bindEnableEvent();
  }

  setLimitBox = (limitBox: LimitBox) => {
    this.limitBox = limitBox;
  };

  protected calcLimitAble = (data: Position | Position[]) => {
    let _d = isArray(data) ? data : [data];
    let able = true;
    if (this.limitBox) {
      const { minX, minY, maxX, maxY } = this.limitBox;
      let hasDisabelItem = _d.some((point) => {
        let disable = false;
        if (point.x > maxX || point.x < minX || point.y > maxY || point.y < minY) {
          disable = true;
        }
        return disable;
      });
      if (hasDisabelItem) {
        able = false;
      }
    }
    return able;
  };

  /**
   * 获取当前Drawer需要用到的render类型数据，避免创建无效的Render
   */
  abstract getRenderTypes(): IRenderType[];

  /**
   * 根据子类实现的 getRenderTypes 方法，初始化对应的Render实例。
   */
  initRender = () => {
    const renderMap: RenderMap = {};
    const renderTypeList = this.getRenderTypes();

    for (const renderType of renderTypeList) {
      const Render = RENDER_MAP[renderType];
      //@ts-ignore
      renderMap[renderType] = new Render(this.CoreService);
    }

    return renderMap as RenderMap;
  };

  /**
   * 设置地图上光标样式类型
   * @param cursor
   */
  setCursor(cursor: ICursorType | null) {
    this.cursor.setCursor(cursor);
  }

  /**
   * 重置光标到常规状态
   */
  resetCursor() {
    //TODO: addable
    let addable = true;
    this.setCursor(addable ? 'draw' : null);
  }

  /**
   * 提示框文案
   */
  protected abstract getHelper(): any;

  /**
   * 提示框
   */
  setHelper(type: PopupContent | null) {
    const { helper } = this.options;
    if (!helper) {
      return;
    }
    // @ts-ignore
    const content = (type in helper ? helper[type] : type) ?? null;
    this.popup?.setContent(content);
  }

  /**
   * 启用 Drawer
   * @param allowCreate 是否支持添加操作
   */
  enable(allowCreate = true) {
    this.allowCreate = allowCreate;
    this.addCount = 0;
    this.enabled = true;
    this.bindEnableEvent();
    this.resetCursor();
    this.setHelper(this.addable ? 'draw' : null);
    setTimeout(() => {
      this.emit(DrawEvent.Enable, this);
    }, 0);
  }

  /**
   * 禁用Drawer
   */
  disable() {
    this.resetFeatures();
    this.enabled = false;
    this.setCursor(null);
    this.unbindEnableEvent();
    this.addCount = 0;
    this.setHelper(null);
    setTimeout(() => {
      this.emit(DrawEvent.Disable, this);
    }, 0);
  }

  /**
   * 键盘事件
   */
  bindEnableEvent() {
    const { revert, redo, remove } = this.options.keyboard || {};
    remove &&
      Mousetrap.bind(remove, () => {
        this.removeActiveFeature();
      });
    // if (this.options.history) {
    //     revert && Mousetrap.unbind(revert);
    //     redo && Mousetrap.unbind(redo);
    // }
  }
  unbindEnableEvent() {
    const { revert, redo, remove } = this.options.keyboard || {};
    remove && Mousetrap.unbind(remove);
  }

  /**
   * 光标在地图上移动时的回调，子类均会重写该方法
   * @param e
   */
  abstract onSceneMouseMove(e: IMouseEvent): void;

  /**
   * 获取数据
   */
  abstract getData(): IBsaeData[];

  /**
   * 设置数据
   * @param data
   */
  abstract setData(data: IBsaeData[]): void;

  // 清除当前正在绘制中的绘制物，同时将当前激活态的绘制物置为普通态
  abstract resetFeatures(): void;

  /**
   * 删除当前active的绘制物
   */
  removeActiveFeature() {
    const activeItem = this.getData().find((item) => {
      const { isActive, isDraw } = item.properties;
      return isActive || isDraw;
    });
    if (activeItem) {
      this.removeFeature(activeItem);
    }
    return activeItem;
  }
  /**
   * 删除指定
   * @param target
   */
  removeFeature(target: IBsaeData | string) {
    const data = this.getData();
    const targetFeature = this.getTargetFeature(target);
    if (targetFeature) {
      this.setData(data.filter((feature) => !isSameData(targetFeature, feature)));
      this.emit(DrawEvent.Remove, target, this.getData());
    }
  }

  // 传入 Feature 或者 id 获取当前数据中的目标 Feature
  getTargetFeature = (target: IBsaeData | string | null | undefined, data = this.getData()) => {
    let targetFeature: IBsaeData | null = null;
    if (target) {
      targetFeature =
        data.find(
          (feature) => feature.properties.id === (typeof target === 'string' ? target : target.properties?.id),
        ) ?? null;
      if (!targetFeature && target instanceof Object) {
        targetFeature = data.find((feature) => isEqual(target, feature)) ?? null;
      }
    }
    return targetFeature;
  };

  /**
   * 销毁当前Drawer
   */
  destroy() {
    Object.values(this.render).forEach((render) => {
      render.destroy();
    });
    this.sceneRender?.destroy?.();

    setTimeout(() => {
      Object.values(DrawEvent).forEach((EventName) => {
        this.removeAllListeners(EventName);
      });
    }, 0);
    this.popup?.destroy();
    this.cursor.destroy();
    this.emit(DrawEvent.Destroy, this);
  }
}
