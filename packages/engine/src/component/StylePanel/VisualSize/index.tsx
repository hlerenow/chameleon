import styles from './style.module.scss';

type Props = { value?: Record<string, string>; dom?: HTMLElement | null };

const sides = ['top', 'right', 'bottom', 'left'] as const;
const read = (value: Record<string, string>, key: string) => value[key] || '0px';
const layers = [
  { name: 'margin', color: 'margin', keys: sides.map((side) => `margin-${side}`) },
  { name: 'border', color: 'border', keys: sides.map((side) => `border-${side}-width`) },
  { name: 'padding', color: 'padding', keys: sides.map((side) => `padding-${side}`) },
] as const;

const getComputedBoxModel = (dom: HTMLElement) => {
  const view = dom.ownerDocument.defaultView;
  const computed = view?.getComputedStyle(dom);
  if (!computed) {
    return {};
  }
  const values = sides.reduce(
    (result, side) => ({
      ...result,
      [`margin-${side}`]: computed.getPropertyValue(`margin-${side}`),
      [`padding-${side}`]: computed.getPropertyValue(`padding-${side}`),
      [`border-${side}-width`]: computed.getPropertyValue(`border-${side}-width`),
    }),
    {} as Record<string, string>
  );
  const { width, height } = dom.getBoundingClientRect();
  return { width: `${Math.round(width)}`, height: `${Math.round(height)}`, ...values };
};

export const VisualSize = ({ value = {}, dom }: Props) => {
  const visualValue = dom ? getComputedBoxModel(dom) : value;

  const field = (key: string) => (
    <span className={styles.value}>{read(visualValue, key).replace(/[^\d.-]/g, '') || '0'}</span>
  );

  const layer = (item: typeof layers[number]) => (
    <div className={`${styles.layer} ${styles[item.color]}`} key={item.name}>
      <span className={styles.layerName}>{item.name}</span>
      <span className={styles.top}>{field(item.keys[0])}</span>
      <span className={styles.right}>{field(item.keys[1])}</span>
      <span className={styles.bottom}>{field(item.keys[2])}</span>
      <span className={styles.left}>{field(item.keys[3])}</span>
      {item.name === 'padding' && (
        <div className={styles.content}>
          <span className={styles.contentSize}>
            {read(visualValue, 'width')} × {read(visualValue, 'height')}
          </span>
        </div>
      )}
    </div>
  );

  return (
    <section className={styles.visualSize} aria-label="Visual size">
      <div className={styles.diagram}>{layers.map(layer)}</div>
    </section>
  );
};
