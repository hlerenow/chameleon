import { waitReactUpdate } from '@/utils';
import { CPageDataType } from '@chameleon/model';
import { cloneDeep } from 'lodash-es';
import { CPlugin, CPluginCtx } from '../../core/pluginManager';

const PLUGIN_NAME = 'History';

export const HistoryPlugin: CPlugin = (ctx) => {
  const CTX: CPluginCtx | null = ctx;
  const dataStore = {
    historyRecords: [] as CPageDataType[],
    currentStepIndex: 0,
  };

  let originalPageRecord: CPageDataType | null = null;
  const pageSchema = ctx.pageModel.export();
  originalPageRecord = pageSchema;
  dataStore.historyRecords.push(pageSchema);

  const loadPage = async (page: CPageDataType) => {
    if (!CTX) {
      return;
    }
    CTX.pageModel.reloadPage(page);
    await waitReactUpdate();
    console.log('🚀 ~ file: index.tsx:32 node-change ~ ctx.pageModel.emitter.on  ~ currentStepIndex:', dataStore);
  };

  const resObj = {
    addStep: () => {
      const { currentStepIndex, historyRecords } = dataStore;
      const newPage = ctx.pageModel.export();
      if (currentStepIndex !== historyRecords.length - 1) {
        dataStore.historyRecords = historyRecords.slice(0, currentStepIndex + 1);
      }
      dataStore.historyRecords.push(newPage);
      dataStore.currentStepIndex = historyRecords.length - 1;
    },
    reset: async () => {
      const ctx = CTX;
      if (!ctx) {
        console.warn('plugin ctx is null, pls check it');
        return;
      }
      if (!originalPageRecord) {
        return;
      }
      dataStore.historyRecords = [];
      loadPage(originalPageRecord);
    },
    preStep: () => {
      const { currentStepIndex, historyRecords } = dataStore;
      if (!resObj.canGoPreStep()) {
        return;
      }
      const newIndex = currentStepIndex - 1;
      dataStore.currentStepIndex = newIndex;
      const page = cloneDeep(historyRecords[newIndex]);
      loadPage(page);
    },
    nextStep: () => {
      debugger;
      if (!resObj.canGoNextStep()) {
        return;
      }
      const { currentStepIndex, historyRecords } = dataStore;
      const newIndex = currentStepIndex + 1;
      dataStore.currentStepIndex = newIndex;
      const page = cloneDeep(historyRecords[newIndex]);
      return loadPage(page);
    },
    canGoPreStep: () => {
      const { currentStepIndex } = dataStore;
      if (currentStepIndex <= 0) {
        return false;
      }
      return true;
    },
    canGoNextStep: () => {
      const { currentStepIndex, historyRecords } = dataStore;
      if (currentStepIndex >= historyRecords.length - 1) {
        return false;
      }
      return true;
    },
  };

  return {
    name: PLUGIN_NAME,
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    async init(ctx) {
      ctx.pageModel.emitter.on('onNodeChange', () => {
        console.log('🚀 ~ file: index.tsx:96 ~ ctx.pageModel.emitter.on ~ onNodeChange:');
        resObj.addStep();
      });
      ctx.pageModel.emitter.on('onPageChange', () => {
        resObj.addStep();
      });
      ctx.pluginReadyOk();
    },
    async destroy(ctx) {
      console.log('destroy', ctx);
    },
    exports: () => {
      return resObj;
    },
    meta: {
      engine: {
        version: '1.0.0',
      },
    },
  };
};
