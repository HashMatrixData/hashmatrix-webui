import type { TestRunnerConfig } from '@storybook/test-runner';

/** admin E2E：@storybook/test-runner（Playwright）跑在 admin Storybook 之上，story 即夹具，免备 control-plane。 */
const config: TestRunnerConfig = {
  async postVisit(page) {
    await page.waitForLoadState('networkidle');
  },
};

export default config;
