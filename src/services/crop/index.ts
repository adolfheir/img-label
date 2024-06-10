import { isNumber, get } from 'lodash';
import EventEmitter from 'eventemitter3';
import { injectable, inject } from 'inversify';
import { addEventListener } from '../../helpers/addEventListener';
import { TYPES } from '../../types';
import type { ICoreService } from '../core/interface';
import {
  NAMESPACE, //class
  CLASS_MASK,
  CLASS_HIDDEN,
  /* action */
  DATA_ACTION,
  ACTION_CROP,
  ACTION_MOVE,
  ACTION_EAST,
  ACTION_NORTH,
  ACTION_NORTH_EAST,
  ACTION_NORTH_WEST,
  ACTION_SOUTH,
  ACTION_SOUTH_EAST,
  ACTION_SOUTH_WEST,
  ACTION_WEST, // event
  EVENT_POINTER_DOWN,
  EVENT_POINTER_MOVE,
  EVENT_POINTER_UP, // 正则
  REGEXP_ACTIONS,
  REGEXP_SPACES,
  /* 数据 */
  INIT_CROP_BOX_DATA,
} from './constants';
import { addClass, removeClass, set, getOuterWidth, getOuterHeight } from './dom';
import './index.css';
import { CropServiceEvent, ICropService, CropBoxData, InitialCropBoxData, Option, InitOption } from './interface';
import TEMPLATE from './template';
import { getData, getPointer, getOffset, getTransforms } from './utils';

@injectable()
export class CropService extends EventEmitter<`${CropServiceEvent}`> implements ICropService {
  @inject(TYPES.ICore) private readonly CoreService!: ICoreService;

  /* 缓存所有清理函数 */
  private destoryfnList: Function[] = [];

  /* 方便访问dom元素 */
  private container?: Element;
  private dragBox?: Element;
  private cropBox?: Element;
  private viewBox?: Element;
  private element?: Element;

  /* 属性 */
  public disabled: boolean = false;
  public showMask: boolean = true;
  public minCropBoxWidth?: number | string = 0;
  public minCropBoxHeight?: number | string = 0;
  public cropBoxLimited?: {
    width: number;
    height: number;
    left: number;
    top: number;
  };

  constructor() {
    super();
  }

  //设置属性
  setOptions(props: {
    disabled?: boolean;
    showMask?: boolean;
    minCropBoxWidth?: number | string;
    minCropBoxHeight?: number | string;
    cropBoxLimited?: {
      width: number;
      height: number;
      left: number;
      top: number;
    };
  }) {
    Object.assign(this, props);
  }

  init(props?: InitOption) {
    this.destroy();

    /* ============================== split =============================== */

    const element = this.CoreService.dom;

    if (!element) {
      throw new Error('you should init CoreService beofore do this');
    }

    //建立dom
    const template = document.createElement('div');
    template.innerHTML = TEMPLATE;
    const container = template.querySelector(`.${NAMESPACE}-container`)!;
    const dragBox = container.querySelector(`.${NAMESPACE}-drag-box`)!;
    const cropBox = container.querySelector(`.${NAMESPACE}-crop-box`)!;
    const viewBox = container.querySelector(`.${NAMESPACE}-view-box`)!;

    set(element, {
      position: 'relative',
    });

    element.appendChild(container);

    this.container = container;
    this.dragBox = dragBox;
    this.cropBox = cropBox;
    this.viewBox = viewBox;
    this.element = element;

    addClass(cropBox, CLASS_HIDDEN); //先隐藏crop

    //事件监听
    const handleCropStart = addEventListener(container, EVENT_POINTER_DOWN, this.onCropStart.bind(this));
    const handleCropMove = addEventListener(element.ownerDocument, EVENT_POINTER_MOVE, this.onCropMove.bind(this));
    let fnList = EVENT_POINTER_UP.trim()
      .split(REGEXP_SPACES)
      .map((eventName) => {
        const handleCropEnd = addEventListener(element.ownerDocument, eventName, this.onCropEnd.bind(this));
        return handleCropEnd;
      });
    this.destoryfnList.push(handleCropStart, handleCropMove, ...fnList);

    /* ============================== split =============================== */
    const { initialCropBoxData, previewDom, ...option } = props ?? {};
    this.setOptions(option);
    //初始化渲染
    this.initContainer();
    this.initCropBox();
    this.limitCropBox(true, true);

    if (!!previewDom) {
      this.setPreview(previewDom);
    }

    //默认值
    if (!!initialCropBoxData) {
      this.setDefaultCropBox(initialCropBoxData);
    }
  }

  async destroy() {
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
    //清理事件监听
    this.removeAllListeners();
    //清理dom
    if (this.container) {
      this.element?.removeChild?.(this.container);
    }
    this.container = undefined;
    this.dragBox = undefined;
    this.cropBox = undefined;
    this.viewBox = undefined;
    this.element = undefined;
    this.previewBox = undefined;

    //清理临时时变量
    this.pointer = undefined;
    this.action = undefined;
    this.cropping = false;
    this.cropped = false;
    this.containerData = {
      width: 0,
      height: 0,
    };

    this.cropBoxData = INIT_CROP_BOX_DATA;
  }

  /* ============================== event =============================== */
  pointer?: { startX?: number; startY?: number; endX?: number; endY?: number };
  action?: string;
  cropping?: boolean = false;
  cropped?: boolean = false;
  containerData: {
    width: number;
    height: number;
  } = {
    width: 0,
    height: 0,
  };
  onCropStart(event: Event) {
    const { buttons, button } = event as PointerEvent;
    if (
      this.disabled ||
      // Handle mouse event and pointer event and ignore touch event
      ((event.type === 'mousedown' ||
        (event.type === 'pointerdown' && (event as PointerEvent).pointerType === 'mouse')) &&
        // No primary button (Usually the left button)
        ((isNumber(buttons) && buttons !== 1) ||
          (isNumber(button) && button !== 0) ||
          // Open context menu
          (event as PointerEvent).ctrlKey))
    ) {
      return;
    }
    let action = getData(event.target as Element, DATA_ACTION);
    this.pointer = getPointer(event as PointerEvent);
    if (!REGEXP_ACTIONS.test(action)) {
      return;
    }
    // This line is required for preventing page zooming in iOS browsers
    event.preventDefault();
    this.action = action;
    this.cropping = false;

    if (action === ACTION_CROP) {
      this.cropping = true;
      if (this.showMask) {
        addClass(this.dragBox!, CLASS_MASK);
      }
    }

    let hasCrop = this.cropBoxData!.width !== 0 && this.cropBoxData!.height !== 0;
    this.emit(CropServiceEvent['onCropStart'], hasCrop ? this.cropBoxData : null);
    this.emit(CropServiceEvent['onCropChange'], hasCrop ? this.cropBoxData : null);
  }

  onCropMove(event: MouseEvent | PointerEvent | TouchEvent): void {
    const { action } = this;
    if (!action) {
      return;
    }
    this.pointer = { ...this.pointer, ...getPointer(event as MouseEvent, true) };
    event.preventDefault();
    // 添加事件
    this.change(event);
  }

  onCropEnd(event: Event): void {
    const { action } = this;
    if (!action) {
      return;
    }
    event.preventDefault();

    this.action = undefined;
    this.pointer = undefined;
    if (this.cropping) {
      this.cropping = false;
      // removeClass(this.dragBox, CLASS_MASK);
    }
    let hasCrop = get(this, 'cropBoxData.width', 0) !== 0 && get(this, 'cropBoxData.height', 0) !== 0;
    this.emit(CropServiceEvent['onCropChange'], hasCrop ? this.cropBoxData : null);
    hasCrop && this.emit(CropServiceEvent['onCropEnd'], hasCrop ? this.cropBoxData : null);
  }

  change(event: MouseEvent | PointerEvent | TouchEvent): void {
    const { containerData, cropBoxData, pointer } = this;
    let { action } = this;

    let { left, top, width, height } = cropBoxData ?? {};
    const right = left + width;
    const bottom = top + height;

    let minLeft = 0;
    let minTop = 0;
    let maxWidth = containerData.width;
    let maxHeight = containerData.height;

    let renderable = true;
    let offset;

    const range = {
      x: pointer?.endX! - pointer?.startX!,
      y: pointer?.endY! - pointer?.startY!,
    };

    const check = (side: string) => {
      switch (side) {
        case ACTION_EAST:
          if (right + range.x > maxWidth) {
            range.x = maxWidth - right;
          }
          break;

        case ACTION_WEST:
          if (left + range.x < minLeft) {
            range.x = minLeft - left;
          }
          break;

        case ACTION_NORTH:
          if (top + range.y < minTop) {
            range.y = minTop - top;
          }
          break;

        case ACTION_SOUTH:
          if (bottom + range.y > maxHeight) {
            range.y = maxHeight - bottom;
          }
          break;

        default:
      }
    };

    switch (action) {
      case ACTION_CROP:
        if (!range.x || !range.y) {
          renderable = false;
          break;
        }

        offset = getOffset(this.container!);

        left = pointer?.startX! - offset.left;
        top = pointer?.startY! - offset.top;
        width = cropBoxData.minWidth;
        height = cropBoxData.minHeight;

        if (!left) {
          debugger;
        }

        if (range.x > 0) {
          action = range.y > 0 ? ACTION_SOUTH_EAST : ACTION_NORTH_EAST;
        } else if (range.x < 0) {
          left -= width;
          action = range.y > 0 ? ACTION_SOUTH_WEST : ACTION_NORTH_WEST;
        }

        if (range.y < 0) {
          top -= height;
        }

        if (!this.cropped) {
          removeClass(this.cropBox!, CLASS_HIDDEN);
          this.cropped = true;

          //TODO
          if (!!this.cropBoxLimited) {
            this.limitCropBox(true, true);
          }
        }

        break;

      case ACTION_MOVE:
        left += range.x;
        top += range.y;
        break;

      case ACTION_EAST:
        if (range.x >= 0 && right >= maxWidth) {
          renderable = false;
          break;
        }
        check(ACTION_EAST);
        width += range.x;

        if (width < 0) {
          action = ACTION_WEST;
          width = -width;
          left -= width;
        }
        break;

      case ACTION_NORTH:
        if (range.y <= 0 && top <= minTop) {
          renderable = false;
          break;
        }
        check(ACTION_NORTH);
        height -= range.y;
        top += range.y;

        if (height < 0) {
          action = ACTION_SOUTH;
          height = -height;
          top -= height;
        }
        break;

      case ACTION_WEST:
        if (range.x <= 0 && left <= minLeft) {
          renderable = false;
          break;
        }
        check(ACTION_WEST);
        width -= range.x;
        left += range.x;
        if (width < 0) {
          action = ACTION_EAST;
          width = -width;
          left -= width;
        }
        break;

      case ACTION_SOUTH:
        if (range.y >= 0 && bottom >= maxHeight) {
          renderable = false;
          break;
        }
        check(ACTION_SOUTH);
        height += range.y;

        if (height < 0) {
          action = ACTION_NORTH;
          height = -height;
          top -= height;
        }
        break;

      case ACTION_NORTH_EAST:
        check(ACTION_NORTH);
        check(ACTION_EAST);

        if (range.x >= 0) {
          if (right < maxWidth) {
            width += range.x;
          } else if (range.y <= 0 && top <= minTop) {
            renderable = false;
          }
        } else {
          width += range.x;
        }

        if (range.y <= 0) {
          if (top > minTop) {
            height -= range.y;
            top += range.y;
          }
        } else {
          height -= range.y;
          top += range.y;
        }

        if (width < 0 && height < 0) {
          action = ACTION_SOUTH_WEST;
          height = -height;
          width = -width;
          top -= height;
          left -= width;
        } else if (width < 0) {
          action = ACTION_NORTH_WEST;
          width = -width;
          left -= width;
        } else if (height < 0) {
          action = ACTION_SOUTH_EAST;
          height = -height;
          top -= height;
        }
        break;

      case ACTION_NORTH_WEST:
        check(ACTION_NORTH);
        check(ACTION_WEST);

        if (range.x <= 0) {
          if (left > minLeft) {
            width -= range.x;
            left += range.x;
          } else if (range.y <= 0 && top <= minTop) {
            renderable = false;
          }
        } else {
          width -= range.x;
          left += range.x;
        }

        if (range.y <= 0) {
          if (top > minTop) {
            height -= range.y;
            top += range.y;
          }
        } else {
          height -= range.y;
          top += range.y;
        }

        if (width < 0 && height < 0) {
          action = ACTION_SOUTH_EAST;
          height = -height;
          width = -width;
          top -= height;
          left -= width;
        } else if (width < 0) {
          action = ACTION_NORTH_EAST;
          width = -width;
          left -= width;
        } else if (height < 0) {
          action = ACTION_SOUTH_WEST;
          height = -height;
          top -= height;
        }
        break;

      case ACTION_SOUTH_WEST:
        check(ACTION_SOUTH);
        check(ACTION_WEST);

        if (range.x <= 0) {
          if (left > minLeft) {
            width -= range.x;
            left += range.x;
          } else if (range.y >= 0 && bottom >= maxHeight) {
            renderable = false;
          }
        } else {
          width -= range.x;
          left += range.x;
        }

        if (range.y >= 0) {
          if (bottom < maxHeight) {
            height += range.y;
          }
        } else {
          height += range.y;
        }

        if (width < 0 && height < 0) {
          action = ACTION_NORTH_EAST;
          height = -height;
          width = -width;
          top -= height;
          left -= width;
        } else if (width < 0) {
          action = ACTION_SOUTH_EAST;
          width = -width;
          left -= width;
        } else if (height < 0) {
          action = ACTION_NORTH_WEST;
          height = -height;
          top -= height;
        }
        break;

      case ACTION_SOUTH_EAST:
        check(ACTION_SOUTH);
        check(ACTION_EAST);

        if (range.x >= 0) {
          if (right < maxWidth) {
            width += range.x;
          } else if (range.y >= 0 && bottom >= maxHeight) {
            renderable = false;
          }
        } else {
          width += range.x;
        }

        if (range.y >= 0) {
          if (bottom < maxHeight) {
            height += range.y;
          }
        } else {
          height += range.y;
        }

        if (width < 0 && height < 0) {
          action = ACTION_NORTH_WEST;
          height = -height;
          width = -width;
          top -= height;
          left -= width;
        } else if (width < 0) {
          action = ACTION_SOUTH_WEST;
          width = -width;
          left -= width;
        } else if (height < 0) {
          action = ACTION_NORTH_EAST;
          height = -height;
          top -= height;
        }
        break;

      default:
        renderable = false;
    }

    if (renderable) {
      cropBoxData.width = width;
      cropBoxData.height = height;
      cropBoxData.left = left;
      cropBoxData.top = top;
      this.action = action;
      this.cropBoxData = cropBoxData;
      //TODO
      this.renderCropBox();
    }
    // Override
    this.pointer!.startX = this.pointer!.endX;
    this.pointer!.startY = this.pointer!.endY;
  }

  /* ============================== cropbox 逻辑 =============================== */
  private cropBoxData: CropBoxData = INIT_CROP_BOX_DATA;

  initContainer() {
    //通过样式设置
    const { element, container } = this;
    const containerData = {
      width: getOuterWidth(element as HTMLElement),
      height: getOuterHeight(element as HTMLElement),
    };
    this.containerData = containerData;
    set(container as HTMLElement, containerData);
  }
  initCropBox() {
    const { containerData } = this;

    const cropBoxData = {
      // width: containerData.width,
      // height: containerData.height,
      width: 0,
      height: 0,
      left: 0,
      top: 0,
      minWidth: 0,
      minHeight: 0,
      maxWidth: containerData.width,
      maxHeight: containerData.height,
      minLeft: 0,
      maxLeft: containerData.width,
      minTop: 0,
      maxTop: containerData.height,
      oldLeft: 0,
      oldTop: 0,
    };

    this.cropBoxData = cropBoxData;
    this.limitCropBox(true, true);
  }

  renderCropBox() {
    const { cropBoxData } = this;

    if (cropBoxData.width > cropBoxData.maxWidth || cropBoxData.width < cropBoxData.minWidth) {
      cropBoxData.left = cropBoxData.oldLeft;
    }

    if (cropBoxData.height > cropBoxData.maxHeight || cropBoxData.height < cropBoxData.minHeight) {
      cropBoxData.top = cropBoxData.oldTop;
    }

    cropBoxData.width = Math.min(Math.max(cropBoxData.width, cropBoxData.minWidth), cropBoxData.maxWidth);
    cropBoxData.height = Math.min(Math.max(cropBoxData.height, cropBoxData.minHeight), cropBoxData.maxHeight);
    this.limitCropBox(false, true);

    cropBoxData.left = Math.min(Math.max(cropBoxData.left, cropBoxData.minLeft), cropBoxData.maxLeft);
    cropBoxData.top = Math.min(Math.max(cropBoxData.top, cropBoxData.minTop), cropBoxData.maxTop);
    cropBoxData.oldLeft = cropBoxData.left;
    cropBoxData.oldTop = cropBoxData.top;

    set(
      this.cropBox as HTMLElement,
      Object.assign(
        {
          width: cropBoxData.width,
          height: cropBoxData.height,
        },
        getTransforms({
          translateX: cropBoxData.left,
          translateY: cropBoxData.top,
        }),
      ),
    );

    if (this.showMask) {
      this.renderPreview();
    }
  }

  clearCropBox() {
    // Clear the crop box
    if (this.cropped && !this.disabled) {
      Object.assign(this.cropBoxData, {
        left: 0,
        top: 0,
        width: 0,
        height: 0,
      });

      this.cropped = false;
      this.renderCropBox();

      // Render canvas after crop box rendered
      // this.renderCanvas();
      removeClass(this.dragBox as HTMLElement, CLASS_MASK);
      addClass(this.cropBox as HTMLElement, CLASS_HIDDEN);
    }

    return this;
  }

  limitCropBox(sizeLimited: boolean, positionLimited: boolean) {
    // return
    const { containerData, cropBoxData, cropBoxLimited } = this;

    const limited = !!cropBoxLimited;

    if (sizeLimited) {
      let minCropBoxWidth = Number(this.minCropBoxWidth) || 0;
      let minCropBoxHeight = Number(this.minCropBoxHeight) || 0;
      let maxCropBoxWidth = limited
        ? Math.min(
            containerData.width,
            cropBoxLimited!.width!,
            cropBoxLimited.width! + cropBoxLimited.left!,
            containerData.width - cropBoxLimited.left!,
          )
        : containerData.width;
      let maxCropBoxHeight = limited
        ? Math.min(
            containerData.height,
            cropBoxLimited.height!,
            cropBoxLimited.height! + cropBoxLimited.top!,
            containerData.height - cropBoxLimited.top!,
          )
        : containerData.height;
      // The min/maxCropBoxWidth/Height must be less than container's width/height
      minCropBoxWidth = Math.min(minCropBoxWidth, containerData.width);
      minCropBoxHeight = Math.min(minCropBoxHeight, containerData.height);

      // The minWidth/Height must be less than maxWidth/Height
      cropBoxData.minWidth = Math.min(minCropBoxWidth, maxCropBoxWidth);
      cropBoxData.minHeight = Math.min(minCropBoxHeight, maxCropBoxHeight);
      cropBoxData.maxWidth = maxCropBoxWidth;
      cropBoxData.maxHeight = maxCropBoxHeight;
    }

    if (positionLimited) {
      if (limited) {
        cropBoxData.minLeft = Math.max(0, cropBoxLimited.left!);
        cropBoxData.minTop = Math.max(0, cropBoxLimited.top!);
        cropBoxData.maxLeft =
          Math.min(containerData.width, cropBoxLimited.left! + cropBoxLimited.width!) - cropBoxData.width;
        cropBoxData.maxTop =
          Math.min(containerData.height, cropBoxLimited.top! + cropBoxLimited.height!) - cropBoxData.height;
      } else {
        cropBoxData.minLeft = 0;
        cropBoxData.minTop = 0;
        cropBoxData.maxLeft = containerData.width - cropBoxData.width;
        cropBoxData.maxTop = containerData.height - cropBoxData.height;
      }
    }
  }

  getCropData() {
    return this.cropBoxData;
  }
  setDefaultCropBox(initialCropBoxData: InitialCropBoxData) {
    if (!this.container) {
      console.error('请先初始化容器');
      return;
    }

    //设置截图数据
    if (!!initialCropBoxData) {
      this.cropped = true;

      if (this.showMask) {
        addClass(this.dragBox!, CLASS_MASK);
      }

      removeClass(this.cropBox!, CLASS_HIDDEN);
      //@ts-ignore
      this.cropBoxData = { ...this.cropBoxData, ...initialCropBoxData };
      //@ts-ignore
      this.renderCropBox();
      let hasCrop = get(this, 'cropBoxData.width', 0) !== 0 && get(this, 'cropBoxData.height', 0) !== 0;
      this.emit(CropServiceEvent['onCropChange'], hasCrop ? this.cropBoxData : null);
      //@ts-ignore
      hasCrop && this.emit(CropServiceEvent['onCropEnd'], hasCrop ? this.cropBoxData : null);
    }
  }

  /* ==============================  预览图 =============================== */
  private previewBox?: HTMLCanvasElement;
  setPreview(dom: HTMLCanvasElement) {
    this.previewBox = dom;
    this.viewBox?.append(dom);
    this.renderPreview();
  }
  renderPreview() {
    if (!this.showMask || !this.previewBox) return;

    const { containerData, cropBoxData } = this;
    const { width, height } = containerData;
    const left = cropBoxData.left;
    const top = cropBoxData.top;

    if (!this.cropped || this.disabled) {
      return;
    }

    set(
      this.previewBox!,
      Object.assign(
        {
          width,
          height,
        },
        getTransforms(
          Object.assign({
            translateX: -left,
            translateY: -top,
          }),
        ),
      ),
    );
  }

  /* ============================== misc =============================== */
}
