import { CPage, traversePageNode } from '@chamn/model';
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
    },
  });
}

export const getPageTypeDefined = async (pageModel: CPage) => {
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
        const tempRes = await quicktypeJSON(`CNode${node.id.toUpperCase()}`, JSON.stringify(node.value.state));
        stateTypeMap[node.id] = {
          stateTypeDefined: tempRes.lines.join('\n'),
          methodsTypeDefined: '',
        };
      };
      pList.push(cb());
    }
  });

  await Promise.all(pList);

  // 拼接 整体的 state 类型定义

  let pageStateDts = '';
  Object.keys(stateTypeMap).forEach((k) => {
    pageStateDts += stateTypeMap[k].stateTypeDefined;
  });

  pageStateDts += `type PAGE_STATE = {\n`;
  const nodeIdList: string[] = [];

  Object.keys(stateTypeMap).forEach((k) => {
    if (stateTypeMap[k].stateTypeDefined) {
      pageStateDts += `  '${k}': CNode${k.toUpperCase()},\n`;
      nodeIdList.push(`'${k}'`);
    }
  });

  pageStateDts += `};\n\n`;

  let dtsContent = DefaultTslibSource.replace('type PAGE_STATE = any;', pageStateDts);

  dtsContent = dtsContent.replace('type NodeId = any;', `type NodeId = ${nodeIdList.join(' | ')};`);

  return dtsContent;
};
