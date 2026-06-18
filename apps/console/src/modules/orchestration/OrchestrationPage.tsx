import { Card, Space, Tag, Typography } from 'antd';
import { useTranslation } from 'react-i18next';
import { DagGraph } from '@hashmatrix/ui';

/** DAG 编排页（DoD #5）：X6 编排画布，选中任务强调色随品牌，状态色固定。 */
export function OrchestrationPage() {
  const { t } = useTranslation();
  return (
    <Card title={t('menu.orchestration')} styles={{ body: { padding: 0 } }}>
      <Space style={{ padding: '12px 16px 0' }} wrap>
        <Typography.Text type="secondary">{t('orchestration.statusFixed')}</Typography.Text>
        <Tag color="#52c41a">success</Tag>
        <Tag color="#faad14">running</Tag>
        <Tag color="#ff4d4f">failed</Tag>
        <Typography.Text type="secondary">{t('orchestration.selectedNote')}</Typography.Text>
      </Space>
      <DagGraph height={360} />
    </Card>
  );
}
