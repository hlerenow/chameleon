import { useEffect, useState } from 'react';
import { ReactAdapter, Render, useRender } from '@chamn/render';
import * as components from 'antd';

export const Preview = () => {
  const [page, setPage] = useState();
  const renderHandle = useRender();
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const localPage = localStorage.getItem('pageSchema');
    if (localPage) {
      setPage(JSON.parse(localPage));
      setLoading(false);
    }
  }, []);
  if (loading) {
    return <>Not find page info on local, please ensure you save it on editor</>;
  }
  return (
    <div className="App" style={{ overflow: 'auto', height: '100%' }}>
      <Render page={page} components={components} render={renderHandle as any} adapter={ReactAdapter} />
    </div>
  );
};
