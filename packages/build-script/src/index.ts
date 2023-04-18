#!/usr/bin/env node
import { CLI_ARGS_OBJ } from './config/base';
import { doDev } from './core/devServer';
import { doBuild } from './core/doBuild';

function run() {
  if (CLI_ARGS_OBJ.build) {
    doBuild();
  } else {
    doDev();
  }
}

run();

export * from './config/base';
export * from './config/vite.common';
export * from './config/vite.build';
export * from './config/vite.dev';
