import React, { useEffect, useMemo, useRef } from 'react';
import type { CSSProperties } from 'react';
import { ImgLabel } from './ImgLabel';
// console.log("ImgLabel", ImgLabel);
let mock = [
  {
    data: [
      { x: 206.90498046874995, y: 169.97207031250002 },
      { x: 206.90498046874995, y: 169.97216796875006 },
      { x: 237.35009765625, y: 691.0166015625002 },
      { x: 949.6070312500001, y: 607.2760742187502 },
      { x: 845.3326171875001, y: 151.63310546875005 },
      { x: 574.53984375, y: 70.94736328125003 },
    ],
    properties: {
      id: 'polygon-227',
      isHover: false,
      isActive: false,
      isDrag: false,
      isDraw: false,
      createTime: 1689244827486,
      nodes: [
        {
          data: { x: 206.90498046874995, y: 169.97207031250002 },
          properties: { id: 'point-224', isHover: false, isActive: false, isDrag: false, createTime: 1689244827485 },
        },
        {
          data: { x: 206.90498046874995, y: 169.97216796875006 },
          properties: { id: 'point-228', isHover: false, isActive: false, isDrag: false, createTime: 1689244827583 },
        },
        {
          data: { x: 237.35009765625, y: 691.0166015625002 },
          properties: { id: 'point-294', isHover: false, isActive: false, isDrag: false, createTime: 1689244828135 },
        },
        {
          data: { x: 949.6070312500001, y: 607.2760742187502 },
          properties: { id: 'point-368', isHover: false, isActive: false, isDrag: false, createTime: 1689244828617 },
        },
        {
          data: { x: 845.3326171875001, y: 151.63310546875005 },
          properties: { id: 'point-436', isHover: false, isActive: false, isDrag: false, createTime: 1689244829168 },
        },
        {
          data: { x: 574.53984375, y: 70.94736328125003 },
          properties: { id: 'point-512', isHover: false, isActive: false, isDrag: false, createTime: 1689244829834 },
        },
      ],
      line: {
        data: [
          { x: 206.90498046874995, y: 169.97207031250002 },
          { x: 206.90498046874995, y: 169.97216796875006 },
          { x: 237.35009765625, y: 691.0166015625002 },
          { x: 949.6070312500001, y: 607.2760742187502 },
          { x: 845.3326171875001, y: 151.63310546875005 },
          { x: 574.53984375, y: 70.94736328125003 },
          { x: 206.90498046874995, y: 169.97207031250002 },
        ],
        properties: {
          id: 'line-226',
          isHover: false,
          isActive: false,
          isDrag: false,
          isDraw: false,
          createTime: 1689244827486,
          nodes: [
            {
              data: { x: 206.90498046874995, y: 169.97207031250002 },
              properties: {
                id: 'point-224',
                isHover: false,
                isActive: false,
                isDrag: false,
                createTime: 1689244827485,
              },
            },
            {
              data: { x: 206.90498046874995, y: 169.97216796875006 },
              properties: {
                id: 'point-228',
                isHover: false,
                isActive: false,
                isDrag: false,
                createTime: 1689244827583,
              },
            },
            {
              data: { x: 237.35009765625, y: 691.0166015625002 },
              properties: {
                id: 'point-294',
                isHover: false,
                isActive: false,
                isDrag: false,
                createTime: 1689244828135,
              },
            },
            {
              data: { x: 949.6070312500001, y: 607.2760742187502 },
              properties: {
                id: 'point-368',
                isHover: false,
                isActive: false,
                isDrag: false,
                createTime: 1689244828617,
              },
            },
            {
              data: { x: 845.3326171875001, y: 151.63310546875005 },
              properties: {
                id: 'point-436',
                isHover: false,
                isActive: false,
                isDrag: false,
                createTime: 1689244829168,
              },
            },
            {
              data: { x: 574.53984375, y: 70.94736328125003 },
              properties: {
                id: 'point-512',
                isHover: false,
                isActive: false,
                isDrag: false,
                createTime: 1689244829834,
              },
            },
            {
              data: { x: 206.90498046874995, y: 169.97207031250002 },
              properties: {
                id: 'point-514',
                isHover: false,
                isActive: false,
                isDrag: false,
                createTime: 1689244829969,
              },
            },
          ],
        },
      },
    },
  },
];

const componentName = 'Test';

export interface TestProps {
  style?: CSSProperties;
  className?: string | string[];
}
export const Test: React.FC<TestProps> = (props) => {
  const { style, className } = props;

  let ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let ins: ImgLabel;
    if (ref.current) {
      ins = new ImgLabel(ref.current);
    }

    setTimeout(() => {
      //@ts-ignore
      ins.drawService.drawMode.setData(mock);
    }, 1000);

    // const getData = () => {
    //   let data = ins.drawService.drawMode.getData();
    //   // console.log('data', data);
    //   return data;
    // };
    //@ts-ignore
    // window.getData = getData;

    return () => {
      ins?.destroy?.();
    };
  }, []);

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
    </div>
  );
};

Test.displayName = 'Test';

export default Test;
