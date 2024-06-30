import { CMaterials } from '.';

describe('CMaterials', () => {
  test('Add Materials methods', () => {
    const mat = new CMaterials([
      {
        componentName: 'A',
        title: 'A',
        snippets: [],
        props: [],
      },
      {
        componentName: 'F',
        title: 'F',
        snippets: [],
        props: [],
      },
    ]);

    mat.addMaterials([
      {
        componentName: 'A',
        title: 'AB',
        snippets: [],
        props: [],
      },
      {
        componentName: 'D',
        title: 'D',
        snippets: [],
        props: [],
      },
    ]);
    expect(mat.value.length).toBe(3);
    expect(mat.value[0].componentName).toEqual('A');
    expect(mat.value[0].value.title).toEqual('AB');
    expect(mat.value[2].value.title).toEqual('D');
  });
});
