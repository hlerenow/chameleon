import styles from './index.module.scss';
import { useCFragmentContext } from '../layoutCtx';

export type CLoadLayoutSlotType = {
  isContainer?: boolean;
  COMPONENTS: any;
  slotId: string;
};
export const CFragmentSlot = (props: CLoadLayoutSlotType) => {
  const { children, COMPONENTS, ...restProps } = props as any;

  const layoutCtx = useCFragmentContext();

  const Child = layoutCtx.slotMap[`_slot_${props.slotId}`];

  return (
    <div className={styles.box}>
      {Child && <Child />}
      {children && children}
    </div>
  );
};
