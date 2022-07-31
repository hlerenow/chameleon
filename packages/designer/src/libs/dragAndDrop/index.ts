class DragAndDrop {
  eventQueue: (() => void)[];
  currentDoc: Document | null;
  currentDrag: {
    dom: HTMLElement;
    data: any;
    name: string;
  } | null;
  dragState: 'NONE' | 'DRAG_START' | 'DRAGGING' | 'DRAG_END';
  eventLister: {
    dragStart: (() => void)[];
    dragging: (() => void)[];
    dragEnd: (() => void)[];
  };
  allDoc: any;
  constructor() {
    this.allDoc = [];
    this.dragState = 'NONE';
    this.currentDrag = null;
    this.currentDoc = null;
    this.eventQueue = [];
    this.eventLister = {
      dragStart: [],
      dragging: [],
      dragEnd: [],
    };
  }

  registerHotArea(dom: HTMLElement, doc: Document, name?: string) {
    this.allDoc.push(doc);
    let hotAreaName = name || '';
    dom.addEventListener(
      'mouseenter',
      () => {
        this.currentDoc = doc;
        console.log(`${hotAreaName}  mouseenter`, this.currentDoc);
      },
      true
    );
    dom.addEventListener(
      'mouseleave',
      e => {
        console.log(`${hotAreaName} mouseenter leave`);
        if (e.view?.document === this.currentDoc) {
          this.currentDoc = null;
        }
        console.log(this.currentDoc);
      },
      true
    );
    dom.addEventListener(
      'mousedown',
      e => {
        this.dragState = 'DRAGGING';
        this.currentDoc = doc;
        e.preventDefault();
        this.allDoc.map((doc: Document) => {
          doc.body.style.cursor = 'move';
        });
      },
      true
    );
    dom.addEventListener(
      'mousemove',
      e => {
        if (this.dragState !== 'DRAGGING') {
          return;
        }
        // 修正事件文档
        console.log(`${name} move `);
        this.dragState = 'DRAGGING';
        if (e.view?.document === this.currentDoc) {
          console.log('文档一致', e.target);
        } else {
          let newTarget = this.currentDoc?.elementFromPoint(
            e.screenX,
            e.screenY
          );
          console.log('文档不一致', newTarget);
        }
        console.log(e);
      },
      true
    );
  }

  clearEvent() {}
}

export default DragAndDrop;
