/* eslint-disable no-undef */
import { defineConfig, passthroughImageService } from 'astro/config';
import starlight from '@astrojs/starlight';
import react from '@astrojs/react';
import astroMermaid from 'astro-mermaid';

const isProd = process.env.NODE_ENV === 'production';

// https://astro.build/config
export default defineConfig({
  base: isProd ? '/chameleon/documents' : '/documents',
  integrations: [
    starlight({
      title: 'Chameleon Docs',
      social: {
        github: 'https://github.com/hlerenow/chameleon',
      },
      sidebar: [
        {
          label: 'Guides',
          autogenerate: {
            directory: 'guides',
          },
        },
        {
          label: 'Reference',
          autogenerate: {
            directory: 'reference',
          },
        },
      ],
    }),
    react(),
    astroMermaid({
      theme: 'default',
    }),
  ],
  image: {
    service: passthroughImageService(),
  },
});
