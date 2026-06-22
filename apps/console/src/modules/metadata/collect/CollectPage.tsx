import { useRef, useState } from 'react';
import { ProTable, type ActionType, type ProColumns } from '@ant-design/pro-components';
import { Alert, App, Card, Space, Tag, Typography } from 'antd';
import { useTranslation } from 'react-i18next';
import { http, type ApiError } from '@hashmatrix/sdk';
import type { ConnectorSource, ScanRun } from '@/mocks/collect';
import {
  RUN_STATUS_COLOR,
  RUN_STATUS_LABEL,
  SOURCE_STATUS_COLOR,
  SOURCE_STATUS_LABEL,
} from './collectMeta';
import { ScanRunDrawer } from './ScanRunDrawer';

interface SourcesResult {
  data: ConnectorSource[];
}
interface RunsResult {
  data: ScanRun[];
}

/**
 * 采集衔接（元数据管理模块 · 子模块）：数据源结构扫描 + 变更集比对 + 异动检测。
 * 对应 governance 元模型引擎（Epic #1 / 子 #14）；后端 post-M1，当前 mock 供数。
 * 边界：只取结构（旁路），不搬数据（搬数据是 data-foundation 主链路）。
 */
export function CollectPage() {
  const { t } = useTranslation();
  const { message } = App.useApp();
  const sourcesRef = useRef<ActionType>(null);
  const runsRef = useRef<ActionType>(null);
  const [selected, setSelected] = useState<ScanRun | null>(null);
  const [open, setOpen] = useState(false);

  const scan = async (row: ConnectorSource) => {
    try {
      await http.post(`/api/meta/collect/sources/${row.id}/scan`);
      message.success(t('collect.scanOk'));
      sourcesRef.current?.reload();
      runsRef.current?.reload();
    } catch (err) {
      message.error((err as ApiError).message || t('collect.scanFail'));
    }
  };

  const sourceColumns: ProColumns<ConnectorSource>[] = [
    { title: t('collect.colName'), dataIndex: 'name' },
    { title: t('collect.colType'), dataIndex: 'type', width: 100, render: (_, r) => <Tag>{r.type}</Tag> },
    {
      title: t('collect.colStatus'),
      dataIndex: 'status',
      width: 110,
      render: (_, r) => <Tag color={SOURCE_STATUS_COLOR[r.status]}>{t(SOURCE_STATUS_LABEL[r.status])}</Tag>,
    },
    {
      title: t('collect.colLastScan'),
      dataIndex: 'lastScanAt',
      width: 140,
      render: (_, r) => (r.lastScanAt ? r.lastScanAt.slice(0, 10) : t('collect.never')),
    },
    {
      title: t('collect.colActions'),
      width: 90,
      render: (_, r) =>
        r.status === 'CONNECTED' ? (
          <a key="scan" onClick={() => void scan(r)}>
            {t('collect.btnScan')}
          </a>
        ) : (
          <Typography.Text key="na" type="secondary">
            {t('collect.unavailable')}
          </Typography.Text>
        ),
    },
  ];

  const runColumns: ProColumns<ScanRun>[] = [
    { title: t('collect.colRunId'), dataIndex: 'id', width: 120 },
    { title: t('collect.colSource'), dataIndex: 'sourceName' },
    {
      title: t('collect.colStartedAt'),
      dataIndex: 'startedAt',
      width: 120,
      render: (_, r) => r.startedAt.slice(0, 10),
    },
    {
      title: t('collect.colStatus'),
      dataIndex: 'status',
      width: 100,
      render: (_, r) => <Tag color={RUN_STATUS_COLOR[r.status]}>{t(RUN_STATUS_LABEL[r.status])}</Tag>,
    },
    { title: t('collect.colAdded'), dataIndex: 'added', width: 80 },
    { title: t('collect.colRemoved'), dataIndex: 'removed', width: 80 },
    { title: t('collect.colChanged'), dataIndex: 'changed', width: 80 },
    {
      title: t('collect.colAnomalies'),
      dataIndex: 'anomalies',
      width: 90,
      render: (_, r) =>
        r.anomalies.length > 0 ? (
          <Tag color="red">{r.anomalies.length}</Tag>
        ) : (
          <Typography.Text type="secondary">0</Typography.Text>
        ),
    },
  ];

  return (
    <Space orientation="vertical" size="large" style={{ display: 'flex' }}>
      <Typography.Title level={3}>{t('menu.collect')}</Typography.Title>
      <Alert type="info" showIcon title={t('collect.mockBadge')} description={t('collect.pageDesc')} />

      <Card title={t('collect.sourcesTitle')} styles={{ body: { padding: 0 } }}>
        <ProTable<ConnectorSource>
          rowKey="id"
          actionRef={sourcesRef}
          columns={sourceColumns}
          search={false}
          options={false}
          pagination={false}
          toolBarRender={false}
          request={async () => {
            const res = await http.get<SourcesResult>('/api/meta/collect/sources');
            return { data: res.data.data, success: true };
          }}
        />
      </Card>

      <Card title={t('collect.runsTitle')} styles={{ body: { padding: 0 } }}>
        <ProTable<ScanRun>
          rowKey="id"
          actionRef={runsRef}
          columns={runColumns}
          search={false}
          options={{ reload: true }}
          pagination={false}
          toolBarRender={false}
          onRow={(row) => ({
            style: { cursor: 'pointer' },
            onClick: () => {
              setSelected(row);
              setOpen(true);
            },
          })}
          request={async () => {
            const res = await http.get<RunsResult>('/api/meta/collect/runs');
            return { data: res.data.data, success: true };
          }}
        />
      </Card>

      <ScanRunDrawer run={selected} open={open} onClose={() => setOpen(false)} />
    </Space>
  );
}
