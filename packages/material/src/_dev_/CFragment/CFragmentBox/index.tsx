export const CFragmentBox = (props: any) => {
  const {
    children,
    fragmentSchema = {} as any,
    COMPONENTS,
    ...restProps
  } = props;

  return <div className="frg_box">{children}</div>;
};
