import globalClassNames from '../../../../style.d';
declare const classNames: typeof globalClassNames & {
  readonly contentBox: 'contentBox';
  readonly nodeBox: 'nodeBox';
  readonly toolbarBox: 'toolbarBox';
  readonly iconItem: 'iconItem';
  readonly nodeContent: 'nodeContent';
  readonly selected: 'selected';
  readonly nodeArrow: 'nodeArrow';
  readonly expanded: 'expanded';
  readonly nodeRenderView: 'nodeRenderView';
  readonly nodeChildren: 'nodeChildren';
  readonly dropAnchorLine: 'dropAnchorLine';
  readonly arrowSpan: 'arrowSpan';
};
export = classNames;
