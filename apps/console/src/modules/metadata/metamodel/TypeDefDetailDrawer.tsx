import { Descriptions, Drawer, Empty, Space, Table, Tag, Typography } from 'antd';
import type { TableColumnsType } from 'antd';
import { useTranslation } from 'react-i18next';
import type { AttributeDef, TypeDef } from '@/mocks/typedefs';
import {
  CATEGORY_COLOR,
  CATEGORY_LABEL,
  SCOPE_COLOR,
  SCOPE_LABEL,
  STATUS_COLOR,
  STATUS_LABEL,
} from './metamodelMeta';

interface TypeDefDetailDrawerProps {
  typeDef: TypeDef | null;
  open: boolean;
  onClose: () => void;
}

/**
 * 元类详情（只读）：基础信息 Descriptions + 属性定义表（含基数/必填/唯一）。
 * 编辑/发布属后续增量（Epic #5/#8），本视图仅呈现。
 */
export function TypeDefDetailDrawer({ typeDef, open, onClose }: TypeDefDetailDrawerProps) {
  const { t } = useTranslation();

  const attrColumns: TableColumnsType<AttributeDef> = [
    { title: t('metamodel.attrName'), dataIndex: 'name', key: 'name' },
    {
      title: t('metamodel.attrType'),
      dataIndex: 'type',
      key: 'type',
      render: (type: AttributeDef['type']) => <Tag>{type}</Tag>,
    },
    {
      title: t('metamodel.attrRequired'),
      dataIndex: 'required',
      key: 'required',
      width: 80,
      render: (v: boolean) => (v ? t('metamodel.yes') : t('metamodel.no')),
    },
    {
      title: t('metamodel.attrUnique'),
      dataIndex: 'unique',
      key: 'unique',
      width: 80,
      render: (v: boolean) => (v ? t('metamodel.yes') : t('metamodel.no')),
    },
    {
      title: t('metamodel.attrCardinality'),
      dataIndex: 'cardinality',
      key: 'cardinality',
      width: 110,
      render: (c: AttributeDef['cardinality']) => <Tag>{c}</Tag>,
    },
    {
      title: t('metamodel.attrDefault'),
      dataIndex: 'defaultValue',
      key: 'defaultValue',
      render: (v?: string) => v ?? t('metamodel.empty'),
    },
  ];

  return (
    <Drawer
      width={640}
      open={open}
      onClose={onClose}
      title={typeDef ? `${typeDef.displayName} · ${typeDef.name}` : t('metamodel.detailTitle')}
      destroyOnHidden
    >
      {typeDef ? (
        <Space orientation="vertical" size="large" style={{ display: 'flex' }}>
          <Descriptions column={1} bordered size="small">
            <Descriptions.Item label={t('metamodel.colName')}>
              <Typography.Text code>{typeDef.name}</Typography.Text>
            </Descriptions.Item>
            <Descriptions.Item label={t('metamodel.colDisplayName')}>{typeDef.displayName}</Descriptions.Item>
            <Descriptions.Item label={t('metamodel.colCategory')}>
              <Tag color={CATEGORY_COLOR[typeDef.category]}>{t(CATEGORY_LABEL[typeDef.category])}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label={t('metamodel.colSuperTypes')}>
              {typeDef.superTypes.length > 0
                ? typeDef.superTypes.map((s) => <Tag key={s}>{s}</Tag>)
                : t('metamodel.empty')}
            </Descriptions.Item>
            <Descriptions.Item label={t('metamodel.colScope')}>
              <Tag color={SCOPE_COLOR[typeDef.scope]}>{t(SCOPE_LABEL[typeDef.scope])}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label={t('metamodel.colStatus')}>
              <Tag color={STATUS_COLOR[typeDef.status]}>{t(STATUS_LABEL[typeDef.status])}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label={t('metamodel.colVersion')}>v{typeDef.version}</Descriptions.Item>
            <Descriptions.Item label={t('metamodel.colDescription')}>
              {typeDef.description ?? t('metamodel.empty')}
            </Descriptions.Item>
          </Descriptions>

          <div>
            <Typography.Title level={5}>{t('metamodel.attrsTitle')}</Typography.Title>
            <Table<AttributeDef>
              rowKey="name"
              size="small"
              columns={attrColumns}
              dataSource={typeDef.attributeDefs}
              pagination={false}
            />
          </div>
        </Space>
      ) : (
        <Empty />
      )}
    </Drawer>
  );
}
