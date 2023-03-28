import globalClassNames from '../../style.d';
declare const classNames: typeof globalClassNames & {
  readonly highlightBox: 'highlightBox';
  readonly borderDrawBox: 'borderDrawBox';
  readonly toolBox: 'toolBox';
  readonly horizontal: 'horizontal';
  readonly before: 'before';
  readonly after: 'after';
  readonly vertical: 'vertical';
  readonly current: 'current';
};
export = classNames;
