import { ProTable, type ProColumns } from '@ant-design/pro-components';
import { Space, Tag, Typography } from 'antd';
import { useTranslation } from 'react-i18next';
import { http } from '@hashmatrix/sdk';
import type { OrgGroup } from '@/mocks/orgGroups';

interface Paged<T> {
  data: T[];
  total: number;
}

/**
 * 组织用户组（#14 · canonical 叶子 `/settings/user-groups`）。
 * 租户自管理（D：「租户自管理 ≠ admin」）；按 admin 角色门控。ProTable 服务端分页，数据经 axios → msw。
 * 用户组用于批量授权 / 成员归组，组绑定角色由成员继承（演示占位）。
 */
export function GroupsPage() {
  const { t } = useTranslation();

  const columns: ProColumns<OrgGroup>[] = [
    { title: t('orgGroups.colName'), dataIndex: 'name', render: (_, r) => <Tag color="blue">{r.name}</Tag> },
    { title: t('orgGroups.colMembers'), dataIndex: 'memberCount', width: 100, valueType: 'digit' },
    {
      title: t('orgGroups.colRoles'),
      dataIndex: 'roles',
      render: (_, r) => (
        <Space size={[0, 4]} wrap>
          {r.roles.map((role) => (
            <Tag key={role}>{role}</Tag>
          ))}
        </Space>
      ),
    },
    { title: t('orgGroups.colDesc'), dataIndex: 'description', ellipsis: true },
  ];

  return (
    <Space orientation="vertical" size="large" style={{ display: 'flex' }}>
      <Typography.Title level={3} style={{ marginTop: 0 }}>
        {t('menu.orgGroups')}
      </Typography.Title>
      <Typography.Paragraph type="secondary">{t('orgGroups.intro')}</Typography.Paragraph>
      <ProTable<OrgGroup>
        rowKey="id"
        headerTitle={t('orgGroups.tableTitle')}
        columns={columns}
        cardBordered
        search={false}
        pagination={{ pageSize: 10 }}
        options={{ reload: true, density: true, setting: true }}
        request={async (params) => {
          const res = await http.get<Paged<OrgGroup>>('/api/org/groups', {
            params: { current: params.current, pageSize: params.pageSize },
          });
          return { data: res.data.data, total: res.data.total, success: true };
        }}
      />
    </Space>
  );
}
