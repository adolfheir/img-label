import { cloneDeep, debounce, isArray, isEqual, merge } from 'lodash';
import EventEmitter from 'eventemitter3';
import Mousetrap from 'mousetrap';
import { Point } from 'pixi.js';
import type { ICoreService } from '../../core/interface';
import { DrawEvent, RenderEvent, SourceEvent } from '../constants';
import { DEFAULT_HISTORY_CONFIG, DEFAULT_KEYBOARD_CONFIG } from '../constants/drawer';
import { Cursor, DEFAULT_CURSOR_MAP, ICursorType, Popup, PopupContent } from '../interactive';
import { SceneRender } from '../render';
import { RENDER_MAP } from '../render';
import { Source } from '../source';
import { DeepPartial, IBsaeData, IMouseEvent, IRenderType, Position, RenderMap } from '../typings';
import { IBaseModeOptions, LimitBox } from '../typings/drawer';
import { isSameData } from '../utils/data';

export abstract class BaseMode<O extends IBaseModeOptions = IBaseModeOptions> extends EventEmitter<
  DrawEvent | keyof typeof DrawEvent
> {
  public static instances: BaseMode[] = [];
  /**
   * 场景service
   */
  protected CoreService: ICoreService;

  /**
   * 数据管理中心
   * @protected
   */
  protected source: Source;

  /**
   * 渲染器render对象
   */
  protected render: RenderMap;

  /**
   * 指针管理器
   * @protected
   */
  protected cursor: Cursor;

  /**
   * scene相关事件管理
   * @protected
   */
  protected sceneRender: SceneRender;

  /**
   * 提示组件
   */
  protected popup?: Popup;

  //* ============================== split =============================== */

  constructor(CoreService: ICoreService, options: DeepPartial<O>) {
    super();

    this.CoreService = CoreService;
    this.sceneRender = new SceneRender(CoreService);
    this.options = merge({}, this.getDefaultOptions(options), options);
    this.render = this.initRender();

    this.source = new Source({
      CoreService: CoreService,
      render: this.render,
      history: this.options.history || undefined,
    });

    this.cursor = new Cursor(CoreService, this.options.cursor);

    const { initialData, popup } = this.options;

    if (initialData) {
      this.setData(initialData);
    }

    if (popup) {
      this.popup = new Popup(CoreService, popup instanceof Object ? popup : {});
    }

    this.saveHistory();
    this.bindCommonEvent();
    this.emit(DrawEvent.Init, this);
    this.bindEnableEvent();

    BaseMode.instances.push(this);
  }

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

    const targetIndex = BaseMode.instances.indexOf(this);
    if (targetIndex > -1) {
      BaseMode.instances.splice(targetIndex, 1);
    }
  }

  //* ============================== able =============================== */

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

  /* ============================== 限制limit =============================== */
  setLimitBox = (limitBox: LimitBox) => {
    this.options.limitBox = limitBox;
  };
  protected calcLimitAble = (data: Position | Position[]) => {
    let _d = isArray(data) ? data : [data];
    let able = true;
    if (this.options.limitBox) {
      const { minX, minY, maxX, maxY } = this.options.limitBox;
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

  //* ============================== option =============================== */

  protected options: O;

  /**
   * 获取当前Drawer默认参数
   * @param options
   */
  abstract getDefaultOptions(options: DeepPartial<O>): O;
  /**
   * 根据用户传入的options返回通用的options默认配置
   * @param options
   */
  getCommonOptions<F extends IBsaeData = IBsaeData>(options: DeepPartial<IBaseModeOptions>): IBaseModeOptions {
    return {
      initialData: [] as F[],
      autoActive: true,
      cursor: cloneDeep(DEFAULT_CURSOR_MAP),
      editable: true,
      multiple: true,
      history: cloneDeep(DEFAULT_HISTORY_CONFIG),
      keyboard: cloneDeep(DEFAULT_KEYBOARD_CONFIG),
      popup: true,
      helper: {},
      maxCount: -1,
      ...options,
    } as IBaseModeOptions;
  }

  /* ============================== cursor =============================== */
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
    this.setCursor(this.addable ? 'draw' : null);
  }

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

  /* ============================== able =============================== */

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

  /* ==============================通用事件 =============================== */

  bindCommonEvent() {
    this.on(DrawEvent.Add, this.emitChangeEvent);
    this.on(DrawEvent.Add, () => {
      this.addCount++;
    });
    this.on(DrawEvent.Edit, this.emitChangeEvent);
    this.on(DrawEvent.Remove, this.emitChangeEvent);
    this.on(DrawEvent.Clear, this.emitChangeEvent);
    this.on(DrawEvent.AddNode, this.saveHistory);
    this.on(DrawEvent.RemoveNode, this.emitChangeEvent);
    this.bindEmitSelectEvent(true);
  }

  /**
   * 绑定判断 select 事件方法
   * @param emit
   */
  bindEmitSelectEvent(emit = false) {
    let previousSelectFeature: IBsaeData | null = null;
    const onSourceChange = () => {
      const newSelectFeature = this.getData().find((feature) => feature.properties?.isActive) || null;
      if (previousSelectFeature?.properties?.id !== newSelectFeature?.properties?.id) {
        // @ts-ignore
        previousSelectFeature = newSelectFeature;
        this.emit(DrawEvent.Select, newSelectFeature);
      }
    };
    this.source.on(SourceEvent.Change, onSourceChange);
    if (emit) {
      onSourceChange();
    }
  }

  /**
   * 触发change事件，同时触发保存数据备份
   */
  emitChangeEvent() {
    this.emit(DrawEvent.Change, this.getData());
    this.saveHistory();
  }

  bindEnableEvent() {
    this.unbindKeyboardEvent();
    // this.scene.setMapStatus({
    //   doubleClickZoom: false,
    // });
    this.sceneRender.on(RenderEvent.Mousemove, this.saveMouseLngLat);
    this.bindKeyboardEvent();
  }

  unbindEnableEvent() {
    // this.scene.setMapStatus({
    //   doubleClickZoom: true,
    // });
    this.sceneRender.off(RenderEvent.Mousemove, this.saveMouseLngLat);
    this.unbindKeyboardEvent();
  }

  bindKeyboardEvent() {
    const { revert, redo, remove } = this.options.keyboard || {};
    remove &&
      Mousetrap.bind(remove, () => {
        this.removeActiveFeature();
      });
    if (this.options.history) {
      revert && Mousetrap.bind(revert, this.revertHistory);
      redo && Mousetrap.bind(redo, this.redoHistory);
    }
  }

  unbindKeyboardEvent() {
    const { revert, redo, remove } = this.options.keyboard || {};
    remove && Mousetrap.unbind(remove);
    if (this.options.history) {
      revert && Mousetrap.unbind(revert);
      redo && Mousetrap.unbind(redo);
    }
  }

  /**
   * 光标在地图上移动时的回调，子类均会重写该方法
   * @param e
   */
  abstract onSceneMouseMove(e: IMouseEvent): void;

  /* ============================== history =============================== */
  /**
   * 光标的位置
   * @protected
   */
  protected mouseLngLat: IMouseEvent = {
    wordPoint: new Point(0, 0),
    localPoint: new Point(0, 0),
  };

  // 用于收集当前鼠标所在经纬度的回调函数，用于在数据回退时，若有存在绘制中的数据，伪造mousemove事件时使用
  saveMouseLngLat = debounce(
    (e: IMouseEvent<IBsaeData>) => {
      this.mouseLngLat = e;
    },
    100,
    {
      maxWait: 100,
    },
  );
  /**
   * 矫正正在绘制Feature的虚线部分（Drawer中都是在onSceneMouseMove中进行绘制）
   */
  correctDrawItem() {
    const drawItem = this.getData().find((item) => item.properties?.isDraw);
    // 如果当前有正在绘制的元素，需要将虚线部分与鼠标位置表现一致，而非history保存时的虚线位置
    if (drawItem) {
      this.onSceneMouseMove(this.mouseLngLat);
    }
  }

  /**
   * 保存当前数据备份
   */
  saveHistory = debounce(() => {
    if (!this.options.history) {
      return;
    }
    this.source.saveHistory();
  }, 100);

  /**
   * 回退至上一次数据备份
   */
  revertHistory() {
    if (!this.enabled || !this.options.history) {
      return;
    }
    if (this.source.revertHistory()) {
      this.correctDrawItem();
      this.emit(DrawEvent.Change, this.getData());
    }
  }

  /**
   * 重做回退之前的数据备份
   */
  redoHistory() {
    if (!this.enabled || !this.options.history) {
      return;
    }
    if (this.source.redoHistory()) {
      this.correctDrawItem();
      this.emit(DrawEvent.Change, this.getData());
    }
  }

  /* ============================== 数据操作 =============================== */
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
    const targetFeature = this.getTargetData(target);
    if (targetFeature) {
      this.setData(data.filter((feature) => !isSameData(targetFeature, feature)));
      this.emit(DrawEvent.Remove, target, this.getData());
    }
  }

  // 传入 Feature 或者 id 获取当前数据中的目标 Feature
  getTargetData = (target: IBsaeData | string | null | undefined, data = this.getData()) => {
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
}
