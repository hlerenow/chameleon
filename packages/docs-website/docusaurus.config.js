/* eslint-disable no-undef */
// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion

const lightCodeTheme = require('prism-react-renderer/themes/github');
const darkCodeTheme = require('prism-react-renderer/themes/dracula');

const isProd = process.env.NODE_ENV === 'production';

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'Chameleon Engine',
  tagline: '让Web Page 制作变得更简单',
  favicon: 'img/favicon.ico',

  // Set the production url of your site here
  url: 'https://your-docusaurus-test-site.com',
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: isProd ? '/chameleon/documents' : '/documents/',

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: 'ByteCrazy', // Usually your GitHub org/user name.
  projectName: 'chameleon-docs', // Usually your repo name.

  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',

  // Even if you don't use internalization, you can use this field to set useful
  // metadata like html lang. For example, if your site is Chinese, you may want
  // to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'zh',
    locales: ['zh'],
    // locales: ['zh', 'en'],
  },
  plugins: [
    'docusaurus-plugin-sass',
    [
      '@docusaurus/plugin-content-docs',
      {
        id: 'schema',
        path: 'schemaDoc',
        routeBasePath: 'schema',
        sidebarPath: require.resolve('./sidebars.js'),
      },
    ],
    [
      '@docusaurus/plugin-content-docs',
      {
        id: 'plugin',
        path: 'pluginDoc',
        routeBasePath: 'plugin',
        sidebarPath: require.resolve('./sidebars.js'),
      },
    ],
    [
      '@docusaurus/plugin-content-docs',
      {
        id: 'api',
        path: 'apiDoc',
        routeBasePath: 'api',
        sidebarPath: require.resolve('./sidebars.js'),
      },
    ],
  ],
  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          id: 'default',
          sidebarPath: require.resolve('./sidebars.js'),
          editUrl:
            'https://github.com/facebook/docusaurus/tree/main/packages/create-docusaurus/templates/shared/',
          remarkPlugins: [
            [require('@docusaurus/remark-plugin-npm2yarn'), { sync: true }],
          ],
        },
        theme: {
          customCss: require.resolve('./src/css/custom.scss'),
        },
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      // Replace with your project's social card
      image: 'img/docusaurus-social-card.jpg',
      docs: {
        sidebar: {
          // hideable: true,
        },
      },
      navbar: {
        title: 'Chameleon Engine',
        logo: {
          alt: 'Chameleon Engine Logo',
          src: 'img/logo.svg',
        },
        items: [
          {
            type: 'docSidebar',
            sidebarId: 'tutorialSidebar',
            position: 'left',
            label: '文档',
          },
          {
            position: 'left',
            label: 'Schema',
            to: 'schema/page',
          },
          {
            position: 'left',
            label: '插件',
            to: 'plugin/plugin-develop',
          },
          {
            position: 'left',
            label: 'API',
            to: 'api/workbench',
          },
          {
            position: 'left',
            label: '在线演示',
            href: 'https://hlerenow.github.io/chameleon/',
          },
          {
            type: 'localeDropdown',
            position: 'right',
          },
          // { to: '/blog', label: 'Blog', position: 'left' },
          {
            href: 'https://github.com/hlerenow/chameleon',
            label: 'GitHub',
            position: 'right',
          },
        ],
      },
      footer: {
        style: 'light',
        links: [
          {
            title: '文档',
            items: [
              {
                label: '教程',
                to: '/docs/tutorial/quickStart',
              },
            ],
          },
          {
            title: '引擎示例',
            items: [
              {
                label: '游乐场',
                href: 'https://hlerenow.github.io/chameleon',
              },
            ],
          },
          {
            title: '更多',
            items: [
              {
                label: 'GitHub',
                href: 'https://github.com/hlerenow/chameleon',
              },
            ],
          },
        ],
        copyright: `Copyright © ${new Date().getFullYear()} chameleon engine, Inc. Built with Docusaurus.`,
      },
      prism: {
        theme: lightCodeTheme,
        darkTheme: darkCodeTheme,
      },
    }),
};

module.exports = config;
