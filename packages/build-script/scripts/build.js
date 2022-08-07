const _ = require('lodash');
const esbuild = require('esbuild');
const concurrently = require('concurrently');
const argv = require('yargs-parser')(process.argv.slice(2));
const packageJson = require('../package.json');

if (!argv.format) {
  buildAll(process.argv.slice(2).join(' '));
} else {
  buildFormat(argv.format, argv.out || 'dist');
}

function buildAll(options) {
  concurrently(
    [
      { name: 'build:cjs', command: `node scripts/build --format=cjs --out=lib ${options}` },
      { name: 'build:esm', command: `node scripts/build --format=esm --out=lib ${options}` },
    ],
    {
      prefix: 'name',
      killOthers: ['failure'],
      restartTries: 0,
    }
  ).result.then(
    () => {
      console.log('all done.');
    },
    () => {
      process.exit(1);
    }
  );
}

async function buildFormat(format, outDir) {
  try {
    console.log('building %s...', format);
    let config = {
      entryPoints: ['src/index.ts'],
      outfile: `${outDir}/${format}/index.js`,
      bundle: true,
      platform: 'node',
      target: ['node10'],
      format,
      sourcemap: true,
      sourcesContent: true,
      define: {},
      treeShaking: true,
      external: _.keys(packageJson.dependencies),
      minify: false,
      legalComments: 'external',
    };

    if (argv.watch) {
      config.watch = {
        onRebuild(error, result) {
          if (error) console.error('watch build failed:', error);
          else console.log('watch build succeeded:', result);
        },
      };
    }
    const startTime = Date.now();
    const result = await esbuild.build(config);
    if (result.errors.length > 0) {
      throw result.errors;
    }

    if (result.warnings.length > 0) {
      result.warnings.forEach((warnings) => {
        console.warn(warnings);
      });
    }

    console.log('built %s in %ds', format, ((Date.now() - startTime) / 1000).toFixed(2));
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}
