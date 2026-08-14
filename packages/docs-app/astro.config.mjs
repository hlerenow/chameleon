import { defineConfig, passthroughImageService } from 'astro/config';
import starlight from '@astrojs/starlight';
import react from '@astrojs/react';
import astroMermaid from 'astro-mermaid';

// https://astro.build/config
export default defineConfig({
  base: '/chameleon/documents',
  integrations: [
    starlight({
      title: 'Chameleon',
      customCss: ['./src/styles/fonts.css'],
      locales: {
        root: { label: '中文', lang: 'zh-CN' },
        en: { label: 'English', lang: 'en' },
      },
      defaultLocale: 'root',
      social: {
        github: 'https://github.com/hlerenow/chameleon',
      },
      components: {
        Header: './src/components/DocsHeader.astro',
        Footer: './src/components/DocsFooter.astro',
      },
      pagination: false,
      sidebar: [
        {
          label: '首页 / 文档总览',
          link: '/',
        },
        {
          label: '常用入口',
          items: [
            { label: '快速开始', link: '/guides/' },
            { label: '编辑器基础操作', link: '/guides/editor-basics/' },
            { label: '调试指南', link: '/guides/debugging/' },
            { label: '预览与渲染', link: '/guides/preview-rendering/' },
          ],
        },
        {
          label: 'Engine 核心',
          items: [
            { label: 'Engine 介绍', link: '/reference/engine/introduction/' },
            { label: 'Engine 架构', link: '/reference/engine/architecture/' },
            { label: 'Engine API', link: '/reference/engine/api/' },
            { label: '快捷键', link: '/reference/engine/hotkeys/' },
          ],
        },
        {
          label: 'Guides / 使用指南',
          autogenerate: {
            directory: 'guides',
          },
        },
        {
          label: 'Reference / API 参考',
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
