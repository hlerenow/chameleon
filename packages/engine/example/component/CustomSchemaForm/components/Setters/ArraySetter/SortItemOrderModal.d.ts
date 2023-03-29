/// <reference types="react" />
import { ModalProps } from 'antd';
export type SortItemOrderProps = {
    list: any[];
    keyPaths: string[];
    label: string;
    sortLabelKey?: string;
    onValueChange?: (newList: any[]) => void;
} & ModalProps;
export declare const SortItemOrderModal: ({ list, onValueChange, keyPaths, label, sortLabelKey, ...modalProps }: SortItemOrderProps) => JSX.Element;
