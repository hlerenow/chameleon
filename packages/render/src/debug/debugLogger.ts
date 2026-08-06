import { CODE_MAP_MSG, CodeMapMsg, DebugOption, RENDER_DEBUG_CODE, RENDER_DEBUG_PREFIX } from './codeMapMsg';

let debugEnabled = false;
let codeMapMsg: CodeMapMsg = CODE_MAP_MSG;
let codeMapMsgSource: DebugOption['codeMapMsg'];

const formatDebugMessage = (message: string, variables?: Record<string, unknown>) => {
  if (!variables) {
    return message;
  }

  return message.replace(/\{(\w+)\}/g, (placeholder, key) => {
    return key in variables ? String(variables[key]) : placeholder;
  });
};

export const setDebugOption = (debugOption?: DebugOption) => {
  debugEnabled = debugOption?.enabled === true;
  const source = debugOption?.codeMapMsg;
  if (!source || source === codeMapMsgSource) {
    return;
  }

  codeMapMsgSource = source;
  if (typeof source !== 'string') {
    codeMapMsg = {
      ...CODE_MAP_MSG,
      ...source,
    };
    return;
  }

  import(/* @vite-ignore */ source)
    .then((module) => {
      const nextCodeMapMsg = module.default || module.CODE_MAP_MSG;
      if (nextCodeMapMsg && codeMapMsgSource === source) {
        codeMapMsg = {
          ...CODE_MAP_MSG,
          ...nextCodeMapMsg,
        };
      }
    })
    .catch((error) => {
      console.warn(`${RENDER_DEBUG_PREFIX} failed to load code map message`, {
        source,
        error,
      });
    });
};

export const debugLog = (code: string, variables?: Record<string, unknown>) => {
  if (!debugEnabled) {
    return;
  }

  const message = formatDebugMessage(codeMapMsg[code] || code, variables);
  if (variables === undefined) {
    console.log(`${RENDER_DEBUG_PREFIX}[${code}] ${message}`);
    return;
  }
  console.log(`${RENDER_DEBUG_PREFIX}[${code}] ${message}`, variables);
};

export { RENDER_DEBUG_CODE };
