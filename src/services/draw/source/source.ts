import EventEmitter from 'eventemitter3';
import { cloneDeep, fromPairs } from 'lodash';
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
   *
   * @protected
   */
  protected history?: History;

  constructor({ data, render }: SourceOptions) {
    super();

    this.render = render;
    this.history = new History({
      config: {
        maxSize: 100,
      },
    });
    if (data) {
      this.setData(data);
    }
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
   * @param data
   */
  setData(data: Partial<SourceData>) {
    if (Object.keys(data).length) {
      this.data = {
        ...this.data,
        ...data,
      };

      const renderTypes = Object.entries(this.data) as [IRenderType, IBsaeData[]][];

      renderTypes.forEach(([renderType, renderData]) => {
        if (Array.isArray(renderData)) {
          this.getRender(renderType)?.setData(renderData);
        }
      });

      this.emit(SourceEvent.Change, {
        data: this.data,
      });
    }

    return this.data;
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
    let _data = [...data].sort((a, b) => {
      // @ts-ignore
      return +a.properties.isActive - +b.properties.isActive;
    });

    this.setData({
      //@ts-ignore
      [renderType]: _data,
    });
    //@ts-ignore
    this.getRender(renderType)?.setData(_data);

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
