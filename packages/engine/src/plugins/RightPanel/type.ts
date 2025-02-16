import { CSetter } from '@/component';
import { TLogicRequestAPIItem } from '@chamn/model';

export type RightPanelConfig = {
  customPropertySetterMap?: Record<string, CSetter>;
  requestAPINode?: {
    customAPIInput?: (props: {
      value: any;
      onChange: (value: any) => void;
      form: {
        updateFields: (newValue: Partial<TLogicRequestAPIItem>) => void;
        getFields: () => Pick<
          TLogicRequestAPIItem,
          'apiPath' | 'body' | 'header' | 'query' | 'method' | 'responseVarName'
        >;
      };
    }) => React.ReactNode;
  };
};
