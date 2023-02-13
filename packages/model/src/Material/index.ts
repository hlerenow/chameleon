import {
  CMaterialStanderType,
  CMaterialType,
  CMaterialTypeDescribe,
  SnippetsType,
} from '../types/material';
import { cloneDeep, isArray } from '../util/lodash';
import { checkComplexData } from '../util/dataCheck';
import { getRandomStr } from '../util';

const parseMaterial = (data: CMaterialType): CMaterialStanderType => {
  const newData = cloneDeep(data);
  const snippets = newData.snippets;
  delete (newData as any).snippets;
  newData.snippets = snippets.map((el) => {
    return {
      ...newData,
      ...el,
      id: el.id || `${data.componentName}-${getRandomStr()}`,
      title: el.title || data.title,
      category: el.category || data.category,
      tags: [...(el.tags || []), ...(data.tags || [])],
      groupName: el.groupName || data.groupName,
      snapshot: el.snapshot || data.icon,
      snapshotText: el.snapshotText,
      schema: {
        ...el.schema,
        componentName: el.schema.componentName || data.componentName,
      },
    };
  });
  return newData as CMaterialStanderType;
};

export class CMaterial {
  private rawData: CMaterialType;
  private data: CMaterialStanderType;
  constructor(data: CMaterialType) {
    this.rawData = data;
    this.data = parseMaterial(data);
  }

  get value() {
    return this.data;
  }

  get componentName() {
    return this.data.componentName;
  }

  get snippets() {
    return this.data.snippets;
  }

  getSnippetById(id: string) {
    return this.data.snippets.find((el) => el.id === id);
  }
}

const parseMaterials = (data: any[]) => {
  if (!isArray(data)) {
    throw new Error('Materials must be a array');
  }
  return data.map((el) => {
    return new CMaterial(el);
  });
};

export const checkMaterials = (data: CMaterialType[]) => {
  // check page children
  data?.forEach((it: any) => {
    checkComplexData({
      data: it,
      dataStruct: CMaterialTypeDescribe,
      throwError: true,
    });
  });
};

export type SnippetsCollection = {
  name: string;
  list: { name: string; list: SnippetsType[] }[];
}[];
export class CMaterials {
  private rowData: CMaterialType[];
  private data: CMaterial[];
  constructor(data: any) {
    this.rowData = data;
    checkMaterials(data);
    this.data = parseMaterials(data);
  }

  findByComponentName(componentName: string) {
    const target = this.data.find((el) => el.componentName === componentName);
    return target;
  }

  findSnippetById(id: string) {
    const list = [...this.data];
    let res = null;
    while (!res && list.length) {
      const target = list.pop();
      res = target?.getSnippetById(id);
    }
    return res;
  }

  getAllSnippets() {
    let allSnippets = this.data.reduce((res, el) => {
      res.push(...el.snippets);
      return res;
    }, [] as SnippetsType[]);
    const groups: string[] = ['default'];
    const groupRes: Record<string, SnippetsType[]> = {
      default: [],
    };

    allSnippets = allSnippets.sort((a, b) => {
      return (a.category || '') > (b.category || '') ? 1 : -1;
    });

    // split group
    allSnippets.forEach((el) => {
      const groupName = el.groupName || 'default';
      if (!groups.includes(groupName)) {
        groups.push(groupName);
        groupRes[groupName] = [];
      }
      groupRes[groupName].push(el);
    });
    const res: SnippetsCollection = [];
    groups.forEach((groupName) => {
      const categories: string[] = ['default'];
      const categoryRes: Record<string, SnippetsType[]> = {
        default: [],
      };
      const list = groupRes[groupName];
      if (list.length !== 0) {
        list.forEach((el) => {
          const categoryName = el.category || 'default';
          if (!categories.includes(categoryName)) {
            categories.push(categoryName);
            categoryRes[categoryName] = [];
          }
          categoryRes[categoryName].push(el);
        });

        const categoryList: {
          name: string;
          list: SnippetsType[];
        }[] = [];
        categories.forEach((category) => {
          if (categoryRes[category].length) {
            categoryList.push({
              name: category,
              list: categoryRes[category],
            });
          }
        });

        const val = {
          name: groupName,
          list: categoryList,
        };

        res.push(val);
      }
    });

    return res;
  }

  get value() {
    return this.data;
  }
}
