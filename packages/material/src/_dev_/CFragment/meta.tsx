import { CMaterialType, CNode, CRootNode } from '@chamn/model';
import { snippets } from './snippets';
import { basicCategory, groupName } from './config';
import { componentName } from './config';
import { useEffect, useState } from 'react';
import { getAllSlotsFromSchema } from './helper';
import { CLoadLayoutBoxMeta } from './CFragmentBox/meta';
import { CFragmentSlotMeta } from './CFragmentSlot/meta';
import {
  CSetterProps,
  EnginContext,
  DEFAULT_PLUGIN_NAME_MAP,
} from '@chamn/engine';
import { DesignerPluginInstance } from '@chamn/engine/dist/plugins/Designer/type';

const nodeSchemaMap: any = {};

const updateSlotProps = (
  nodeModel: CNode | CRootNode,
  setterContext: CSetterProps['setterContext']
) => {
  const slotList = getAllSlotsFromSchema(nodeSchemaMap[nodeModel.id]);

  const plainProps = nodeModel.getPlainProps();

  slotList.forEach((el) => {
    const pKey = `_slot_${el}`;
    if (!plainProps[pKey]) {
      plainProps[pKey] = {
        type: 'SLOT',
        value: [
          {
            props: {
              slotId: pKey,
            },
            configure: {
              propsSetter: {},
              advanceSetter: {},
            },
            componentName: 'CFragmentBox',
          },
        ],
        renderType: 'COMP',
      };
    }
  });
  nodeModel.value.props = plainProps;
  nodeModel.updateValue();
  setterContext.pluginCtx.pageModel.reloadPage();
};

export const cFragmentMeta: CMaterialType<'SyncSlotProps'> = {
  componentName: componentName,
  title: 'Page Fragment',
  groupName,
  isContainer: true,
  props: [
    {
      title: '同步插槽',
      name: '_custom_',
      valueType: 'string',
      setters: [
        {
          componentName: 'SyncSlotProps',
          component: ({ setterContext }: CSetterProps) => {
            return (
              <div
                style={{
                  display: 'inline-block',
                  padding: '4px 8px',
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  borderRadius: '6px',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s',
                }}
                onClick={() => {
                  const nodeModel = setterContext.nodeModel;
                  updateSlotProps(nodeModel, setterContext);
                }}
              >
                Update
              </div>
            );
          },
        },
      ],
    },
  ],
  category: basicCategory,
  advanceCustom: {
    wrapComponent: (originalComp, options) => {
      const ctx: EnginContext = options.ctx;
      const Comp = originalComp;
      return (props) => {
        const [doc, setDoc] = useState<any>();

        const getDoc = async () => {
          const designerPlugin =
            await ctx.pluginManager.get<DesignerPluginInstance>(
              DEFAULT_PLUGIN_NAME_MAP.DesignerPlugin
            );
          const win = designerPlugin?.export.getDesignerWindow();
          setDoc(win?.document);
        };
        useEffect(() => {
          getDoc();
        }, []);

        return (
          <Comp
            {...props}
            doc={doc}
            onMount={(pageSchema: any) => {
              nodeSchemaMap[options.node.id] = pageSchema;
            }}
          />
        );
      };
    },
  },
  npm: {
    name: componentName,
    package: '111',
    version: __PACKAGE_VERSION__,
    destructuring: true,
    exportName: componentName,
  },
  snippets: snippets,
};

export default [cFragmentMeta, CLoadLayoutBoxMeta, CFragmentSlotMeta];
