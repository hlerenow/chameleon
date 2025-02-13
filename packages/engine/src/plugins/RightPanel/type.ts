import { CSetter } from '@/component';

export type RightPanelConfig = {
  customPropertySetterMap?: Record<string, CSetter>;
  requestAPINode?: {
    customAPIInput?: (props: { value: any; onChange: (value: any) => void }) => React.ReactNode;
  };
};
