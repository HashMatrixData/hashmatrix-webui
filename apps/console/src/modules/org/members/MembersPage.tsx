import type { ParseKeys } from 'i18next';
import { ProTable, type ProColumns } from '@ant-design/pro-components';
import { Badge, Button, Space, Tag, Typography } from 'antd';
import { UserAddOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { http, PermissionGuard, ROLES } from '@hashmatrix/sdk';
import { useTableRequest } from '@hashmatrix/ui/data';
import type { OrgMember } from '@/mocks/orgMembers';

interface Paged<T> {
  data: T[];
  total: number;
}

/** 成员状态 → Badge 状态色（固定语义色，不随品牌换肤）+ i18n key。 */
const STATUS_BADGE: Record<
  OrgMember['status'],
  { status: 'success' | 'processing' | 'default'; labelKey: ParseKeys }
> = {
  active: { status: 'success', labelKey: 'orgMembers.statusActive' },
  invited: { status: 'processing', labelKey: 'orgMembers.statusInvited' },
  disabled: { status: 'default', labelKey: 'orgMembers.statusDisabled' },
};

/**
 * 组织成员管理（#14 · canonical 叶子 `/settings/users`）。
 * 属**使用平面租户自管理**（D：「租户自管理 ≠ admin」——代码留 console，不混跨租户运营 apps/admin）。
 * ProTable 服务端分页，数据经 axios → msw（`/api/org/members`）自含；新增动作受 admin 按钮级权限保护。
 * 菜单 / 路由按 admin 角色门控（见 navConfig `filterNavByRole` 与 router 的 `RequireRole` 兜底）。
 */
export function MembersPage() {
  const { t } = useTranslation();

  const { request, errorNode } = useTableRequest<OrgMember>(
    (params) => http.get<Paged<OrgMember>>('/api/org/members', { params }).then((r) => r.data),
    t('common.loadError'),
  );

  const columns: ProColumns<OrgMember>[] = [
    { title: t('orgMembers.colName'), dataIndex: 'name' },
    { title: t('orgMembers.colEmail'), dataIndex: 'email', search: false },
    {
      title: t('orgMembers.colRoles'),
      dataIndex: 'roles',
      search: false,
      render: (_, r) => (
        <Space size={[0, 4]} wrap>
          {r.roles.map((role) => (
            <Tag key={role}>{role}</Tag>
          ))}
        </Space>
      ),
    },
    {
      title: t('orgMembers.colGroups'),
      dataIndex: 'groups',
      search: false,
      render: (_, r) => (
        <Space size={[0, 4]} wrap>
          {r.groups.map((g) => (
            <Tag key={g} color="blue">
              {g}
            </Tag>
          ))}
        </Space>
      ),
    },
    {
      title: t('orgMembers.colStatus'),
      dataIndex: 'status',
      search: false,
      width: 110,
      render: (_, r) => <Badge status={STATUS_BADGE[r.status].status} text={t(STATUS_BADGE[r.status].labelKey)} />,
    },
    { title: t('orgMembers.colJoinedAt'), dataIndex: 'joinedAt', search: false, width: 130 },
  ];

  return (
    <Space orientation="vertical" size="large" style={{ display: 'flex' }}>
      <Typography.Title level={3} style={{ marginTop: 0 }}>
        {t('menu.orgMembers')}
      </Typography.Title>
      <Typography.Paragraph type="secondary">{t('orgMembers.intro')}</Typography.Paragraph>
      {errorNode}
      <ProTable<OrgMember>
        rowKey="id"
        headerTitle={t('orgMembers.tableTitle')}
        columns={columns}
        cardBordered
        pagination={{ pageSize: 10 }}
        search={{ labelWidth: 'auto' }}
        options={{ reload: true, density: true, setting: true }}
        toolBarRender={() => [
          <PermissionGuard key="invite" roles={[ROLES.ADMIN]}>
            <Button type="primary" icon={<UserAddOutlined />}>
              {t('orgMembers.inviteAdmin')}
            </Button>
          </PermissionGuard>,
        ]}
        request={request}
      />
    </Space>
  );
}
