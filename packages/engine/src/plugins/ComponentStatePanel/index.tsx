import { useEffect, useRef } from 'react';
import { CNode, CRootNode } from '@chamn/model';
import { CPluginCtx } from '../../core/pluginManager';
import { CRightPanelItem } from '../RightPanel/view';
import { MonacoEditor, MonacoEditorInstance } from '../../component/MonacoEditor';

export type ComponentStatePanelProps = {
  node: CNode | CRootNode;
  pluginCtx: CPluginCtx;
};

export const ComponentStatePanel = (props: ComponentStatePanelProps) => {
  const { node } = props;
  const nodeState = node.value.state || {};
  const editorRef = useRef<MonacoEditorInstance | null>(null);
  useEffect(() => {
    const currentState = node.value.state || {};
    editorRef?.current?.setValue(JSON.stringify(currentState, null, 2));
  }, [node]);

  const onValueChange = (newValStr?: string) => {
    try {
      const newVal = JSON.parse(newValStr || '{}');
      node.value.state = newVal;
      node.updateValue();
    } catch (e) {
      console.warn(e);
    }
  };

  return (
    <>
      <MonacoEditor
        initialValue={JSON.stringify(nodeState, null, 2)}
        language={'json'}
        options={{
          automaticLayout: true,
          // lineDecorationsWidth: 0,
          tabSize: 2,
          minimap: { enabled: false },
          quickSuggestions: false,
          // lineNumbers: 'off',
          suggestOnTriggerCharacters: false,
          folding: false,
        }}
        onDidMount={(editor) => {
          editorRef.current = editor;
        }}
        onChange={onValueChange}
      />
    </>
  );
};

export const ComponentStatePanelConfig: CRightPanelItem = {
  key: 'State',
  name: 'State',
  view: ({ node, pluginCtx }) => <ComponentStatePanel node={node} pluginCtx={pluginCtx} />,
  show: (props) => {
    return props.node.material?.value.advanceCustom?.rightPanel?.state !== false;
  },
};
