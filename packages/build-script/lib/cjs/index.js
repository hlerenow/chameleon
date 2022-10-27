#!/usr/bin/env node
"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// src/config/base.ts
var import_path = __toESM(require("path"));
var import_fs_extra = __toESM(require("fs-extra"));
var import_yargs_parser = __toESM(require("yargs-parser"));
var cliArgs = (0, import_yargs_parser.default)(process.argv.slice(2));
var CLI_ARGS_OBJ = cliArgs;
var PROJECT_ROOT = import_path.default.resolve(process.cwd());
var customConfig = {};
var customConfigPath = `${PROJECT_ROOT}/build.config.js`;
if (import_fs_extra.default.pathExistsSync(customConfigPath)) {
  customConfig = require(customConfigPath);
}
var CUSTOM_CONFIG = customConfig;

// src/core/devServer.ts
var import_vite4 = require("vite");

// src/config/vite.dev.ts
var import_vite2 = require("vite");

// src/config/vite.common.ts
var import_vite = require("vite");
var import_path2 = __toESM(require("path"));
var import_plugin_react = __toESM(require("@vitejs/plugin-react"));
var import_vite_plugin_eslint = __toESM(require("vite-plugin-eslint"));
var import_vite_plugin_dts = __toESM(require("vite-plugin-dts"));
var commonConfig = () => {
  if (!CUSTOM_CONFIG.entry) {
    throw new Error("entry not find");
  }
  return (0, import_vite.defineConfig)({
    root: PROJECT_ROOT,
    build: {
      lib: {
        name: CUSTOM_CONFIG.libName,
        entry: import_path2.default.resolve(PROJECT_ROOT, CUSTOM_CONFIG.entry),
        formats: CUSTOM_CONFIG.formats || ["cjs", "es"],
        fileName: (format) => `${CUSTOM_CONFIG.fileName || CUSTOM_CONFIG.libName}.${format}.js`
      },
      rollupOptions: {
        external: CUSTOM_CONFIG.external || [],
        output: {
          globals: CUSTOM_CONFIG.global || {}
        }
      }
    },
    plugins: [
      (0, import_vite_plugin_eslint.default)(),
      (0, import_plugin_react.default)(),
      (0, import_vite_plugin_dts.default)({
        skipDiagnostics: false,
        logDiagnostics: true
      })
    ]
  });
};

// src/config/vite.dev.ts
var devConfig = () => {
  const config = (0, import_vite2.mergeConfig)(commonConfig(), {
    mode: "development",
    configFile: false,
    server: {
      port: 3e3
    }
  });
  return (0, import_vite2.mergeConfig)(config, CUSTOM_CONFIG.vite || {});
};

// src/core/devServer.ts
var doDev = async () => {
  const server = await (0, import_vite4.createServer)(devConfig());
  await server.listen();
  server.printUrls();
};

// src/core/doBuild.ts
var import_vite8 = require("vite");

// src/config/vite.build.ts
var import_vite6 = require("vite");
var buildConfig = function() {
  var _a;
  const config = (0, import_vite6.mergeConfig)(commonConfig(), {
    mode: "production",
    configFile: false,
    build: {
      watch: (_a = CLI_ARGS_OBJ.watch) != null ? _a : false
    }
  });
  return (0, import_vite6.mergeConfig)(config, CUSTOM_CONFIG.vite || {});
};

// src/core/doBuild.ts
var doBuild = async () => {
  console.log("start to build .....");
  await (0, import_vite8.build)(buildConfig());
  console.log("build finished.");
};

// src/index.ts
function run() {
  if (CLI_ARGS_OBJ.build) {
    doBuild();
  } else {
    doDev();
  }
}
run();
//# sourceMappingURL=index.js.map
