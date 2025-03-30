import { SnippetsCollection, SnippetsType } from '@chamn/model';

export const getTargetMNodeKeyVal = (dom: HTMLElement | null, key: string): null | string => {
  if (!dom) {
    return null;
  }
  const val = dom.getAttribute(key);
  if (!val) {
    return getTargetMNodeKeyVal(dom.parentElement, key);
  } else {
    return val;
  }
};

export const searchComponentSnippets = (componentList: SnippetsCollection, searchKeyWords: string) => {
  const newResList: {
    name: string;
    list: SnippetsType[];
  }[] = [];
  const searchString = searchKeyWords?.toLowerCase();
  componentList.forEach((el) => {
    // category
    const tempList = [...el.list];
    tempList.forEach((it) => {
      const snippets = it.list.filter((i) => {
        let hit: boolean | undefined = false;
        if (typeof i.description === 'string') {
          hit = i.description?.includes(searchString);
        }
        hit = hit || i.title?.toLowerCase().includes(searchString);
        hit = hit || i.snapshotText?.toLowerCase().includes(searchString);
        hit = hit || i.category?.toLowerCase().includes(searchString);
        return hit;
      });
      if (snippets.length) {
        newResList.push({
          name: it.name,
          list: snippets,
        });
      }
    });
  });

  return newResList;
};
