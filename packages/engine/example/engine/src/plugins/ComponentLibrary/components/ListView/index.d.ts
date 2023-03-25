/// <reference types="react" />
import { SnippetsType } from '@chameleon/model';
export type ListViewProps = {
    dataSource: {
        name: string;
        list: SnippetsType[];
    }[];
};
export declare const ListView: (props: ListViewProps) => JSX.Element | null;
