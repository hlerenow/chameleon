export class ComponentInstanceManager {
  private instanceMap = new Map();

  get(id: string) {
    return this.instanceMap.get(id);
  }
  add(id: string, handle: any) {
    this.instanceMap.set(id, handle);
  }

  remove(id: string) {
    this.instanceMap.delete(id);
  }

  destroy() {
    this.instanceMap.clear();
  }
}
