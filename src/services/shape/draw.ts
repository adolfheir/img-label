import { SmoothGraphics as Graphics, DashLineShader } from '@pixi/graphics-smooth';
import { Matrix, Texture, WRAP_MODES, SCALE_MODES } from 'pixi.js';
import { DrawFn, Shape } from './interface';
import { getTexture } from './utils';

const dashShader = new DashLineShader({ dash: 5, gap: 5 });

const color = 'rgba(11, 57, 184, 1)';
const selectColor = 'rgb(255, 58, 69)';

export const drawFn: DrawFn<Shape> = (props) => {
  const { item, hoverShapId, selectShapId, lastSelectTime, scale } = props;
  const { x, y, w, h, id } = item;
  const isHover = hoverShapId === id;
  const isSelect = selectShapId === id;
  let isNormal = !isHover && !isSelect;

  let graphicsList: Graphics[] = [];

  if (isNormal) {
    let graphics = new Graphics();
    graphicsList.push(graphics);
    graphics.lineStyle({
      width: 2 / scale,
      color: color,
    });
    graphics.drawRect(x, y, w, h);
  }

  if (isHover && !isSelect) {
    let graphics = new Graphics();
    graphicsList.push(graphics);
    graphics.lineStyle({
      width: 2 / scale,
      color: color,
      shader: dashShader,
    });
    graphics.beginFill(color, 0.1);
    graphics.drawRect(x, y, w, h);
    graphics.endFill();
  }

  if (isSelect) {
    let graphics = new Graphics();
    graphicsList.push(graphics);

    let textureH = 50;
    textureH = Math.max(textureH / scale, textureH);
    const texture = getTexture({
      w: 1,
      h: textureH,
      from: 'rgba(255, 58, 69, 0)',
      to: 'rgba(255, 58, 69, 0.4)',
    });

    /* 扫描 */
    const speed = 500 / 1000; //1000ms 走500px
    const duration = 800; //最小时间 800ms
    let isEnd = false;
    let animateH = 0;
    if (h / speed > duration) {
      //超过时间 按速度算位置
      animateH = ((performance.now() - lastSelectTime!) * speed) % h;
      isEnd = (performance.now() - lastSelectTime!) * speed > h;
    } else {
      //低于时间  按时间百分比 算位置
      animateH = (((performance.now() - lastSelectTime!) % duration) / duration) * h;
      isEnd = performance.now() - lastSelectTime! > duration;
    }
    // animateH = textureH;

    if (!isEnd) {
      //动画mask 位置
      const textureY = y + animateH - textureH;
      const _x = x;
      const _w = w;
      const _y = textureY > y ? textureY : y;
      const _h = textureY > y ? Math.min(textureH, animateH) : animateH;
      graphics.beginTextureFill({ texture: texture, matrix: new Matrix().translate(_x, textureY - 1) }); //-2是因为边框顶部有一根红线锯齿 不清楚为啥
      graphics.drawRect(_x, _y, _w, _h);
      graphics.endFill();
    } else {
      graphics.lineStyle({
        width: 2 / scale,
        color: selectColor,
      });
      graphics.drawRect(x, y, w, h);
    }
  }

  return graphicsList;
};

export default drawFn;
