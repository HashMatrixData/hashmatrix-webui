import { Descriptions, Drawer, Empty, List, Space, Table, Tag, Typography } from 'antd';
import type { TableColumnsType } from 'antd';
import { useTranslation } from 'react-i18next';
import type { Anomaly, ChangeItem, ChangeKind, ScanRun } from '@/mocks/collect';
import {
  ANOMALY_KIND_LABEL,
  CHANGE_KIND_COLOR,
  CHANGE_KIND_LABEL,
  RUN_STATUS_COLOR,
  RUN_STATUS_LABEL,
  SEVERITY_COLOR,
  SEVERITY_LABEL,
} from './collectMeta';

interface ScanRunDrawerProps {
  run: ScanRun | null;
  open: boolean;
  onClose: () => void;
}

/** 扫描运行详情（只读）：基础信息 + 变更集（比对）+ 异动清单。 */
export function ScanRunDrawer({ run, open, onClose }: ScanRunDrawerProps) {
  const { t } = useTranslation();

  const changeColumns: TableColumnsType<ChangeItem> = [
    {
      title: t('collect.changeKind'),
      dataIndex: 'kind',
      width: 90,
      render: (k: ChangeKind) => <Tag color={CHANGE_KIND_COLOR[k]}>{t(CHANGE_KIND_LABEL[k])}</Tag>,
    },
    {
      title: t('collect.changeAsset'),
      dataIndex: 'asset',
      render: (v: string) => <Typography.Text code>{v}</Typography.Text>,
    },
    { title: t('collect.changeDetail'), dataIndex: 'detail' },
  ];

  return (
    <Drawer
      width={640}
      open={open}
      onClose={onClose}
      title={run ? `${run.sourceName} · ${run.id}` : t('collect.runDetailTitle')}
      destroyOnHidden
    >
      {run ? (
        <Space orientation="vertical" size="large" style={{ display: 'flex' }}>
          <Descriptions column={1} bordered size="small">
            <Descriptions.Item label={t('collect.colSource')}>{run.sourceName}</Descriptions.Item>
            <Descriptions.Item label={t('collect.colStartedAt')}>
              {run.startedAt.slice(0, 10)}
            </Descriptions.Item>
            <Descriptions.Item label={t('collect.colStatus')}>
              <Tag color={RUN_STATUS_COLOR[run.status]}>{t(RUN_STATUS_LABEL[run.status])}</Tag>
            </Descriptions.Item>
          </Descriptions>

          <div>
            <Typography.Title level={5}>{t('collect.changesTitle')}</Typography.Title>
            <Table<ChangeItem>
              rowKey={(r) => `${r.kind}:${r.asset}`}
              size="small"
              columns={changeColumns}
              dataSource={run.changes}
              pagination={false}
            />
          </div>

          <div>
            <Typography.Title level={5}>{t('collect.anomaliesTitle')}</Typography.Title>
            {run.anomalies.length > 0 ? (
              <List<Anomaly>
                size="small"
                dataSource={run.anomalies}
                renderItem={(a) => (
                  <List.Item>
                    <Space wrap>
                      <Tag color={SEVERITY_COLOR[a.severity]}>{t(SEVERITY_LABEL[a.severity])}</Tag>
                      <Typography.Text strong>{t(ANOMALY_KIND_LABEL[a.kind])}</Typography.Text>
                      <Typography.Text code>{a.asset}</Typography.Text>
                      <Typography.Text type="secondary">{a.detail}</Typography.Text>
                    </Space>
                  </List.Item>
                )}
              />
            ) : (
              <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={t('collect.noAnomaly')} />
            )}
          </div>
        </Space>
      ) : (
        <Empty />
      )}
    </Drawer>
  );
}
