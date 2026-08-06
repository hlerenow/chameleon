import { useEffect, useMemo, useState } from 'react';
import { CMaterialType, CPage, CPageDataType } from '@chamn/model';

export function useEditablePageSchema(initialSchema: CPageDataType, materials?: CMaterialType[]) {
  const [schema, setSchema] = useState(initialSchema);

  useEffect(() => {
    setSchema(initialSchema);
  }, [initialSchema]);

  const page = useMemo(() => new CPage(schema, { materials }), [materials, schema]);

  return { page, schema, setSchema };
}
