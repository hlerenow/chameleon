/// <reference types="react" />
import { ModalProps } from 'antd';
export declare type SortItemOrderProps = {
    list: any[];
    keyPaths: string[];
    label: string;
    onValueChange?: (newList: any[]) => void;
} & ModalProps;
export declare const SortItemOrderModal: ({ list, onValueChange, keyPaths, label, ...modalProps }: SortItemOrderProps) => JSX.Element;
