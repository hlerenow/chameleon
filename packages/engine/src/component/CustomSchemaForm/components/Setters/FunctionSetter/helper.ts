import { CNode, CPage, InnerComponentNameEnum, traversePageNode } from '@chamn/model';
import DefaultTslibSource from './defaultDts?raw';

import { quicktype, InputData, jsonInputForTargetLanguage } from 'quicktype-core';

export async function quicktypeJSON(typeName: string, jsonString: string) {
  const jsonInput = jsonInputForTargetLanguage('typescript');

  // We could add multiple samples for the same desired
  // type, or many sources for other types. Here we're
  // just making one type from one piece of sample JSON.
  await jsonInput.addSource({
    name: typeName,
    samples: [jsonString],
  });

  const inputData = new InputData();
  inputData.addInput(jsonInput);

  return await quicktype({
    inputData,
    lang: 'typescript',
    rendererOptions: {
      'just-types': 'true',
      'nice-property-names': 'false',
      'acronym-style': 'original',
    },
  });
}

export const getPageTypeDefined = async (pageModel: CPage, currentNode: CNode) => {
  const stateTypeMap: Record<
    string,
    {
      stateTypeDefined: string;
      methodsTypeDefined: string;
    }
  > = {} as any;
  const pList: any[] = [];
  traversePageNode(pageModel, (node) => {
    stateTypeMap[node.id] = {
      stateTypeDefined: '',
      methodsTypeDefined: '',
    };
    if (node.value.state) {
      const cb = async () => {
        let typeName = `CNode${node.id.toUpperCase()}`;
        let id = node.id;
        if (node.value.componentName === InnerComponentNameEnum.ROOT_CONTAINER) {
          typeName = 'GlobalState';
          id = 'GlobalState';
        }
        const tempRes = await quicktypeJSON(typeName, JSON.stringify(node.value.state));
        stateTypeMap[id] = {
          stateTypeDefined: tempRes.lines.join('\n'),
          methodsTypeDefined: '',
        };
      };

      pList.push(cb());
    }
  });

  await Promise.all(pList);

  const globalStateDts = stateTypeMap['GlobalState'];
  delete stateTypeMap.GlobalState;

  // 拼接 整体的 page state 类型定义
  let pageStateDts = '';

  pageStateDts += `type PageState = {\n`;
  const nodeIdList: string[] = [];

  Object.keys(stateTypeMap).forEach((k) => {
    if (stateTypeMap[k].stateTypeDefined) {
      const body = getBodyDefined(`CNode${k.toUpperCase()}`, stateTypeMap[k].stateTypeDefined);
      pageStateDts += `  '${k}': ${body},\n`;
      nodeIdList.push(`'${k}'`);
    }
  });

  pageStateDts += `};\n\n`;

  let dtsContent = DefaultTslibSource.replace('type PageState = any;', pageStateDts);
  dtsContent = dtsContent.replace('type NodeId = any;', `type NodeId = ${nodeIdList.join(' | ')};`);
  dtsContent = dtsContent.replace('type GlobalState = any;', globalStateDts.stateTypeDefined);
  dtsContent = dtsContent.replace(
    'Partial<GlobalState>',
    getBodyDefined('GlobalState', globalStateDts.stateTypeDefined)
  );
  // 处理当前 node 的 types
  const currentNodeDts = await quicktypeJSON('CurrentNodeState', JSON.stringify(currentNode.value.state || {}));
  const currentNodeDtsText = currentNodeDts.lines.join('\n');
  dtsContent = dtsContent.replace('type CurrentNodeState = any;', currentNodeDtsText);
  dtsContent = dtsContent.replace('Partial<CurrentNodeState>', getBodyDefined('CurrentNodeState', currentNodeDtsText));

  // 处理 methods 调用
  return dtsContent;
};

const getBodyDefined = (
  typeName: string,
  dtsStr: string,
  options?: {
    isPartial: true;
  }
) => {
  const body = dtsStr.replace(`export interface ${typeName}`, '').trim();
  if (!options?.isPartial) {
    return body;
  }
  return `Partial<${body}>`;
};
