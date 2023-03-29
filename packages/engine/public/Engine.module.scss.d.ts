import globalClassNames from './style.d';
declare const classNames: typeof globalClassNames & {
  readonly engineContainer: 'engineContainer';
};
export = classNames;
