import type { TestRunnerConfig } from '@storybook/test-runner';

/**
 * E2E（DoD #8）：@storybook/test-runner（Playwright）跑在 Storybook 之上。
 * 默认对每个 story 做渲染烟囱测试 + 执行其 play 交互断言；story 即夹具，免备后端环境。
 *
 * 本地：先 `pnpm storybook`，再另开 `pnpm test-storybook`。
 * CI：build-storybook → 静态服务 → test-storybook --url（见 .github/workflows/ci.yml）。
 */
const config: TestRunnerConfig = {
  // 等待画布/图表完成首屏渲染，降低重型 canvas story 的偶发抖动。
  async postVisit(page) {
    await page.waitForLoadState('networkidle');
  },
};

export default config;
