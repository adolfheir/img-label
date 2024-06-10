// import { IS_TOUCH_DEVICE, HAS_POINTER_EVENT } from '../utils';

const IS_TOUCH_DEVICE = false;
const HAS_POINTER_EVENT = false;

export const NAMESPACE = 'pixijs-copper';

// Actions
export const ACTION_MOVE = 'move';
export const ACTION_CROP = 'crop';
export const ACTION_EAST = 'e';
export const ACTION_WEST = 'w';
export const ACTION_SOUTH = 's';
export const ACTION_NORTH = 'n';
export const ACTION_NORTH_EAST = 'ne';
export const ACTION_NORTH_WEST = 'nw';
export const ACTION_SOUTH_EAST = 'se';
export const ACTION_SOUTH_WEST = 'sw';

// Classes
export const CLASS_HIDDEN = `${NAMESPACE}-hidden`;
export const CLASS_MASK = `${NAMESPACE}-mask`;

// Data keys
export const DATA_ACTION = `${NAMESPACE}-action`;

// Events
export const EVENT_TOUCH_START = IS_TOUCH_DEVICE ? 'touchstart' : 'mousedown';
export const EVENT_TOUCH_MOVE = IS_TOUCH_DEVICE ? 'touchmove' : 'mousemove';
export const EVENT_TOUCH_END = IS_TOUCH_DEVICE ? 'touchend touchcancel' : 'mouseup';
export const EVENT_POINTER_DOWN = HAS_POINTER_EVENT ? 'pointerdown' : EVENT_TOUCH_START;
export const EVENT_POINTER_MOVE = HAS_POINTER_EVENT ? 'pointermove' : EVENT_TOUCH_MOVE;
export const EVENT_POINTER_UP = HAS_POINTER_EVENT ? 'pointerup pointercancel' : EVENT_TOUCH_END;
export const EVENT_WHEEL = 'wheel';

// RegExps
export const REGEXP_SPACES = /\s\s*/;
export const REGEXP_ACTIONS = /^e|w|s|n|se|sw|ne|nw|all|crop|move|zoom$/;

/* 默认值 */
export const INIT_CROP_BOX_DATA = {
  width: 0,
  height: 0,
  left: 0,
  top: 0,
  minWidth: 0,
  minHeight: 0,
  maxWidth: 0,
  maxHeight: 0,
  minLeft: 0,
  maxLeft: 0,
  minTop: 0,
  maxTop: 0,
  oldLeft: 0,
  oldTop: 0,
};
