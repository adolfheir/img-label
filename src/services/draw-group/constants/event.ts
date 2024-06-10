/**
 * Drawer事件枚举
 * 对外api
 */

export enum DrawEvent {
  Init = 'init',
  Destroy = 'destroy',
  Enable = 'enable',
  Disable = 'disable',
  Add = 'add',
  Edit = 'edit',
  Remove = 'remove',
  Clear = 'clear',
  Change = 'change',
  DragStart = 'dragStart',
  Dragging = 'dragging',
  DragEnd = 'dragEnd',
  Select = 'select',
  AddNode = 'addNode',
  RemoveNode = 'removeNode',
}

/**
 * Source事件枚举 单纯数据变了为了切换select
 */
export enum SourceEvent {
  Change = 'change',
  Update = 'update',
}

/**
 * Render事件枚举 给draw 使用
 */
export enum RenderEvent {
  Click = 'click',
  UnClick = 'unclick',
  Dragstart = 'dragstart',
  Mousemove = 'pointermove',
  Mouseout = 'pointerout',
  Dragging = 'dragging',
  Dragend = 'dragend',
  DblClick = 'dblClick',
  Contextmenu = 'rightclick',
}

/**
 * L7 Layer 事件名枚举  给render用  layer 和render 拆开（目的未知）
 */
export enum ContainerEvent {
  Click = 'click',
  UnClick = 'unclick',
  Dblclick = 'dblclick',
  Mousedown = 'pointerdown',
  Mousemove = 'pointermove',
  Mouseover = 'pointerover',
  Mouseenter = 'pointerenter',
  Mouseleave = 'pointerleave',
  Mouseout = 'pointerout',
  Contextmenu = 'rightclick',
}

/**
 * L7 Scene 事件名枚举 全局事件
 */
export enum StageEvent {
  // MapMove = 'mapmove',
  // MoveStart = 'movestart',
  MoveEnd = 'moveend',
  ZoomChange = 'zoomchange',
  ZoomStart = 'zoomstart',
  ZoomEnd = 'zoomend',
  Click = 'click',
  Dblclick = 'dblclick',
  Mousemove = 'pointermove',
  Mousewheel = 'wheel',
  Mouseover = 'pointerover',
  Mouseout = 'pointerout',
  Mouseup = 'pointerup',
  Mousedown = 'pointerdown',
  Contextmenu = 'rightclick',
  Dragstart = 'dragstart',
  Dragging = 'dragging',
  Dragend = 'dragend',
}

export enum DocumentEvent {
  Mousemove = 'mousemove',
  Mouseup = 'mouseup',
}

//对外api
export enum ControlEvent {
  DrawChange = 'drawchange',
  DataChange = 'datachange',
}
