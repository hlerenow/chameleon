import { createServer } from 'vite';

import { devConfig } from '../config/vite.dev';

export const doDev = async () => {
  console.log('doDe1v');
  const server = await createServer(devConfig());

  await server.listen();

  server.printUrls();
};
