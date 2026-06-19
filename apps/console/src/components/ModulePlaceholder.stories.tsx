import type { Meta, StoryObj } from '@storybook/react-vite';
import { ModulePlaceholder } from './ModulePlaceholder';

const meta: Meta<typeof ModulePlaceholder> = {
  title: 'Components/ModulePlaceholder',
  component: ModulePlaceholder,
};
export default meta;

type Story = StoryObj<typeof ModulePlaceholder>;

/** 叶子路由的标题占位页（WP2）：标题取自菜单 i18n key，正文为「建设中」空状态。 */
export const Default: Story = {
  args: { titleKey: 'menu.overview' },
};

/** 任取一个深层叶子，验证标题 i18n 解析正常。 */
export const DeepLeaf: Story = {
  args: { titleKey: 'menu.privacyPsi' },
};
