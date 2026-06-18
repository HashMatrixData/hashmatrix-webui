import type { StorybookConfig } from '@storybook/react-vite';

const config: StorybookConfig = {
  // console 自身页面 story + 共享 packages（设计系统组件 story 与组件同级）。
  stories: ['../src/**/*.stories.@(ts|tsx)', '../../../packages/*/src/**/*.stories.@(ts|tsx)'],
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
