import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { TYPEDEFS, resetTypedefs, type TypeDef } from '@/mocks/typedefs';
import { RELATIONSHIPS, resetRelationships } from '@/mocks/relationships';
import { ValidationPage } from './ValidationPage';

const meta: Meta<typeof ValidationPage> = {
  title: 'Pages/ValidationPage (msw)',
  component: ValidationPage,
  parameters: { layout: 'fullscreen' },
};
export default meta;

type Story = StoryObj<typeof ValidationPage>;

/** 构造一个最小草稿元类（便于注入测试场景）。 */
const draft = (name: string, superTypes: string[]): TypeDef => ({
  name,
  displayName: name,
  category: 'ENTITY',
  superTypes,
  scope: 'TENANT',
  status: 'DRAFT',
  version: 1,
  description: '',
  attributeDefs: [],
  updatedAt: '2026-06-22T00:00:00.000Z',
});

/**
 * 一致性校验（E2E）：种子模型干净 → 校验通过。
 */
export const Default: Story = {
  play: async ({ canvasElement }) => {
    resetTypedefs();
    resetRelationships();
    const canvas = within(canvasElement);
    await expect(await waitFor(async () => canvas.findByText('校验通过'))).toBeInTheDocument();
  },
};

/**
 * 校验检出（E2E）：注入悬空父类 / 循环继承 / 关系端点缺失，重新校验后三类问题均检出。
 */
export const DetectsIssues: Story = {
  play: async ({ canvasElement }) => {
    resetTypedefs();
    resetRelationships();
    const canvas = within(canvasElement);

    // 基线干净。
    await expect(await waitFor(async () => canvas.findByText('校验通过'))).toBeInTheDocument();

    // 注入三类问题。
    TYPEDEFS.push(draft('BrokenChild', ['GhostParent'])); // 悬空父类
    TYPEDEFS.push(draft('CycleA', ['CycleB'])); // 互相继承 → 循环
    TYPEDEFS.push(draft('CycleB', ['CycleA']));
    RELATIONSHIPS.push({
      name: 'bad_rel',
      displayName: '坏关系',
      relationshipType: 'ASSOCIATION',
      cardinality: 'ONE_TO_ONE',
      end1: { typeName: 'GhostType', attributeName: 'x' }, // 端点元类不存在
      end2: { typeName: 'Table', attributeName: 'y' },
      scope: 'TENANT',
      status: 'DRAFT',
      version: 1,
      updatedAt: '2026-06-22T00:00:00.000Z',
    });

    await userEvent.click(canvas.getByRole('button', { name: /重新校验/ }));

    // 三类问题各自检出。
    await waitFor(async () => {
      await expect(await canvas.findByText('GhostParent')).toBeInTheDocument();
    });
    await expect(canvas.getByText('CycleA → CycleB → CycleA')).toBeInTheDocument();
    await expect(canvas.getByText('GhostType')).toBeInTheDocument();
  },
};
