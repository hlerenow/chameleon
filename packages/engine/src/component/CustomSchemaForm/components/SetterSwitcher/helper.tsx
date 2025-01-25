import styles from './style.module.scss';

export function EmptySetter(props: { setterName: string }) {
  return (
    <div
      style={{
        backgroundColor: 'whitesmoke',
        margin: '5px 0',
        padding: '5px',
        borderRadius: '2px',
        color: 'gray',
      }}
    >{`${props?.setterName} is not found.`}</div>
  );
}

export const getEmptySetter = (setterName: string) => {
  // eslint-disable-next-line react/display-name
  return () => <EmptySetter setterName={setterName} />;
};

// 新增 CollapseHeader 组件
export const CollapseHeader: React.FC<{
  label: React.ReactNode;
  headerExt?: React.ReactNode;
  switcher?: React.ReactNode;
}> = ({ label, headerExt, switcher }) => (
  <div className={styles.collapseHeader}>
    <span style={{ flex: 1 }}>{label}</span>
    {headerExt}
    {switcher}
  </div>
);
