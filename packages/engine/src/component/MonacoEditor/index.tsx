import { useEffect } from 'react';
import * as monaco from 'monaco-editor';

import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker';
import jsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker';
// import cssWorker from 'monaco-editor/esm/vs/language/css/css.worker?worker';
// import htmlWorker from 'monaco-editor/esm/vs/language/html/html.worker?worker';
import tsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker';
import { useRef } from 'react';
import * as monacoEditor from 'monaco-editor/esm/vs/editor/editor.api';

self.MonacoEnvironment = {
  getWorker(_, label) {
    if (label === 'json') {
      return new jsonWorker();
    }
    // if (label === 'css' || label === 'scss' || label === 'less') {
    //   return new cssWorker();
    // }
    // if (label === 'html' || label === 'handlebars' || label === 'razor') {
    //   return new htmlWorker();
    // }
    if (label === 'typescript' || label === 'javascript') {
      return new tsWorker();
    }
    return new editorWorker();
  },
};

export type MonacoEditorInstance = monacoEditor.editor.IStandaloneCodeEditor;

export type MonacoEditorProps = {
  beforeMount?: (monaco: typeof monacoEditor) => void;
  onDidMount?: (editor: MonacoEditorInstance) => void;
  options?: monaco.editor.IStandaloneEditorConstructionOptions;
  override?: monaco.editor.IEditorOverrideServices;
  onChange?: (val: string, e: monaco.editor.IModelContentChangedEvent) => void;
  onDidChangeMarkers?: (markers: monaco.editor.IMarker[]) => void;
  initialValue?: string;
  language?: 'json' | 'javascript' | 'typescript';
};

export const MonacoEditor = (props: MonacoEditorProps) => {
  const editorDomRef = useRef<HTMLDivElement>(null);
  const onChangeRef = useRef<MonacoEditorProps['onChange'] | undefined>();
  onChangeRef.current = props.onChange;
  const onDidChangeMarkersRef = useRef<MonacoEditorProps['onDidChangeMarkers'] | undefined>();
  onDidChangeMarkersRef.current = props.onDidChangeMarkers;
  const editorInstance = useRef<MonacoEditorInstance | null>(null);

  useEffect(() => {
    if (!editorDomRef.current) {
      return;
    }
    props.beforeMount?.(monaco);
    const editor = monaco.editor.create(
      editorDomRef.current,
      {
        ...(props.options || {}),
        value: props.initialValue || props.options?.value,
        language: props.language || props.options?.language,
      },
      { ...(props.override || {}) }
    );

    editorInstance.current = editor;
    props.onDidMount?.(editor);
    const subscription = editor?.onDidChangeModelContent((event) => {
      if (!event.isFlush) {
        onChangeRef.current?.(editor.getValue(), event);
      }
    });

    monaco.editor.onDidChangeMarkers((uris) => {
      const editorModel = editor.getModel();
      if (!editorModel) {
        return;
      }
      const editorUri = editorModel.uri;
      const changeUri = uris.find((el) => el.path === editorUri.path);
      if (changeUri) {
        const res = monaco.editor.getModelMarkers({
          resource: editorUri,
        });
        onDidChangeMarkersRef.current?.(res);
      }
    });

    () => {
      editor.dispose();
      subscription?.dispose();
    };
  }, []);

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
      }}
      ref={editorDomRef}
    ></div>
  );
};
