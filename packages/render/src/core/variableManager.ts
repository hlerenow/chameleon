export class VariableManager {
  private varSpace = new Map();

  get(id: string) {
    return this.varSpace.get(id);
  }
  add(id: string, handle: any) {
    this.varSpace.set(id, handle);
  }

  remove(id: string) {
    this.varSpace.delete(id);
  }

  destroy() {
    this.varSpace.clear();
  }

  getStateSnapshot() {
    const res: Record<string, any> = {};
    this.varSpace.forEach((val, key) => {
      res[key] = val;
    });
    return res;
  }
}
