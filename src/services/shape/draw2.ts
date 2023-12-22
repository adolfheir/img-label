import {
  Application,
  Sprite,
  Container,
  DisplayObject,
  FederatedPointerEvent,
  Point,
  Matrix,
  Transform,
  Texture,
  ColorSource,
  WRAP_MODES,
} from 'pixi.js';
import { pointInPolygon, pointToSegmentDistance, pointToPolygonDistance, rectListToPolygon } from './utils';
import { SmoothGraphics as Graphics, DashLineShader } from '@pixi/graphics-smooth';
import { DrawFn } from './interface';
import { isNil } from 'lodash';

const dashShader = new DashLineShader({ dash: 5, gap: 5 });

const getTexture = (props: { h: number; from: string; to: string }) => {
  const h = props.h;
  const w = 10;
  const linH = 1;
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const ctx = c.getContext('2d')!;
  /* 画动画 */
  ctx.save();
  var linearGrad = ctx.createLinearGradient(0, 0, 0, h);
  linearGrad.addColorStop(0, props?.from);
  linearGrad.addColorStop(1, props?.to);
  ctx.fillStyle = linearGrad;
  // ctx.fillRect(0, rect.y, 0, rect.y + animateY);
  ctx.fillRect(0, 0, w, h);
  ctx.fill();
  ctx.restore();
  /* 最下面的线 */
  ctx.save();
  ctx.fillStyle = 'rgba(255, 58, 69,1)';
  ctx.fillRect(0, h - linH, w, linH);
  ctx.fill();

  // let url = c.toDataURL("image/png");
  // console.log("url", url)

  let texture = Texture.from(c);
  texture.baseTexture.wrapMode = WRAP_MODES.CLAMP;
  return texture;
};

const texture = getTexture({
  h: 50,
  from: 'rgba(241, 78, 78, 0)',
  to: 'rgba(241, 78, 78, 0.4)',
});
const color = 'rgb(241, 78, 78)';
const selectColor = 'rgb(241, 78, 78)';

let specialShapId = 1;

export const drawFn: DrawFn = (props) => {
  const { item, hoverShapId, delta, selectShapId, firstSelectShapTime, firstHoverShapTime, scale } = props;
  const { x, y, w, h, id } = item;
  const isHover = hoverShapId === id;
  const isSelect = selectShapId === id;
  let isNormal = !isHover && !isSelect;

  const ableShowNormal = !isNil(selectShapId) && id === specialShapId;

  let graphicsList: Graphics[] = [];

  if (isNormal && ableShowNormal) {
    let graphics = new Graphics();
    graphicsList.push(graphics);
    graphics.lineStyle({
      width: 1 / scale,
      color: color,
    });
    graphics.drawRect(x, y, w, h);
  }

  if (isHover) {
    let graphics = new Graphics();
    graphicsList.push(graphics);

    /* 扫描 */
    let maxAnimateH = 50;
    const speed = 500 / 1000; //1000ms 走250px
    const mintime = 800; //最小时间 800ms
    let isEnd = false;
    let animateY = 0;
    if (h / speed > mintime) {
      animateY = ((performance.now() - firstHoverShapTime!) * speed) % h;
      isEnd = (performance.now() - firstHoverShapTime!) * speed > h;
    } else {
      animateY = (((performance.now() - firstHoverShapTime!) % mintime) / mintime) * h;
      isEnd = performance.now() - firstHoverShapTime! > mintime;
    }
    // 算高度和top
    let animalH = animateY;
    let _y = y + animalH;
    let _h = Math.min(maxAnimateH, animateY, h - animateY);
    graphics.beginTextureFill({ texture: texture, matrix: new Matrix().translate(x, _y) });
    graphics.drawRect(x, _y, w, _h);
    graphics.endFill();
  }

  if (isSelect) {
    let graphics = new Graphics();
    graphicsList.push(graphics);
    graphics.lineStyle({
      width: 1 / scale,
      color: selectColor,
      shader: dashShader,
    });
    graphics.beginFill(selectColor, 0.16);
    graphics.drawRect(x, y, w, h);
    graphics.endFill();
  }

  return graphicsList;
};

export default drawFn;
