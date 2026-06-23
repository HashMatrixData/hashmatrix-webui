import { useRef, useState } from 'react';
import { ProTable, type ActionType, type ProColumns } from '@ant-design/pro-components';
import { App, Tag, Typography } from 'antd';
import { useTranslation } from 'react-i18next';
import { http, type ApiError } from '@hashmatrix/sdk';
import type { MetadataInstance } from '@/mocks/instances';
import {
  INSTANCE_STATUS_COLOR,
  INSTANCE_STATUS_LABEL,
  SCOPE_COLOR,
  SCOPE_LABEL,
} from './instanceMeta';
import { InstanceDetailDrawer } from './InstanceDetailDrawer';

interface PagedResult {
  data: MetadataInstance[];
  total: number;
}

/**
 * 元数据实例清单：ProTable + 服务端分页/检索（keyword + typeName）。
 * 行点击查看详情（属性 + 历史）；未认领实例可认领。数据经 axios → msw。
 */
export function InstanceTable() {
  const { t } = useTranslation();
  const { message } = App.useApp();
  const actionRef = useRef<ActionType>(null);
  const [selected, setSelected] = useState<MetadataInstance | null>(null);
  const [open, setOpen] = useState(false);

  const claim = async (row: MetadataInstance) => {
    try {
      await http.post(`/api/meta/instances/${row.guid}/claim`);
      message.success(t('instance.claimOk'));
      actionRef.current?.reload();
    } catch (err) {
      message.error((err as ApiError).message || t('instance.claimFail'));
    }
  };

  const columns: ProColumns<MetadataInstance>[] = [
    {
      title: t('instance.colQualifiedName'),
      dataIndex: 'qualifiedName',
      fieldProps: { placeholder: t('instance.searchPlaceholder') },
      render: (_, row) => <Typography.Text code>{row.qualifiedName}</Typography.Text>,
    },
    { title: t('instance.colDisplayName'), dataIndex: 'displayName', search: false },
    {
      title: t('instance.colType'),
      dataIndex: 'typeName',
      width: 110,
      valueType: 'select',
      valueEnum: {
        Table: { text: 'Table' },
        Column: { text: 'Column' },
      },
      render: (_, row) => <Tag>{row.typeName}</Tag>,
    },
    { title: t('instance.colOwner'), dataIndex: 'owner', search: false, width: 130 },
    {
      title: t('instance.colStatus'),
      dataIndex: 'status',
      search: false,
      width: 100,
      render: (_, row) => (
        <Tag color={INSTANCE_STATUS_COLOR[row.status]}>{t(INSTANCE_STATUS_LABEL[row.status])}</Tag>
      ),
    },
    {
      title: t('instance.colScope'),
      dataIndex: 'scope',
      search: false,
      width: 110,
      render: (_, row) => <Tag color={SCOPE_COLOR[row.scope]}>{t(SCOPE_LABEL[row.scope])}</Tag>,
    },
    {
      title: t('instance.colClaim'),
      dataIndex: 'claimedBy',
      search: false,
      width: 130,
      render: (_, row) =>
        row.claimedBy ? (
          <Typography.Text>{row.claimedBy}</Typography.Text>
        ) : (
          <Typography.Text type="secondary">{t('instance.unclaimed')}</Typography.Text>
        ),
    },
    {
      title: t('instance.colActions'),
      valueType: 'option',
      width: 90,
      fixed: 'right',
      render: (_, row) =>
        row.claimedBy
          ? [
              <Typography.Text key="claimed" type="secondary">
                {t('instance.claimed')}
              </Typography.Text>,
            ]
          : [
              <a
                key="claim"
                onClick={(e) => {
                  e.stopPropagation();
                  void claim(row);
                }}
              >
                {t('instance.btnClaim')}
              </a>,
            ],
    },
  ];

  return (
    <>
      <ProTable<MetadataInstance>
        rowKey="guid"
        actionRef={actionRef}
        columns={columns}
        cardBordered
        pagination={{ pageSize: 10, showSizeChanger: true }}
        search={{ labelWidth: 'auto' }}
        options={{ reload: true, density: true, setting: true }}
        onRow={(row) => ({
          style: { cursor: 'pointer' },
          onClick: () => {
            setSelected(row);
            setOpen(true);
          },
        })}
        request={async (params) => {
          const { current, pageSize, qualifiedName, typeName } = params;
          const res = await http.get<PagedResult>('/api/meta/instances', {
            params: { current, pageSize, keyword: qualifiedName, typeName },
          });
          return { data: res.data.data, total: res.data.total, success: true };
        }}
      />
      <InstanceDetailDrawer instance={selected} open={open} onClose={() => setOpen(false)} />
    </>
  );
}
