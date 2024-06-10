import React, { useEffect, useMemo, useRef } from 'react';
import type { CSSProperties } from 'react';
import { ImgLabel } from './ImgLabel';
// console.log("ImgLabel", ImgLabel);
import { mock } from './mock';

const componentName = 'Test';

export interface TestProps {
  style?: CSSProperties;
  className?: string | string[];
}
export const Test: React.FC<TestProps> = (props) => {
  const { style, className } = props;

  let ref = useRef<HTMLDivElement>(null);

  const insRef = useRef<ImgLabel | null>(null);

  useEffect(() => {
    let ins: ImgLabel;
    if (ref.current) {
      ins = new ImgLabel(ref.current);
      insRef.current = ins;
    }

    return () => {
      ins?.destroy?.();
    };
  }, []);

  /* ============================== split =============================== */

  return (
    <div>
      <div
        style={{
          width: 800,
          height: 600,
          marginLeft: 400,
          backgroundColor: 'black',
        }}
        ref={ref}
      ></div>

      <div>
        <button
          onClick={() => {
            insRef?.current?.initShap();
          }}
        >
          initShap
        </button>
        <button
          onClick={() => {
            insRef?.current?.initCrop();
          }}
        >
          initCrop
        </button>

        <button
          onClick={() => {
            insRef?.current?.destoryCrop();
          }}
        >
          destoryCrop
        </button>

        <button
          onClick={() => {
            insRef?.current?.initDraw();
          }}
        >
          initDraw
        </button>

        <button
          onClick={() => {
            insRef?.current?.changeDrawMode();
          }}
        >
          changeDrawMode
        </button>

        <button
          onClick={() => {
            insRef?.current?.destroy();
          }}
        >
          destroy
        </button>
      </div>
    </div>
  );
};

Test.displayName = 'Test';

export default Test;
