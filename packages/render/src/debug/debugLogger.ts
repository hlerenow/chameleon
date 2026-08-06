import {
  CODE_MAP_MSG,
  CODE_MAP_MSG_GLOBAL_NAME,
  CodeMapMsg,
  DebugOption,
  RENDER_DEBUG_CODE,
  RENDER_DEBUG_PREFIX,
} from './codeMapMsg';

let debugEnabled = false;
let codeMapMsg: CodeMapMsg = CODE_MAP_MSG;
let codeMapMsgSource: DebugOption['codeMapMsg'];

type CodeMapMsgGlobal = {
  CODE_MAP_MSG?: CodeMapMsg;
  default?: CodeMapMsg;
};

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

  if (typeof document === 'undefined') {
    console.warn(`${RENDER_DEBUG_PREFIX} cannot load code map message without a document`, {
      source,
    });
    return;
  }

  const script = document.createElement('script');
  script.src = source;
  script.async = true;
  script.onload = () => {
    const globalCodeMapMsg = (globalThis as typeof globalThis & Record<string, CodeMapMsgGlobal | undefined>)[
      CODE_MAP_MSG_GLOBAL_NAME
    ];
    const nextCodeMapMsg = globalCodeMapMsg?.default || globalCodeMapMsg?.CODE_MAP_MSG;
    if (nextCodeMapMsg) {
      if (nextCodeMapMsg && codeMapMsgSource === source) {
        codeMapMsg = {
          ...CODE_MAP_MSG,
          ...nextCodeMapMsg,
        };
      }
      return;
    }

    console.warn(`${RENDER_DEBUG_PREFIX} code map message global not found`, {
      source,
      globalName: CODE_MAP_MSG_GLOBAL_NAME,
    });
  };
  script.onerror = (error) => {
    console.warn(`${RENDER_DEBUG_PREFIX} failed to load code map message`, {
      source,
      error,
    });
  };
  document.head.appendChild(script);
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
