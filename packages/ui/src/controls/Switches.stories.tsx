import type { Meta, StoryObj } from '@storybook/react-vite';
import { Space } from 'antd';
import { LanguageSwitch } from './LanguageSwitch';
import { ThemeSwitch } from './ThemeSwitch';
import { BrandSwitch } from './BrandSwitch';

const meta: Meta = {
  title: 'Controls/Switches',
};
export default meta;

type Story = StoryObj;

/** 语言 / 明暗 / 换肤 三开关。可配合工具栏全局 theme/locale 观察联动。 */
export const AllSwitches: Story = {
  render: () => (
    <Space size="large" wrap>
      <LanguageSwitch />
      <ThemeSwitch />
      <BrandSwitch />
    </Space>
  ),
};
