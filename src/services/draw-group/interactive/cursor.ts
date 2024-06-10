import { cloneDeep } from 'lodash';
import type { ICoreService } from '../../core/interface';

/**
 * 鼠标指针类型
 */
export type ICursorType =
  | 'draw'
  | 'pointHover'
  | 'pointDrag'
  | 'lineHover'
  | 'lineDrag'
  | 'polygonHover'
  | 'polygonDrag';

/**
 * 鼠标指针类型键值对
 */
export type ICursor = Record<ICursorType, string>;

export type KeyBoardConfig = Partial<{
  remove: string[] | false;
  revert: string[] | false;
  redo: string[] | false;
}>;

/**
 * 鼠标指针默认值
 */
export const DEFAULT_CURSOR_MAP: ICursor = {
  draw: 'crosshair',
  pointHover: 'pointer',
  pointDrag: 'move',
  lineHover: 'pointer',
  lineDrag: 'move',
  polygonHover: 'pointer',
  polygonDrag: 'move',
};

export class Cursor {
  container: HTMLDivElement | null;
  cursor: ICursorType | null = null;
  options: ICursor;

  constructor(CoreService: ICoreService, options?: ICursor) {
    this.container = CoreService.dom! as HTMLDivElement;
    this.options = options ? options : cloneDeep(DEFAULT_CURSOR_MAP);
  }

  setCursor(cursor: ICursorType | null) {
    if (cursor !== this.cursor && this.container) {
      this.container.style.cursor = cursor ? this.options[cursor] : '';
      this.cursor = cursor;
    }
  }

  destroy() {
    this.setCursor(null);
  }
}
