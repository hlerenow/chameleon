import { defineEcConfig } from '@astrojs/starlight/expressive-code';

export default defineEcConfig({
  // The documentation site is intentionally dark-only. Keep syntax tokens aligned
  // with its fixed dark background instead of following OS color preferences.
  themes: ['starlight-dark'],
  useStarlightDarkModeSwitch: false,
  useStarlightUiThemeColors: true,
});
