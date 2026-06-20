import { ProTable, type ProColumns } from '@ant-design/pro-components';
import { Button, Tag } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { http, PermissionGuard, ROLES } from '@hashmatrix/sdk';
import { useTableRequest } from '@hashmatrix/ui/data';
import type { DatasetRow } from '@/mocks/datasets';

interface PagedResult {
  data: DatasetRow[];
  total: number;
}

/**
 * 元数据集列表（ProTable + 服务端分页，呼应大数据量表格策略）。
 * 数据经 axios → msw（story/E2E 自含），取数失败经 useTableRequest 降级为空表 + 内联错误 Alert。
 * 操作列受按钮级权限保护。
 */
export function DatasetTable() {
  const { t } = useTranslation();

  const { request, errorNode } = useTableRequest<DatasetRow>(
    (params) => http.get<PagedResult>('/api/datasets', { params }).then((r) => r.data),
    t('common.loadError'),
  );

  const columns: ProColumns<DatasetRow>[] = [
    { title: t('dataset.colId'), dataIndex: 'id', search: false, width: 120 },
    { title: t('dataset.colName'), dataIndex: 'name' },
    {
      title: t('dataset.colLayer'),
      dataIndex: 'layer',
      search: false,
      width: 100,
      render: (_, row) => <Tag>{row.layer}</Tag>,
    },
    { title: t('dataset.colOwner'), dataIndex: 'owner', search: false, width: 140 },
    { title: t('dataset.colRows'), dataIndex: 'rowCount', search: false, width: 120, valueType: 'digit' },
    {
      title: t('dataset.colQuality'),
      dataIndex: 'qualityScore',
      search: false,
      width: 100,
      valueType: 'percent',
    },
  ];

  return (
    <>
      {errorNode}
      <ProTable<DatasetRow>
        rowKey="id"
        columns={columns}
        cardBordered
        pagination={{ pageSize: 10, showSizeChanger: true }}
        search={{ labelWidth: 'auto' }}
        options={{ reload: true, density: true, setting: true }}
        toolBarRender={() => [
          <PermissionGuard key="sync" roles={[ROLES.ADMIN]}>
            <Button type="primary" icon={<ReloadOutlined />}>
              {t('dataset.syncAdmin')}
            </Button>
          </PermissionGuard>,
        ]}
        request={request}
      />
    </>
  );
}
