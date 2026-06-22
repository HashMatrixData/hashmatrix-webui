import { useState } from 'react';
import { ProTable, type ProColumns } from '@ant-design/pro-components';
import { Tag } from 'antd';
import { useTranslation } from 'react-i18next';
import { http } from '@hashmatrix/sdk';
import type { TypeDef } from '@/mocks/typedefs';
import {
  CATEGORY_COLOR,
  CATEGORY_LABEL,
  SCOPE_COLOR,
  SCOPE_LABEL,
  STATUS_COLOR,
  STATUS_LABEL,
} from './metamodelMeta';
import { TypeDefDetailDrawer } from './TypeDefDetailDrawer';

interface PagedResult {
  data: TypeDef[];
  total: number;
}

/**
 * 元类（TypeDef）清单：ProTable + 服务端分页/检索（keyword + category），
 * 点击行打开只读详情 Drawer。数据经 axios → msw（story/E2E 自含）。
 */
export function TypeDefTable() {
  const { t } = useTranslation();
  const [selected, setSelected] = useState<TypeDef | null>(null);
  const [open, setOpen] = useState(false);

  const columns: ProColumns<TypeDef>[] = [
    {
      title: t('metamodel.colName'),
      dataIndex: 'name',
      // 关键字检索（映射到后端 keyword，跨编码/名称匹配）。
      fieldProps: { placeholder: t('metamodel.searchPlaceholder') },
      render: (_, row) => <Tag>{row.name}</Tag>,
    },
    { title: t('metamodel.colDisplayName'), dataIndex: 'displayName', search: false },
    {
      title: t('metamodel.colCategory'),
      dataIndex: 'category',
      width: 110,
      valueType: 'select',
      valueEnum: {
        ENTITY: { text: t(CATEGORY_LABEL.ENTITY) },
        CLASSIFICATION: { text: t(CATEGORY_LABEL.CLASSIFICATION) },
        RELATIONSHIP: { text: t(CATEGORY_LABEL.RELATIONSHIP) },
      },
      render: (_, row) => (
        <Tag color={CATEGORY_COLOR[row.category]}>{t(CATEGORY_LABEL[row.category])}</Tag>
      ),
    },
    {
      title: t('metamodel.colSuperTypes'),
      dataIndex: 'superTypes',
      search: false,
      render: (_, row) =>
        row.superTypes.length > 0
          ? row.superTypes.map((s) => <Tag key={s}>{s}</Tag>)
          : t('metamodel.empty'),
    },
    {
      title: t('metamodel.colScope'),
      dataIndex: 'scope',
      search: false,
      width: 110,
      render: (_, row) => <Tag color={SCOPE_COLOR[row.scope]}>{t(SCOPE_LABEL[row.scope])}</Tag>,
    },
    {
      title: t('metamodel.colStatus'),
      dataIndex: 'status',
      search: false,
      width: 100,
      render: (_, row) => <Tag color={STATUS_COLOR[row.status]}>{t(STATUS_LABEL[row.status])}</Tag>,
    },
    {
      title: t('metamodel.colVersion'),
      dataIndex: 'version',
      search: false,
      width: 90,
      render: (_, row) => `v${row.version}`,
    },
    {
      title: t('metamodel.colAttrs'),
      dataIndex: 'attributeDefs',
      search: false,
      width: 90,
      render: (_, row) => row.attributeDefs.length,
    },
  ];

  return (
    <>
      <ProTable<TypeDef>
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
          const { current, pageSize, name, category } = params;
          const res = await http.get<PagedResult>('/api/meta/typedefs', {
            params: { current, pageSize, keyword: name, category },
          });
          return { data: res.data.data, total: res.data.total, success: true };
        }}
      />
      <TypeDefDetailDrawer typeDef={selected} open={open} onClose={() => setOpen(false)} />
    </>
  );
}
