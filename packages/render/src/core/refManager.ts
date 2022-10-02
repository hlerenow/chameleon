export class RefManager {
  private refMap = new Map();

  get(id: string) {
    return this.refMap.get(id).current;
  }
  add(id: string, handle: any) {
    this.refMap.set(id, handle);
  }

  remove(id: string) {
    this.refMap.delete(id);
  }

  destroy() {
    this.refMap.clear();
  }
}
