import { isObject, isNumber, assign, isFunction } from 'lodash';
import { hasClass, addClass, removeClass } from './dom';

export const IS_BROWSER: boolean = typeof window !== 'undefined' && typeof window.document !== 'undefined';
export const WINDOW: Window | {} = IS_BROWSER ? window : {};
export const IS_TOUCH_DEVICE: boolean =
  //@ts-ignore
  IS_BROWSER && WINDOW.document.documentElement ? 'ontouchstart' in WINDOW.document.documentElement : false;
export const HAS_POINTER_EVENT: boolean = IS_BROWSER ? 'PointerEvent' in WINDOW : false;

// 横杠转换驼峰
function toHump(name: string): string {
  return name.replace(/\-(\w)/g, function (all, letter) {
    return letter.toUpperCase();
  });
}

const REGEXP_CAMEL_CASE = /([a-z\d])([A-Z])/g;
/**
 * Transform the given string from camelCase to kebab-case
 * @param {string} value - The value to transform.
 * @returns {string} The transformed value.
 */
export function toParamCase(value: string): string {
  return value.replace(REGEXP_CAMEL_CASE, '$1-$2').toLowerCase();
}

/**
 * Get data from the given element.
 * @param {Element} element - The target element.
 * @param {string} name - The data key to get.
 * @returns {string} The data value.
 */
export function getData(element: Element, name: string) {
  //@ts-ignore
  if (isObject(element[name])) {
    //@ts-ignore
    return element[name];
  }

  //@ts-ignore
  if (element.dataset) {
    //@ts-ignore
    return element.dataset[toHump(name)];
  }

  return element.getAttribute(`data-${toParamCase(name)}`);
}

export function toggleClass(node: HTMLElement, className: string): void {
  if (hasClass(node, className)) {
    addClass(node, className);
  } else {
    removeClass(node, className);
  }
}

/**
 * Get a pointer from an event object.
 * @param {Object} event - The target event object.
 * @param {boolean} endOnly - Indicates if only returns the end point coordinate or not.
 * @returns {Object} The result pointer contains start and/or end point coordinates.
 */
export function getPointer(
  { pageX, pageY }: { pageX: number; pageY: number },
  endOnly?: boolean,
): { startX?: number; startY?: number; endX: number; endY: number } {
  const end = {
    endX: pageX,
    endY: pageY,
  };

  return endOnly
    ? end
    : {
        startX: pageX,
        startY: pageY,
        ...end,
      };
}

/**
 * Get the offset base on the document.
 * @param {Element} element - The target element.
 * @returns {Object} The offset data.
 */
export function getOffset(element: Element): { left: number; top: number } {
  const box = element.getBoundingClientRect();

  return {
    left: box.left + (window.pageXOffset - document.documentElement.clientLeft),
    top: box.top + (window.pageYOffset - document.documentElement.clientTop),
  };
}

/**
 * Get transforms base on the given object.
 * @param {Object} obj - The target object.
 * @returns {string} A string contains transform values.
 */
export function getTransforms({
  rotate,
  scaleX,
  scaleY,
  translateX,
  translateY,
}: {
  rotate?: number;
  scaleX?: number;
  scaleY?: number;
  translateX?: number;
  translateY?: number;
}): { WebkitTransform: string; msTransform: string; transform: string } {
  const values = [];

  if (isNumber(translateX) && translateX !== 0) {
    values.push(`translateX(${translateX}px)`);
  }

  if (isNumber(translateY) && translateY !== 0) {
    values.push(`translateY(${translateY}px)`);
  }

  // Rotate should come first before scale to match orientation transform
  if (isNumber(rotate) && rotate !== 0) {
    values.push(`rotate(${rotate}deg)`);
  }

  if (isNumber(scaleX) && scaleX !== 1) {
    values.push(`scaleX(${scaleX})`);
  }

  if (isNumber(scaleY) && scaleY !== 1) {
    values.push(`scaleY(${scaleY})`);
  }

  const transform = values.length ? values.join(' ') : 'none';

  return {
    WebkitTransform: transform,
    msTransform: transform,
    transform,
  };
}

/**
 * copy from https://github.com/steelsojka/lodash-decorators/blob/master/src/mixin.ts
 * Mixins an object into the classes prototype.
 * @export
 * @param {...Object[]} srcs
 * @returns {ClassDecorator}
 * @example
 *
 * const myMixin = {
 *   blorg: () => 'blorg!'
 * }
 *
 * @Mixin(myMixin)
 * class MyClass {}
 *
 * const myClass = new MyClass();
 *
 * myClass.blorg(); // => 'blorg!'
 */
export function Mixin(...srcs: Object[]): ClassDecorator {
  return ((target: Function) => {
    assign(target.prototype, ...srcs);

    return target;
  }) as any;
}

/* ================ todo:这个逻辑待确定? ====================== */
//设置数据的精度
//accuracy 表示精度 以原点为中心向左为正，向右为负，
//isCeil 表示是否为向上取整
export const setNumberAccuracy = (originNumber: number, accuracy: number = 0, isCeil: boolean = true): number => {
  if (originNumber === 0) {
    return 0;
  }
  let returnData = 0;

  if (isCeil) {
    returnData = Math.ceil(originNumber / Math.pow(10, accuracy)) * Math.pow(10, accuracy);
  } else {
    returnData = Math.floor(originNumber / Math.pow(10, accuracy)) * Math.pow(10, accuracy);
  }
  //设置精度
  if (accuracy < 0) {
    returnData = Number(returnData.toFixed(-accuracy));
  } else {
    returnData = Number(returnData.toFixed(0));
  }
  return returnData;
};
