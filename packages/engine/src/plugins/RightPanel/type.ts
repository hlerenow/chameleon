import { CSetter } from '@/component';
import { CForm } from '@/component/CustomSchemaForm/components/Form';
import { Ref } from 'react';

export type RightPanelConfig = {
  customPropertySetterMap?: Record<string, CSetter>;
  requestAPINode?: {
    customAPIInput?: (props: { value: any; onChange: (value: any) => void; form: Ref<CForm> }) => React.ReactNode;
  };
};
