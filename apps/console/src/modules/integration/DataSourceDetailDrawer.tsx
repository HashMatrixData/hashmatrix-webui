import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Alert, Drawer, Empty, Spin, Table, Tree, Typography, type TableColumnsType } from 'antd';
import { useTranslation } from 'react-i18next';
import {
  listDataSourceTables,
  previewDataSourceTable,
  type DataSourceRow,
} from '@/api/dataSources';

export interface DataSourceDetailDrawerProps {
  open: boolean;
  /** 当前查看的数据源（null 时不取数）。 */
  dataSource: Pick<DataSourceRow, 'id' | 'name' | 'db'> | null;
  onClose: () => void;
}

type PreviewRow = Record<string, unknown>;

/**
 * 数据源「浏览流」详情抽屉（#29 · M2 链① 锚点下半）。
 * 打开 → `GET /{id}/tables` 列库表（左侧树）→ 选表 `POST /{id}/preview` 预览前 N 行（右侧表）。
 * 取数走 TanStack Query（与 TenantSwitcher 同范式；console 已装配 QueryClientProvider）——选择态以 query
 * `enabled` 驱动，无手写副作用。msw-first：顶契约 #55 锁定路径。D9：租户头由 sdk 拦截器自动附。
 * 选择态随**不同**数据源复位由调用方 `key={id}` 触发 remount（见 IntegrationPage）；同一数据源重开则
 * 保留上次选中表（浏览便利，刻意为之）。固定语义、不读品牌运行期变量（D3）。
 */
export function DataSourceDetailDrawer({ open, dataSource, onClose }: DataSourceDetailDrawerProps) {
  const { t } = useTranslation();
  const [selected, setSelected] = useState<string | null>(null);
  const id = dataSource?.id ?? null;
  const dbLabel = dataSource?.db ?? '';

  const tablesQuery = useQuery({
    queryKey: ['datasource', id, 'tables'],
    queryFn: () => listDataSourceTables(id as string),
    enabled: open && !!id,
  });

  const previewQuery = useQuery({
    queryKey: ['datasource', id, 'preview', selected],
    queryFn: () => previewDataSourceTable(id as string, selected as string),
    enabled: open && !!id && !!selected,
  });

  const tables = tablesQuery.data ?? [];
  const treeData = [
    {
      key: dbLabel || 'db',
      title: dbLabel || t('integration.treeTitle'),
      selectable: false,
      children: tables.map((tb) => ({ key: tb.name, title: tb.name, isLeaf: true })),
    },
  ];

  const previewColumns: TableColumnsType<PreviewRow> = (previewQuery.data?.columns ?? []).map((c) => ({
    title: c,
    dataIndex: c,
    key: c,
  }));

  return (
    <Drawer
      title={`${t('integration.detailTitle')}${dataSource ? ` · ${dataSource.name}` : ''}`}
      open={open}
      onClose={onClose}
      width={880}
      destroyOnHidden
    >
      <div style={{ display: 'flex', gap: 16 }}>
        <div style={{ width: 240, flexShrink: 0 }}>
          <Typography.Text strong>{t('integration.treeTitle')}</Typography.Text>
          {tablesQuery.isError ? (
            <Alert
              type="error"
              showIcon
              role="alert"
              message={t('integration.tablesError')}
              style={{ marginTop: 8 }}
            />
          ) : tablesQuery.isLoading ? (
            <div style={{ padding: 24, textAlign: 'center' }}>
              <Spin />
            </div>
          ) : tables.length === 0 ? (
            <Empty description={t('integration.emptyTables')} />
          ) : (
            <Tree
              treeData={treeData}
              defaultExpandAll
              selectedKeys={selected ? [selected] : []}
              onSelect={(keys) => {
                const key = keys[0];
                if (typeof key === 'string' && key !== dbLabel) setSelected(key);
              }}
            />
          )}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <Typography.Text strong>{t('integration.previewTitle')}</Typography.Text>
          {previewQuery.isError ? (
            <Alert
              type="error"
              showIcon
              role="alert"
              message={t('integration.previewError')}
              style={{ marginTop: 8 }}
            />
          ) : !selected ? (
            <Empty description={t('integration.selectTableHint')} />
          ) : (
            <Table<PreviewRow>
              rowKey={(_, index) => String(index)}
              size="small"
              loading={previewQuery.isLoading}
              columns={previewColumns}
              dataSource={previewQuery.data?.rows ?? []}
              pagination={false}
              scroll={{ x: true }}
              style={{ marginTop: 8 }}
            />
          )}
        </div>
      </div>
    </Drawer>
  );
}
