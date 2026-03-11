const FIGMA_TOKEN = process.env.FIGMA_TOKEN || '';

/** @type { import('@storybook/react-vite').StorybookConfig } */
const config = {
  "stories": [
    "../stories/**/*.mdx",
    "../stories/**/*.stories.@(js|jsx|mjs|ts|tsx)"
  ],
  "addons": [
    "@chromatic-com/storybook",
    "@storybook/addon-vitest",
    "@storybook/addon-a11y",
    "@storybook/addon-docs",
    "@storybook/addon-onboarding"
  ],
  "framework": "@storybook/react-vite",
  viteFinal: async (config, { configType }) => {
    if (configType === 'DEVELOPMENT') {
      config.server = config.server || {};
      config.server.proxy = {
        '/figma-api': {
          target: 'https://api.figma.com',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/figma-api/, ''),
          headers: { 'X-Figma-Token': FIGMA_TOKEN },
        },
      };
    }
    return config;
  },
};
export default config;
