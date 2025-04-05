import * as csstree from 'css-tree';

export function parseCssToObject(css: string): Record<string, Record<string, string>> {
  const result: Record<string, Record<string, string>> = {};

  const ast = csstree.parse(css, {
    context: 'stylesheet',
  });

  csstree.walk(ast, {
    visit: 'Rule',
    enter(node) {
      if (node.type === 'Rule' && node.prelude.type === 'SelectorList') {
        const selector = csstree.generate(node.prelude);

        const declarations: Record<string, string> = {};
        if (node.block.type === 'Block') {
          for (const declaration of node.block.children.toArray()) {
            if (declaration.type === 'Declaration') {
              const prop = declaration.property;
              const value = csstree.generate(declaration.value);
              declarations[prop] = value;
            }
          }
        }

        result[selector] = declarations;
      }
    },
  });

  return result;
}
