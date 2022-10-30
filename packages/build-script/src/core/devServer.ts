import { createServer } from 'vite';

import { devConfig } from '../config/vite.dev';

export const doDev = async () => {
  const server = await createServer(devConfig());
  await server.listen();

  server.printUrls();
};
