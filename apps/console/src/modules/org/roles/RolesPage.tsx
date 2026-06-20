import { ProTable, type ProColumns } from '@ant-design/pro-components';
import { Space, Tag, Typography } from 'antd';
import { useTranslation } from 'react-i18next';
import { http } from '@hashmatrix/sdk';
import { useTableRequest } from '@hashmatrix/ui/data';
import type { OrgRole } from '@/mocks/orgRoles';

interface Paged<T> {
  data: T[];
  total: number;
}

/**
 * 组织角色与权限（#14 · canonical 叶子 `/settings/roles`）。
 * 租户自管理（D：「租户自管理 ≠ admin」）；按 admin 角色门控。ProTable 服务端分页，数据经 axios → msw。
 * 角色键即与 Keycloak realm/client 角色的映射键（演示占位）。
 */
export function RolesPage() {
  const { t } = useTranslation();

  const { request, errorNode } = useTableRequest<OrgRole>(
    (params) => http.get<Paged<OrgRole>>('/api/org/roles', { params }).then((r) => r.data),
    t('common.loadError'),
  );

  const columns: ProColumns<OrgRole>[] = [
    { title: t('orgRoles.colName'), dataIndex: 'name', render: (_, r) => <Tag>{r.name}</Tag> },
    { title: t('orgRoles.colDisplayName'), dataIndex: 'displayName' },
    {
      title: t('orgRoles.colType'),
      dataIndex: 'builtin',
      width: 100,
      render: (_, r) => (
        <Tag color={r.builtin ? 'gold' : 'default'}>
          {t(r.builtin ? 'orgRoles.typeBuiltin' : 'orgRoles.typeCustom')}
        </Tag>
      ),
    },
    { title: t('orgRoles.colMembers'), dataIndex: 'memberCount', width: 100, valueType: 'digit' },
    { title: t('orgRoles.colDesc'), dataIndex: 'description', ellipsis: true },
  ];

  return (
    <Space orientation="vertical" size="large" style={{ display: 'flex' }}>
      <Typography.Title level={3} style={{ marginTop: 0 }}>
        {t('menu.orgRoles')}
      </Typography.Title>
      <Typography.Paragraph type="secondary">{t('orgRoles.intro')}</Typography.Paragraph>
      {errorNode}
      <ProTable<OrgRole>
        rowKey="id"
        headerTitle={t('orgRoles.tableTitle')}
        columns={columns}
        cardBordered
        search={false}
        pagination={{ pageSize: 10 }}
        options={{ reload: true, density: true, setting: true }}
        request={request}
      />
    </Space>
  );
}
