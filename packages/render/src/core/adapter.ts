export interface AdapterOptionsType {
  // find target component render function
  getComponent: () => void;
  //
  getContext: () => void;
  getUtils: () => void;
  transformProps: () => void;
  transformData: () => void;
  transformGlobalData: () => void;
}

const EmptyAdapter = {
  getComponent: () => {
    console.warn('Need to be implement getComponent');
  },
};

export class Adapter {
  runtime: AdapterOptionsType;
  constructor(options: AdapterOptionsType) {
    this.runtime = {
      ...EmptyAdapter,
      ...options,
    };
  }
}
