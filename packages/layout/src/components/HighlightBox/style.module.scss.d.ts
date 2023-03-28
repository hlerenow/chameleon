import globalClassNames from '../../style.d';
declare const classNames: typeof globalClassNames & {
  readonly highlightBox: 'highlightBox';
  readonly borderDrawBox: 'borderDrawBox';
  readonly toolBox: 'toolBox';
};
export = classNames;
