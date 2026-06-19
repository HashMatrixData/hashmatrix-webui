import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, waitFor, within } from 'storybook/test';
import { PrivacyPage } from './PrivacyPage';

const meta: Meta<typeof PrivacyPage> = {
  title: 'Pages/Privacy (隐私计算)',
  component: PrivacyPage,
  parameters: { layout: 'fullscreen' },
};
export default meta;

type Story = StoryObj<typeof PrivacyPage>;

/** 品牌化外框占位：断言引擎外框标签渲染（证明品牌化外框已挂载 · 真实 iframe 后置）。 */
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await waitFor(async () => {
      await expect(await canvas.findByText('SecretFlow / SecretPad')).toBeInTheDocument();
    });
  },
};
