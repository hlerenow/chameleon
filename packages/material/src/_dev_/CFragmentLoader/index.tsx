import { useCallback, useEffect, useMemo, useState } from 'react';
import { CPageDataType } from '@chamn/model';
import axios from 'axios';
import { CFragment } from '../CFragment';

export const CFragmentLoader = ({
  COMPONENTS,
  onMount,
  fid = 1,
  prjId = 4,
  ...props
}: {
  fid: number;
  prjId: number;
  COMPONENTS: any;
  onMount?: (contentSchema: any) => void;
}) => {
  const [fragmentSchema, setFragmentSchema] = useState<CPageDataType>();
  const [ready, setReady] = useState(false);

  const getContent = useCallback(async () => {
    setReady(false);
    const DOMAIN = (window as any).DOMAIN || 'http://localhost:3000/api';
    try {
      const { data } = await axios.get(
        `${DOMAIN}/fragment/${prjId}/${fid}/release`
      );
      const newContentSchema = data.data?.schemaContent;
      setFragmentSchema(newContentSchema);
      setReady(true);
      onMount?.(newContentSchema);

      return newContentSchema;
    } catch (e) {
      console.log(e);
    }
    // 动态添加 props
  }, [fid]);

  useEffect(() => {
    getContent();
  }, []);

  const view = useMemo(() => {
    if (!fragmentSchema) {
      return <></>;
    }
    return (
      <CFragment
        {...props}
        fragmentSchema={fragmentSchema}
        COMPONENTS={COMPONENTS}
      ></CFragment>
    );
  }, [fragmentSchema, COMPONENTS, props]);

  if (!ready) {
    return <>Loading...</>;
  }

  return view;
};
