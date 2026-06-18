import type { StorybookConfig } from '@storybook/react-vite';

const config: StorybookConfig = {
  // admin 自身页面 story + 共享 packages（设计系统组件 story 与组件同级）。
  stories: ['../src/**/*.stories.@(ts|tsx)', '../../../packages/*/src/**/*.stories.@(ts|tsx)'],
  addons: [],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  staticDirs: ['../public'],
  core: { disableTelemetry: true },
};

export default config;
