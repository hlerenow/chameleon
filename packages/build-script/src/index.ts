import { CLI_ARGS_OBJ } from './config/base';
import { doDev } from './core/devServer';
import { doBuild } from './core/doBuild';

if (CLI_ARGS_OBJ.build) {
  doBuild();
} else {
  doDev();
}

export const a = () => {
  return 1;
};
