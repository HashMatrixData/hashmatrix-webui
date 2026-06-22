import { useCallback, useMemo, useState } from 'react';
import { Alert, App, Button, Card, Descriptions, Empty, Space, Table, Tag, Typography } from 'antd';
import type { TableColumnsType } from 'antd';
import { PlusOutlined, SafetyCertificateOutlined } from '@ant-design/icons';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { http, type ApiError } from '@hashmatrix/sdk';
import type { AttributeDef, TypeDef } from '@/mocks/typedefs';
import type { RelationshipDef } from '@/mocks/relationships';
import type { ValidationReport } from '@/mocks/validation';
import {
  CATEGORY_COLOR,
  CATEGORY_LABEL,
  SCOPE_COLOR,
  SCOPE_LABEL,
  STATUS_COLOR,
  STATUS_LABEL,
} from '../metamodel/metamodelMeta';
import { CARDINALITY_SYMBOL, REL_TYPE_LABEL } from '../relationship/relationshipMeta';
import { TypeDefFormDrawer } from '../metamodel/TypeDefFormDrawer';
import { MetamodelCanvas } from './MetamodelCanvas';

interface Paged<T> {
  data: T[];
  total: number;
}
interface ValidateResult {
  data: ValidationReport;
}
const TYPEDEFS_KEY = ['designer-typedefs'];

/**
 * 元模型设计器工作台（内容级合并）：X6 画布 + 属性面板，元类/继承/关系同台呈现。
 * 新建/编辑复用 TypeDefFormDrawer；一致性校验内联触发。后端 post-M1，当前 mock。
 */
export function MetamodelDesignerPage() {
  const { t } = useTranslation();
  const { message } = App.useApp();
  const queryClient = useQueryClient();
  const [selectedName, setSelectedName] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<TypeDef | null>(null);

  const { data: typeDefs = [] } = useQuery({
    queryKey: TYPEDEFS_KEY,
    queryFn: async () =>
      (await http.get<Paged<TypeDef>>('/api/meta/typedefs', { params: { current: 1, pageSize: 200 } }))
        .data.data,
  });
  const { data: relationships = [] } = useQuery({
    queryKey: ['designer-relationships'],
    queryFn: async () =>
      (
        await http.get<Paged<RelationshipDef>>('/api/meta/relationships', {
          params: { current: 1, pageSize: 200 },
        })
      ).data.data,
  });

  const selected = useMemo(
    () => typeDefs.find((t) => t.name === selectedName) ?? null,
    [typeDefs, selectedName],
  );
  const relatedRels = useMemo(
    () =>
      selectedName
        ? relationships.filter(
            (r) => r.end1.typeName === selectedName || r.end2.typeName === selectedName,
          )
        : [],
    [relationships, selectedName],
  );

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };
  // useCallback：作为 MetamodelCanvas 的 effect 依赖，须稳定身份以免每次渲染重建画布。
  const openEdit = useCallback(
    (name: string) => {
      const td = typeDefs.find((t) => t.name === name);
      // 平台公共共享只读：仅租户私有可编辑（#10）。
      if (td && td.scope === 'TENANT') {
        setEditing(td);
        setFormOpen(true);
      } else {
        setSelectedName(name);
        if (td) message.info(t('metamodel.readonly'));
      }
    },
    [typeDefs, message, t],
  );
  const refetchTypeDefs = () => queryClient.invalidateQueries({ queryKey: TYPEDEFS_KEY });

  const validate = async () => {
    try {
      const report = (await http.get<ValidateResult>('/api/meta/validate')).data.data;
      // 与 ValidationPage 一致：按问题总数判通过（含未来 warning），避免两入口结论不一。
      if (report.issues.length === 0) {
        message.success(t('designer.validatePass'));
      } else {
        message.error(t('designer.validateFail', { errors: report.issues.length }));
      }
    } catch (err) {
      message.error((err as ApiError).message || t('designer.validateError'));
    }
  };

  const attrColumns: TableColumnsType<AttributeDef> = [
    { title: t('metamodel.attrName'), dataIndex: 'name' },
    { title: t('metamodel.attrType'), dataIndex: 'type', width: 90, render: (v: string) => <Tag>{v}</Tag> },
    {
      title: t('metamodel.attrCardinality'),
      dataIndex: 'cardinality',
      width: 100,
      render: (v: string) => <Tag>{v}</Tag>,
    },
  ];

  return (
    <Space orientation="vertical" size="middle" style={{ display: 'flex' }}>
      <Alert type="info" showIcon title={t('designer.mockBadge')} description={t('designer.pageDesc')} />
      <Space wrap>
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
          {t('designer.toolbarNew')}
        </Button>
        <Button icon={<SafetyCertificateOutlined />} onClick={() => void validate()}>
          {t('designer.toolbarValidate')}
        </Button>
        <Tag color="blue">{t('designer.legendInherit')}</Tag>
        <Tag color="orange">{t('designer.legendRelation')}</Tag>
        <Typography.Text type="secondary">{t('designer.toolbarHint')}</Typography.Text>
      </Space>

      <Space align="start" size="middle" style={{ display: 'flex', width: '100%' }}>
        <Card styles={{ body: { padding: 0 } }} style={{ flex: 1, minWidth: 0 }}>
          <MetamodelCanvas
            typeDefs={typeDefs}
            relationships={relationships}
            selectedId={selectedName}
            onSelectNode={setSelectedName}
            onEditNode={openEdit}
          />
        </Card>

        <Card title={t('designer.panelTitle')} size="small" style={{ width: 360, flex: '0 0 auto' }}>
          {selected ? (
            <Space orientation="vertical" size="middle" style={{ display: 'flex' }}>
              <Descriptions column={1} size="small">
                <Descriptions.Item label={t('metamodel.colName')}>
                  <Typography.Text code>{selected.name}</Typography.Text>
                </Descriptions.Item>
                <Descriptions.Item label={t('metamodel.colDisplayName')}>
                  {selected.displayName}
                </Descriptions.Item>
                <Descriptions.Item label={t('metamodel.colCategory')}>
                  <Tag color={CATEGORY_COLOR[selected.category]}>{t(CATEGORY_LABEL[selected.category])}</Tag>
                </Descriptions.Item>
                <Descriptions.Item label={t('metamodel.colSuperTypes')}>
                  {selected.superTypes.length > 0
                    ? selected.superTypes.map((s) => <Tag key={s}>{s}</Tag>)
                    : '—'}
                </Descriptions.Item>
                <Descriptions.Item label={t('metamodel.colScope')}>
                  <Tag color={SCOPE_COLOR[selected.scope]}>{t(SCOPE_LABEL[selected.scope])}</Tag>
                </Descriptions.Item>
                <Descriptions.Item label={t('metamodel.colStatus')}>
                  <Tag color={STATUS_COLOR[selected.status]}>{t(STATUS_LABEL[selected.status])}</Tag>
                  <Typography.Text type="secondary"> v{selected.version}</Typography.Text>
                </Descriptions.Item>
              </Descriptions>

              <div>
                <Typography.Text strong>{t('designer.attrsTitle')}</Typography.Text>
                <Table<AttributeDef>
                  rowKey="name"
                  size="small"
                  columns={attrColumns}
                  dataSource={selected.attributeDefs}
                  pagination={false}
                />
              </div>

              {relatedRels.length > 0 && (
                <div>
                  <Typography.Text strong>{t('designer.relatedTitle')}</Typography.Text>
                  {relatedRels.map((r) => (
                    <div key={r.name} style={{ marginTop: 4 }}>
                      <Tag color="orange">{t(REL_TYPE_LABEL[r.relationshipType])}</Tag>
                      <Typography.Text code>
                        {r.end1.typeName} → {r.end2.typeName}
                      </Typography.Text>{' '}
                      <Tag>{CARDINALITY_SYMBOL[r.cardinality]}</Tag>
                    </div>
                  ))}
                </div>
              )}

              {selected.scope === 'TENANT' && (
                <Button size="small" onClick={() => openEdit(selected.name)}>
                  {t('metamodel.btnEdit')}
                </Button>
              )}
            </Space>
          ) : (
            <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={t('designer.selectHint')} />
          )}
        </Card>
      </Space>

      <TypeDefFormDrawer
        open={formOpen}
        editing={editing}
        existingNames={typeDefs.map((td) => td.name)}
        superTypeOptions={typeDefs.filter((td) => td.category === 'ENTITY').map((td) => td.name)}
        onOpenChange={setFormOpen}
        onSaved={refetchTypeDefs}
      />
    </Space>
  );
}
