import { useState } from 'react';
import { ProTable, type ProColumns } from '@ant-design/pro-components';
import { Tag, Typography } from 'antd';
import { useTranslation } from 'react-i18next';
import { http } from '@hashmatrix/sdk';
import type { RelationshipDef } from '@/mocks/relationships';
import {
  CARDINALITY_SYMBOL,
  REL_TYPE_COLOR,
  REL_TYPE_LABEL,
  SCOPE_COLOR,
  SCOPE_LABEL,
  STATUS_COLOR,
  STATUS_LABEL,
} from './relationshipMeta';
import { RelationshipDetailDrawer } from './RelationshipDetailDrawer';

interface PagedResult {
  data: RelationshipDef[];
  total: number;
}

/**
 * 关系定义清单：ProTable + 服务端分页/检索（keyword + relationshipType）。
 * 行点击打开只读详情。数据经 axios → msw（story/E2E 自含）。
 */
export function RelationshipTable() {
  const { t } = useTranslation();
  const [selected, setSelected] = useState<RelationshipDef | null>(null);
  const [open, setOpen] = useState(false);

  const renderEnd = (end: RelationshipDef['end1']) => (
    <Typography.Text code>
      {end.typeName}.{end.attributeName}
    </Typography.Text>
  );

  const columns: ProColumns<RelationshipDef>[] = [
    {
      title: t('relationship.colName'),
      dataIndex: 'name',
      fieldProps: { placeholder: t('relationship.searchPlaceholder') },
      render: (_, row) => <Tag>{row.name}</Tag>,
    },
    { title: t('relationship.colDisplayName'), dataIndex: 'displayName', search: false },
    {
      title: t('relationship.colType'),
      dataIndex: 'relationshipType',
      width: 110,
      valueType: 'select',
      valueEnum: {
        CONTAINMENT: { text: t(REL_TYPE_LABEL.CONTAINMENT) },
        DEPENDENCY: { text: t(REL_TYPE_LABEL.DEPENDENCY) },
        ASSOCIATION: { text: t(REL_TYPE_LABEL.ASSOCIATION) },
      },
      render: (_, row) => (
        <Tag color={REL_TYPE_COLOR[row.relationshipType]}>{t(REL_TYPE_LABEL[row.relationshipType])}</Tag>
      ),
    },
    {
      title: t('relationship.colCardinality'),
      dataIndex: 'cardinality',
      search: false,
      width: 100,
      render: (_, row) => <Tag>{CARDINALITY_SYMBOL[row.cardinality]}</Tag>,
    },
    { title: t('relationship.colEnd1'), dataIndex: 'end1', search: false, render: (_, row) => renderEnd(row.end1) },
    { title: t('relationship.colEnd2'), dataIndex: 'end2', search: false, render: (_, row) => renderEnd(row.end2) },
    {
      title: t('relationship.colScope'),
      dataIndex: 'scope',
      search: false,
      width: 110,
      render: (_, row) => <Tag color={SCOPE_COLOR[row.scope]}>{t(SCOPE_LABEL[row.scope])}</Tag>,
    },
    {
      title: t('relationship.colStatus'),
      dataIndex: 'status',
      search: false,
      width: 100,
      render: (_, row) => <Tag color={STATUS_COLOR[row.status]}>{t(STATUS_LABEL[row.status])}</Tag>,
    },
  ];

  return (
    <>
      <ProTable<RelationshipDef>
        rowKey="name"
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
          const { current, pageSize, name, relationshipType } = params;
          const res = await http.get<PagedResult>('/api/meta/relationships', {
            params: { current, pageSize, keyword: name, relationshipType },
          });
          return { data: res.data.data, total: res.data.total, success: true };
        }}
      />
      <RelationshipDetailDrawer relationship={selected} open={open} onClose={() => setOpen(false)} />
    </>
  );
}
