import globalClassNames from './style.d';
declare const classNames: typeof globalClassNames & {
  readonly layoutContainer: 'layoutContainer';
  readonly elementHighlightBox: 'elementHighlightBox';
  readonly iframeBox: 'iframeBox';
};
export = classNames;
