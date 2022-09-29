import {
  CNodePropsTypeEnum,
  CPageDataType,
  InnerComponentNameEnum,
  PropObjType,
  SlotRenderType,
} from '@chameleon/model';

const data = [
  {
    key: '1',
    name: 'John Brown',
    age: 32,
    address: 'New York No. 1 Lake Park',
    tags: ['nice', 'developer'],
  },
  {
    key: '2',
    name: 'Jim Green',
    age: 42,
    address: 'London No. 1 Lake Park',
    tags: ['loser'],
  },
  {
    key: '3',
    name: 'Joe Black',
    age: 32,
    address: 'Sidney No. 1 Lake Park',
    tags: ['cool', 'teacher'],
  },
];

const columns: PropObjType[string] = [
  {
    title: 'Name',
    dataIndex: 'name',
    key: 'name',
    render: {
      type: CNodePropsTypeEnum.SLOT,
      renderType: SlotRenderType.FUNC,
      params: ['val', 'record', 'index'],
      value: {
        componentName: 'Row',
        children: [
          {
            componentName: 'Button',
            props: {
              mark: 'nameRender',
              children: {
                type: CNodePropsTypeEnum.EXPRESSION,
                value: '$$context.params.val',
              },
            },
          },
          {
            componentName: 'Col',
            children: [
              {
                componentName: 'Button',
                props: {
                  mark: 'nameRender',
                },
                children: [
                  {
                    componentName: 'div',
                  },
                ],
              },
            ],
          },
        ],
      },
    },
  },
  {
    title: 'Age',
    dataIndex: 'age',
    key: 'age',
  },
  {
    title: 'Address',
    dataIndex: 'address',
    key: 'address',
  },
  {
    title: 'Tags',
    key: 'tags',
    dataIndex: 'tags',
    // render: (_, { tags }) => (
    //   <>
    //     {tags.map((tag) => {
    //       let color = tag.length > 5 ? 'geekblue' : 'green';
    //       if (tag === 'loser') {
    //         color = 'volcano';
    //       }
    //       return (
    //         <Tag color={color} key={tag}>
    //           {tag.toUpperCase()}
    //         </Tag>
    //       );
    //     })}
    //   </>
    // ),
  },
  {
    title: 'Action',
    key: 'action',
  },
];

export const BasePage: CPageDataType = {
  version: '1.0.0',
  pageName: 'BaseDemoPage',
  componentsMeta: [],
  componentsTree: {
    componentName: InnerComponentNameEnum.PAGE,
    props: {
      a: 1,
    },
    children: [
      {
        componentName: 'Button',
        props: {
          type: 'primary',
        },
        children: ['123'],
      },
      {
        componentName: 'Table',
        props: {
          columns,
          dataSource: data,
        },
      },
      // {
      //   componentName: 'Row',
      //   children: [
      //     {
      //       componentName: 'Col',
      //       children: [
      //         {
      //           componentName: 'Button',
      //           children: ['123 木头人'],
      //         },
      //       ],
      //     },
      //   ],
      // },
    ],
  },
};
