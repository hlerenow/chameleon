import { CPage, CPageDataType } from '@chamn/model';
import { cloneDeep, isPlainObject } from 'lodash-es';

const DESIGN_NODE_KEYS = ['title', 'nodeName', 'configure'] as const;

type PageSchemaInput = CPage | CPageDataType;

const isNodeSchema = (value: Record<string, any>) => {
  return typeof value.componentName === 'string' && ('children' in value || 'props' in value);
};

const simplifyPropValue = (value: any): any => {
  if (Array.isArray(value)) {
    return value.map(simplifyPropValue);
  }

  if (!isPlainObject(value)) {
    return value;
  }

  if (isNodeSchema(value)) {
    return simplifyNode(value);
  }

  return Object.keys(value).reduce<Record<string, any>>((result, key) => {
    result[key] = simplifyPropValue(value[key]);
    return result;
  }, {});
};

const simplifyNode = (node: Record<string, any>): Record<string, any> => {
  const result = { ...node };
  DESIGN_NODE_KEYS.forEach((key) => {
    delete result[key];
  });

  if (Array.isArray(result.children)) {
    result.children = result.children.map((child: any) => {
      return isPlainObject(child) ? simplifyNode(child) : child;
    });
  }

  if (isPlainObject(result.props)) {
    result.props = Object.keys(result.props).reduce<Record<string, any>>((props, key) => {
      props[key] = simplifyPropValue(result.props[key]);
      return props;
    }, {});
  }

  return result;
};

/**
 * Export a render-ready page schema without editor-only node metadata.
 *
 * Removed node fields:
 * - title: editor display label
 * - nodeName: editor/runtime internal name
 * - configure: setter and editor state
 */
export const simplifyPageSchema = <T = any>(page: PageSchemaInput): CPageDataType<T> => {
  const schema = page instanceof CPage ? page.export('save') : cloneDeep(page);

  return {
    ...schema,
    componentsTree: simplifyNode(schema.componentsTree) as CPageDataType<T>['componentsTree'],
  };
};
