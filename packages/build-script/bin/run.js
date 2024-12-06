#!/usr/bin/env node

async function start() {
  const bScript = await import('../lib/index.mjs');
  bScript.run();
}

start();
