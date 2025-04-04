import { CSSSizeInputProps } from '@/component/CSSSizeInput';
import { CSetter, CSetterProps } from '../type';

export const FastLayoutSetter: CSetter<CSSSizeInputProps> = ({
  value,
  setterContext,
  initialValue,
}: CSetterProps<CSSSizeInputProps & { initialValue?: string }>) => {
  console.log(value, setterContext, initialValue);
  return <div>12312</div>;
};
