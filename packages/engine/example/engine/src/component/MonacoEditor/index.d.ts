/// <reference types="react" />
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';
import * as monacoEditor from 'monaco-editor/esm/vs/editor/editor.api';
export declare type MonacoEditorInstance = monacoEditor.editor.IStandaloneCodeEditor;
export declare type MonacoEditorProps = {
    onDidMount?: (editor: MonacoEditorInstance) => void;
    options?: monaco.editor.IStandaloneEditorConstructionOptions;
    override?: monaco.editor.IEditorOverrideServices;
    onChange?: (val: string) => void;
    onDidChangeMarkers?: (markers: monaco.editor.IMarker[]) => void;
    initialValue?: string;
    language?: 'json' | 'javascript' | 'typescript';
};
export declare const MonacoEditor: (props: MonacoEditorProps) => JSX.Element;
