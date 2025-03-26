import { SnippetsType } from '@chamn/model';
import { breakpoints, defaultItemResponsive } from './config';

export const snippets: SnippetsType[] = [
  {
    title: '高级布局画布',
    snapshotText: 'RGL',
    description: '高级布局画布',
    schema: {
      props: {
        breakpoints: breakpoints,
      },
    },
  },
];

export const snippetsGridItem: SnippetsType[] = [
  {
    title: '高级布局容器',
    snapshotText: 'RGEL',
    description: '高级布局容器',
    schema: {
      props: {
        responsive: [...defaultItemResponsive],
      },
    },
  },
];
