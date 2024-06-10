import { PopupContent } from '../interactive/popup';

export type IPointHelperOptions = {
  draw: PopupContent;
  pointHover: PopupContent;
  pointDrag: PopupContent;
};

export type ILineHelperOptions = IPointHelperOptions & {
  lineHover: PopupContent;
  lineDrag: PopupContent;
  midPointHover: PopupContent;
  drawFinish: PopupContent;
};

export type IPolygonHelperOptions = ILineHelperOptions & {
  drawContinue: PopupContent;
  polygonHover: PopupContent;
  polygonDrag: PopupContent;
};

export type IDragPolygonHelperOptions = IPolygonHelperOptions;
