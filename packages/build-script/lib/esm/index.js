#!/usr/bin/env node
var __require = /* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, {
  get: (a, b) => (typeof require !== "undefined" ? require : a)[b]
}) : x)(function(x) {
  if (typeof require !== "undefined")
    return require.apply(this, arguments);
  throw new Error('Dynamic require of "' + x + '" is not supported');
});

// src/config/base.ts
import path from "path";
import fs from "fs-extra";
import argv from "yargs-parser";
var cliArgs = argv(process.argv.slice(2));
var CLI_ARGS_OBJ = cliArgs;
var PROJECT_ROOT = path.resolve(process.cwd());
var customConfig = {};
var customConfigPath = `${PROJECT_ROOT}/build.config.js`;
if (fs.pathExistsSync(customConfigPath)) {
  customConfig = __require(customConfigPath);
}
var CUSTOM_CONFIG = customConfig;

// src/core/devServer.ts
import { createServer } from "vite";

// src/config/vite.dev.ts
import { mergeConfig } from "vite";

// src/config/vite.common.ts
import { defineConfig } from "vite";
import path2 from "path";
import react from "@vitejs/plugin-react";
import eslint from "vite-plugin-eslint";
var commonConfig = () => {
  if (!CUSTOM_CONFIG.entry) {
    throw new Error("entry not find");
  }
  return defineConfig({
    root: PROJECT_ROOT,
    build: {
      lib: {
        entry: path2.resolve(PROJECT_ROOT, CUSTOM_CONFIG.entry),
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
    plugins: [eslint(), react()]
  });
};

// src/config/vite.dev.ts
var devConfig = () => {
  const config = mergeConfig(commonConfig(), {
    mode: "development",
    configFile: false,
    server: {
      port: 3e3
    }
  });
  return mergeConfig(config, CUSTOM_CONFIG.vite || {});
};

// src/core/devServer.ts
var doDev = async () => {
  console.log("doDe1v");
  const server = await createServer(devConfig());
  await server.listen();
  server.printUrls();
};

// src/core/doBuild.ts
import { build } from "vite";

// src/config/vite.build.ts
import { mergeConfig as mergeConfig2 } from "vite";
var buildConfig = function() {
  var _a;
  const config = mergeConfig2(commonConfig(), {
    mode: "production",
    configFile: false,
    build: {
      watch: (_a = CLI_ARGS_OBJ.watch) != null ? _a : false
    }
  });
  return mergeConfig2(config, CUSTOM_CONFIG.vite || {});
};

// src/core/doBuild.ts
var doBuild = async () => {
  console.log("start to build .....");
  await build(buildConfig());
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
