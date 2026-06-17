import type { StorybookConfig } from '@storybook/react-vite';

const config: StorybookConfig = {
  stories: ['../src/**/*.stories.@(ts|tsx)'],
  addons: [],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  // 自托管 msw worker + 运行期 config.js + 品牌资源（信创：不依赖公网 CDN）。
  staticDirs: ['../public'],
  core: { disableTelemetry: true },
};

export default config;
