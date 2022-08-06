"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
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
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var src_exports = {};
__export(src_exports, {
  a: () => a
});
module.exports = __toCommonJS(src_exports);

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
if (!CUSTOM_CONFIG.entry) {
  throw new Error("entry not find");
}
var vite_common_default = (0, import_vite.defineConfig)({
  build: {
    lib: {
      entry: import_path2.default.resolve(PROJECT_ROOT, CUSTOM_CONFIG.entry),
      formats: CUSTOM_CONFIG.formats || ["cjs", "es"],
      fileName: (format) => `${CUSTOM_CONFIG.libName}.${format}.js`
    },
    rollupOptions: {
      external: CUSTOM_CONFIG.external || [],
      output: {
        globals: CUSTOM_CONFIG.global || {}
      }
    }
  },
  plugins: [(0, import_plugin_react.default)()]
});

// src/config/vite.dev.ts
var config = (0, import_vite2.mergeConfig)(vite_common_default, {
  root: PROJECT_ROOT,
  mode: "development",
  configFile: false,
  server: {
    port: 3e3
  }
});
var vite_dev_default = (0, import_vite2.mergeConfig)(config, CUSTOM_CONFIG.vite || {});

// src/core/devServer.ts
var doDev = async () => {
  console.log("doDe1v");
  let server = await (0, import_vite4.createServer)(vite_dev_default);
  await server.listen();
  server.printUrls();
};

// src/core/doBuild.ts
var import_vite8 = require("vite");

// src/config/vite.build.ts
var import_vite6 = require("vite");
var _a;
var config2 = (0, import_vite6.mergeConfig)(vite_common_default, {
  root: PROJECT_ROOT,
  mode: "production",
  configFile: false,
  build: {
    watch: (_a = CLI_ARGS_OBJ.watch) != null ? _a : false
  }
});
var vite_build_default = (0, import_vite6.mergeConfig)(config2, CUSTOM_CONFIG.vite || {});

// src/core/doBuild.ts
var doBuild = async () => {
  console.log("start to build .....");
  await (0, import_vite8.build)(vite_build_default);
  console.log("build finished.");
};

// src/index.ts
if (CLI_ARGS_OBJ.build) {
  doBuild();
} else {
  doDev();
}
var a = () => {
  return 1;
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  a
});
//# sourceMappingURL=index.js.map
