import type { Meta, StoryObj } from '@storybook/react-vite';
import { PlaygroundPage } from './PlaygroundPage';

const meta: Meta<typeof PlaygroundPage> = {
  title: 'Pages/Playground',
  component: PlaygroundPage,
};
export default meta;

type Story = StoryObj<typeof PlaygroundPage>;

/** 三开关 Demo 页（DoD #3）：语言/明暗/换肤实时联动。 */
export const Default: Story = {};
