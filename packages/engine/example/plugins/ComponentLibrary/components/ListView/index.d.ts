/// <reference types="react" />
import { SnippetsType } from '@chameleon/model';
export declare type ListViewProps = {
    dataSource: {
        name: string;
        list: SnippetsType[];
    }[];
};
export declare const ListView: (props: ListViewProps) => JSX.Element | null;
