import React from 'react';

export type TreeNodeData = {
  containerRender?: (params: any) => React.ReactNode;
  title: React.ReactNode;
  icon?: React.ReactNode;
  key?: string;
  children?: TreeNodeData[];
  parent?: TreeNodeData | null;
  canBeSelected?: boolean;
  canDrag?: boolean;
  canDrop?: boolean | ('before' | 'after' | 'current')[];
};

const x = 10;
const y = 3;
const z = 2;

const generateData = (
  _level: number,
  _tns: TreeNodeData[],
  _preKey?: React.Key
) => {
  const preKey = _preKey || '0';
  const tns = _tns || [];

  const children: React.Key[] = [];
  for (let i = 0; i < x; i++) {
    const key = `${preKey}-${i}`;
    tns.push({ title: key, key });
    if (i < y) {
      children.push(key);
    }
  }
  if (_level < 0) {
    return tns;
  }
  const level = _level - 1;
  children.forEach((key, index) => {
    tns[index].children = [];
    return generateData(level, tns[index].children!, key);
  });
};
const tempData: TreeNodeData[] = [];
generateData(z, tempData);

export const DemoTreeData: TreeNodeData = {
  title: 'Page',
  children: tempData,
};
