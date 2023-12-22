/* ============================== class 操作 =============================== */
// fork from https://github.com/react-component/util/blob/master/src/Dom/class.js
// and format ts by gpt
export function hasClass(node: Element, className: string): boolean {
  if (node.classList) {
    return node.classList.contains(className);
  }
  const originClass = node.className;
  return ` ${originClass} `.indexOf(` ${className} `) > -1;
}

export function addClass(node: Element, className: string): void {
  if (node.classList) {
    node.classList.add(className);
  } else {
    if (!hasClass(node, className)) {
      node.className = `${node.className} ${className}`;
    }
  }
}

export function removeClass(node: Element, className: string): void {
  if (node.classList) {
    node.classList.remove(className);
  } else {
    if (hasClass(node, className)) {
      const originClass = node.className;
      node.className = ` ${originClass} `.replace(` ${className} `, ' ');
    }
  }
}

/* ============================== css操作 =============================== */
// fork from https://github.com/react-component/util/blob/master/src/Dom/css.js
// and format ts by gpt
const PIXEL_PATTERN = /margin|padding|width|height|max|min|offset/;

const removePixel: { [key: string]: boolean } = {
  left: true,
  top: true,
};
const floatMap: { [key: string]: number } = {
  cssFloat: 1,
  styleFloat: 1,
  float: 1,
};

function getComputedStyle(node: HTMLElement): CSSStyleDeclaration {
  return node.nodeType === 1
    ? node.ownerDocument!.defaultView!.getComputedStyle(node, null)
    : ({} as CSSStyleDeclaration);
}

function getStyleValue(node: HTMLElement, type: string, value: string): number | string {
  type = type.toLowerCase();
  if (value === 'auto') {
    if (type === 'height') {
      return node.offsetHeight;
    }
    if (type === 'width') {
      return node.offsetWidth;
    }
  }
  if (!(type in removePixel)) {
    removePixel[type] = PIXEL_PATTERN.test(type);
  }
  return removePixel[type] ? parseFloat(value) || 0 : value;
}

export function get(node: HTMLElement, name: string): CSSStyleDeclaration | number | string {
  const length = arguments.length;
  const style = getComputedStyle(node);

  name = floatMap[name] ? ('cssFloat' in node.style ? 'cssFloat' : 'styleFloat') : name;

  return length === 1 ? style : getStyleValue(node, name, style[name as any] || node.style[name as any]);
}

//@ts-ignore
export function set(node: HTMLElement, name: Record<string, string | number>): CSSStyleDeclaration;
export function set(node: HTMLElement, name: string, value: string | number): CSSStyleDeclaration;
export function set(node: HTMLElement, name: string, value: string | number): CSSStyleDeclaration | string {
  const length = arguments.length;
  name = floatMap[name] ? ('cssFloat' in node.style ? 'cssFloat' : 'styleFloat') : name;
  if (length === 3) {
    if (typeof value === 'number' && PIXEL_PATTERN.test(name)) {
      value = `${value}px`;
    }
    //@ts-ignore
    node.style[name] = value; // Number
    //@ts-ignore
    return value;
  }
  //@ts-ignore
  for (const x in name) {
    if (name.hasOwnProperty(x)) {
      set(node, x, name[x]);
    }
  }
  return getComputedStyle(node);
}

export function getOuterWidth(el: HTMLElement): number {
  if (el === document.body) {
    return document.documentElement.clientWidth;
  }
  return el.offsetWidth;
}

export function getOuterHeight(el: HTMLElement): number {
  if (el === document.body) {
    return window.innerHeight || document.documentElement.clientHeight;
  }
  return el.offsetHeight;
}

export function getDocSize(): { width: number; height: number } {
  const width = Math.max(document.documentElement.scrollWidth, document.body.scrollWidth);
  const height = Math.max(document.documentElement.scrollHeight, document.body.scrollHeight);

  return {
    width,
    height,
  };
}

export function getClientSize(): { width: number; height: number } {
  const width = document.documentElement.clientWidth;
  const height = window.innerHeight || document.documentElement.clientHeight;
  return {
    width,
    height,
  };
}

export function getScroll(): { scrollLeft: number; scrollTop: number } {
  return {
    scrollLeft: Math.max(document.documentElement.scrollLeft, document.body.scrollLeft),
    scrollTop: Math.max(document.documentElement.scrollTop, document.body.scrollTop),
  };
}

export function getOffset(node: HTMLElement): { left: number; top: number } {
  const box = node.getBoundingClientRect();
  const docElem = document.documentElement;

  // < ie8 does not support win.pageXOffset, so use docElem.scrollLeft
  return {
    left: box.left + (window.pageXOffset || docElem.scrollLeft) - (docElem.clientLeft || document.body.clientLeft || 0),
    top: box.top + (window.pageYOffset || docElem.scrollTop) - (docElem.clientTop || document.body.clientTop || 0),
  };
}
