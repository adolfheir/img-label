import Tippy, { Instance as TippyInstance } from 'tippy.js';
import type { ICoreService } from '../../core/interface';
import { Content, Props as TippyProps } from 'tippy.js';
import 'tippy.js/dist/tippy.css';
import 'tippy.js/themes/light.css';
import './popup.css';
import { debounce } from 'lodash';
import { followCursor } from 'tippy.js';

export type PopupOptions = Partial<TippyProps>;
export type PopupContent = Content | null | undefined;

export const DEFAULT_POPUP_CONFIG: PopupOptions = {
  allowHTML: true,
  followCursor: true,
  placement: 'bottom-start',
  offset: [-10, 20],
  plugins: [followCursor],
  trigger: 'manual',
  hideOnClick: false,
  theme: 'light',
};

export class Popup {
  protected content: PopupContent = '';

  protected tippy: TippyInstance;

  protected CoreService: ICoreService;

  protected isMouseInner = false;

  constructor(CoreService: ICoreService, tippyProps: PopupOptions) {
    this.tippy = Tippy(CoreService.dom!, {
      ...DEFAULT_POPUP_CONFIG,
      ...tippyProps,
    });
    this.tippy.hide();
    this.CoreService = CoreService;
    this.CoreService.app.stage.addEventListener('mousemove', this.onMouseMove);
    this.CoreService.app.stage.addEventListener('mouseout', this.onMouseOut);
  }

  onMouseMove = () => {
    this.isMouseInner = true;
    this.checkTippyShow();
  };

  onMouseOut = () => {
    this.isMouseInner = false;
    this.checkTippyShow();
  };

  getContent() {
    return this.content;
  }

  setContent = debounce(
    (content: PopupContent | null) => {
      this.content = content ?? '';
      this.tippy.setContent(content ?? '');
      this.checkTippyShow();
    },
    16,
    {
      maxWait: 16,
    },
  );

  checkTippyShow() {
    if (this.content && this.isMouseInner) {
      this.tippy.show();
    } else {
      this.tippy.hide();
    }
  }

  destroy() {
    this.CoreService.app.stage.removeEventListener('mousemove', this.onMouseMove);
    this.CoreService.app.stage.removeEventListener('mouseout', this.onMouseOut);
    this.tippy.destroy();
  }
}
