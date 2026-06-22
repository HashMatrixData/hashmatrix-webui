import { useRef, useState } from 'react';
import { ProTable, type ActionType, type ProColumns } from '@ant-design/pro-components';
import { Button, Tag, Typography } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
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
import { TypeDefFormDrawer } from './TypeDefFormDrawer';

interface PagedResult {
  data: TypeDef[];
  total: number;
}

/**
 * 元类（TypeDef）清单：ProTable + 服务端分页/检索（keyword + category），
 * 行点击打开只读详情；工具栏新建 / 行内编辑（仅 TENANT，PLATFORM 共享只读 #10）。
 * 数据经 axios → msw（story/E2E 自含）。
 */
export function TypeDefTable() {
  const { t } = useTranslation();
  const actionRef = useRef<ActionType>(null);
  const [selected, setSelected] = useState<TypeDef | null>(null);
  const [open, setOpen] = useState(false);
  const [rows, setRows] = useState<TypeDef[]>([]);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<TypeDef | null>(null);

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };
  const openEdit = (row: TypeDef) => {
    setEditing(row);
    setFormOpen(true);
  };

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
    {
      title: t('metamodel.colActions'),
      valueType: 'option',
      width: 90,
      fixed: 'right',
      render: (_, row) =>
        row.scope === 'TENANT'
          ? [
              // 行点击会打开详情，编辑须阻断冒泡。
              <a
                key="edit"
                onClick={(e) => {
                  e.stopPropagation();
                  openEdit(row);
                }}
              >
                {t('metamodel.btnEdit')}
              </a>,
            ]
          : [
              <Typography.Text key="ro" type="secondary">
                {t('metamodel.readonly')}
              </Typography.Text>,
            ],
    },
  ];

  return (
    <>
      <ProTable<TypeDef>
        rowKey="name"
        actionRef={actionRef}
        columns={columns}
        cardBordered
        pagination={{ pageSize: 10, showSizeChanger: true }}
        search={{ labelWidth: 'auto' }}
        options={{ reload: true, density: true, setting: true }}
        toolBarRender={() => [
          <Button key="new" type="primary" icon={<PlusOutlined />} onClick={openCreate}>
            {t('metamodel.btnNew')}
          </Button>,
        ]}
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
          // 缓存当前页结果供表单做「编码唯一」即时提示与 superType 候选。
          // 注意：仅当前页、非权威——唯一性以后端 409 为准（接真实后端后改按编码 exists 查询）。
          setRows(res.data.data);
          return { data: res.data.data, total: res.data.total, success: true };
        }}
      />
      <TypeDefDetailDrawer typeDef={selected} open={open} onClose={() => setOpen(false)} />
      <TypeDefFormDrawer
        open={formOpen}
        editing={editing}
        existingNames={rows.map((r) => r.name)}
        superTypeOptions={rows.filter((r) => r.category === 'ENTITY').map((r) => r.name)}
        onOpenChange={setFormOpen}
        onSaved={() => actionRef.current?.reload()}
      />
    </>
  );
}
