import { cloneDeep, fromPairs } from 'lodash';
import EventEmitter from 'eventemitter3';
import { ICoreService } from '../../core/interface';
import { SourceEvent } from '../constants';
import { BaseRender } from '../render';
import { DataUpdater, IBsaeData, IRenderType, RenderMap, SourceData, SourceOptions } from '../typings';
import { History } from './history';

export const DEFAULT_SOURCE_DATA: SourceData = {
  point: [],
  line: [],
  polygon: [],
  midPoint: [],
  dashLine: [],
};

export class Source extends EventEmitter<SourceEvent | keyof typeof SourceEvent> {
  /**
   * 场景service
   */
  protected CoreService: ICoreService;

  /**
   * 用于存储渲染器render映射
   * @protected
   */
  protected render: RenderMap;

  /**
   * 用于存储当前最新数据
   * @protected
   */
  protected data: SourceData = cloneDeep(DEFAULT_SOURCE_DATA);

  /**
   * 存储当前延迟更新函数的timeout
   * @protected
   */
  protected timeout: number | null = null;

  /**
   * 用于需要待更新的renderType以及对应的最新数据
   * @protected
   */
  protected diffData: Partial<SourceData> = {};

  protected featureType: 'point' | 'line' | 'polygon';

  /**
   *
   * @protected
   */
  protected history?: History;

  constructor({ CoreService, data, render, history: historyConfig }: SourceOptions) {
    super();

    this.render = render;
    this.CoreService = CoreService;

    if (historyConfig) {
      this.history = new History({
        config: historyConfig,
      });
    }

    if (data) {
      this.setData(data);
    }

    this.featureType = (() => {
      if (render.polygon) {
        return 'polygon';
      }
      if (render.line) {
        return 'line';
      }
      return 'point';
    })();
  }

  saveHistory() {
    return this.history?.save(this.data);
  }

  revertHistory() {
    const data = this.history?.revert();
    if (data) {
      this.setData(data);
      return data;
    }
  }

  redoHistory() {
    const data = this.history?.redo();
    if (data) {
      this.setData(data);
      return data;
    }
  }

  /**
   * 更新数据的方法，新的数据会累积延迟更新
   * @param data
   */
  setData(data: Partial<SourceData>) {
    if (Object.keys(data).length) {
      this.data = {
        ...this.data,
        ...data,
      };

      this.diffData = {
        ...this.diffData,
        ...data,
      };

      this.emit(SourceEvent.Change, {
        data: this.data,
      });

      //不走延迟
      this.updateDiffData();
      // requestAnimationFrame(() => {
      //   this.CoreService.app.renderer.render(this.CoreService.app.stage);
      // });
    }

    return this.data;
  }

  /**
   * 根据当前diffData中积累的数据更新对应render
   */
  updateDiffData() {
    const renderTypes = Object.entries(this.diffData) as [IRenderType, IBsaeData[]][];
    if (renderTypes.length) {
      renderTypes.forEach(([renderType, renderData]) => {
        if (Array.isArray(renderData)) {
          this.getRender(renderType)?.setData(renderData);
        }
      });
      this.emit(SourceEvent.Update, this.data, this.diffData);
      this.diffData = {};
      this.timeout = null;
      // requestAnimationFrame(() => {
      //   this.scene.render();
      // });
    }
  }

  /**
   * 获取全量source数据
   */
  getData() {
    return this.data;
  }

  /**
   * 获取单项source数据
   * @param renderType
   */
  getRenderData<F>(renderType: IRenderType) {
    return this.data[renderType] as unknown as F[];
  }

  /**
   * 设置单项
   * @param renderType
   * @param updater
   */
  setRenderData<F extends IBsaeData>(renderType: IRenderType, updater: DataUpdater<F>) {
    const data = typeof updater === 'function' ? updater(this.getRenderData(renderType)) : updater;

    this.setData({
      [renderType]: data,
    });

    this.emit(SourceEvent.Change, this.data);
    return data;
  }

  /**
   * 获取对应renderType类型的render实例，如果没有获取到则代表
   * @param type
   */
  getRender<R extends BaseRender = BaseRender>(type: IRenderType): R | undefined {
    return this.render[type] as R | undefined;
  }

  /**
   * 清空所有数据
   */
  clear() {
    this.setData(fromPairs(Object.keys(this.render).map((renderType) => [renderType, []])));
  }
}
