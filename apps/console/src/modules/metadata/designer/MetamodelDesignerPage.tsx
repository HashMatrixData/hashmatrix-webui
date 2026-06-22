import { useCallback, useMemo, useState } from 'react';
import {
  Alert,
  App,
  Button,
  Card,
  Descriptions,
  Drawer,
  Empty,
  Popconfirm,
  Space,
  Table,
  Tag,
  Typography,
} from 'antd';
import type { TableColumnsType } from 'antd';
import { AppstoreAddOutlined, PlusOutlined, SafetyCertificateOutlined } from '@ant-design/icons';
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
import { CARDINALITY_SYMBOL, REL_TYPE_COLOR, REL_TYPE_LABEL } from '../relationship/relationshipMeta';
import { TypeDefFormDrawer } from '../metamodel/TypeDefFormDrawer';
import { TypeDefVersionDrawer } from '../metamodel/TypeDefVersionDrawer';
import { ClassificationTree } from '../classification/ClassificationTree';
import { TemplatesPage } from '../templates/TemplatesPage';
import { ValidationPage } from '../validation/ValidationPage';
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
 * 元模型设计器工作台（内容级合并）：X6 画布 + 属性面板 + 分类树，元类/继承/关系/分类/
 * 校验/模板/生命周期同台。新建·编辑·发布·版本·校验·模板均复用既有组件。后端 post-M1，mock。
 */
export function MetamodelDesignerPage() {
  const { t } = useTranslation();
  const { message } = App.useApp();
  const queryClient = useQueryClient();
  const [selectedName, setSelectedName] = useState<string | null>(null);
  const [selectedRel, setSelectedRel] = useState<string | null>(null);
  const [problemIds, setProblemIds] = useState<string[]>([]);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<TypeDef | null>(null);
  const [templatesOpen, setTemplatesOpen] = useState(false);
  const [validationOpen, setValidationOpen] = useState(false);
  const [versionName, setVersionName] = useState<string | null>(null);
  const [versionOpen, setVersionOpen] = useState(false);

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
  const selectedRelObj = useMemo(
    () => relationships.find((r) => r.name === selectedRel) ?? null,
    [relationships, selectedRel],
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

  // 节点/边选中互斥（选边清节点高亮，反之亦然）；useCallback 稳定身份以免重建画布。
  const handleSelectNode = useCallback((name: string | null) => {
    setSelectedName(name);
    setSelectedRel(null);
  }, []);
  const handleSelectEdge = useCallback((name: string) => {
    setSelectedRel(name);
    setSelectedName(null);
  }, []);

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };
  const openEdit = useCallback(
    (name: string) => {
      const td = typeDefs.find((t) => t.name === name);
      // 平台公共共享只读：仅租户私有可编辑（#10）。
      if (td && td.scope === 'TENANT') {
        setEditing(td);
        setFormOpen(true);
      } else {
        handleSelectNode(name);
        if (td) message.info(t('metamodel.readonly'));
      }
    },
    [typeDefs, handleSelectNode, message, t],
  );
  const refetchTypeDefs = () => queryClient.invalidateQueries({ queryKey: TYPEDEFS_KEY });

  const publish = async (name: string) => {
    try {
      await http.post(`/api/meta/typedefs/${name}/publish`);
      message.success(t('metamodel.publishOk'));
      void queryClient.invalidateQueries({ queryKey: TYPEDEFS_KEY });
      void queryClient.invalidateQueries({ queryKey: ['typedef-versions', name] });
    } catch (err) {
      message.error((err as ApiError).message || t('metamodel.publishFail'));
    }
  };

  const runValidate = async () => {
    try {
      const report = (await http.get<ValidateResult>('/api/meta/validate')).data.data;
      // 问题对象（元类/关系编码）回画布高亮；与 ValidationPage 一致按问题总数判通过。
      setProblemIds([...new Set(report.issues.map((i) => i.target))]);
      setValidationOpen(true);
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
        <Button icon={<AppstoreAddOutlined />} onClick={() => setTemplatesOpen(true)}>
          {t('designer.toolbarTemplates')}
        </Button>
        <Button icon={<SafetyCertificateOutlined />} onClick={() => void runValidate()}>
          {t('designer.toolbarValidate')}
        </Button>
        <Tag color="blue">{t('designer.legendInherit')}</Tag>
        <Tag color="orange">{t('designer.legendRelation')}</Tag>
        {problemIds.length > 0 && <Tag color="red">{t('designer.legendProblem')}</Tag>}
        <Typography.Text type="secondary">{t('designer.toolbarHint')}</Typography.Text>
      </Space>

      {/* 用原生 flex 行（非 antd Space）：Space 会把子项包进 item，flex:1 不生效，画布列会塌成 0 宽。 */}
      <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start', width: '100%' }}>
        <Card styles={{ body: { padding: 0 } }} style={{ flex: 1, minWidth: 0 }}>
          <MetamodelCanvas
            typeDefs={typeDefs}
            relationships={relationships}
            selectedId={selectedName}
            onSelectNode={handleSelectNode}
            onSelectEdge={handleSelectEdge}
            onEditNode={openEdit}
            problemIds={problemIds}
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

              <Space wrap>
                {selected.scope === 'TENANT' && selected.status === 'DRAFT' && (
                  <Popconfirm title={t('metamodel.publishConfirm')} onConfirm={() => void publish(selected.name)}>
                    <Button size="small" type="primary">
                      {t('metamodel.btnPublish')}
                    </Button>
                  </Popconfirm>
                )}
                {selected.scope === 'TENANT' && (
                  <Button size="small" onClick={() => openEdit(selected.name)}>
                    {t('metamodel.btnEdit')}
                  </Button>
                )}
                <Button
                  size="small"
                  onClick={() => {
                    setVersionName(selected.name);
                    setVersionOpen(true);
                  }}
                >
                  {t('metamodel.btnVersions')}
                </Button>
              </Space>
            </Space>
          ) : selectedRelObj ? (
            <Descriptions column={1} size="small" title={t('relationship.detailTitle')}>
              <Descriptions.Item label={t('relationship.colName')}>
                <Typography.Text code>{selectedRelObj.name}</Typography.Text>
              </Descriptions.Item>
              <Descriptions.Item label={t('relationship.colType')}>
                <Tag color={REL_TYPE_COLOR[selectedRelObj.relationshipType]}>
                  {t(REL_TYPE_LABEL[selectedRelObj.relationshipType])}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label={t('relationship.colCardinality')}>
                <Tag>{CARDINALITY_SYMBOL[selectedRelObj.cardinality]}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label={t('relationship.colEnd1')}>
                <Typography.Text code>
                  {selectedRelObj.end1.typeName}.{selectedRelObj.end1.attributeName}
                </Typography.Text>
              </Descriptions.Item>
              <Descriptions.Item label={t('relationship.colEnd2')}>
                <Typography.Text code>
                  {selectedRelObj.end2.typeName}.{selectedRelObj.end2.attributeName}
                </Typography.Text>
              </Descriptions.Item>
              <Descriptions.Item label={t('relationship.colScope')}>
                <Tag color={SCOPE_COLOR[selectedRelObj.scope]}>{t(SCOPE_LABEL[selectedRelObj.scope])}</Tag>
              </Descriptions.Item>
            </Descriptions>
          ) : (
            <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={t('designer.selectHint')} />
          )}
        </Card>
      </div>

      <Card title={t('designer.classificationTitle')} size="small">
        <ClassificationTree />
      </Card>

      <TypeDefFormDrawer
        open={formOpen}
        editing={editing}
        existingNames={typeDefs.map((td) => td.name)}
        superTypeOptions={typeDefs.filter((td) => td.category === 'ENTITY').map((td) => td.name)}
        onOpenChange={setFormOpen}
        onSaved={refetchTypeDefs}
      />
      <TypeDefVersionDrawer typeName={versionName} open={versionOpen} onClose={() => setVersionOpen(false)} />
      <Drawer
        title={t('designer.toolbarTemplates')}
        width={920}
        open={templatesOpen}
        onClose={() => {
          setTemplatesOpen(false);
          // 模板导入会新增元类，关闭时刷新画布。
          void refetchTypeDefs();
        }}
        destroyOnHidden
      >
        <TemplatesPage />
      </Drawer>
      <Drawer
        title={t('designer.toolbarValidate')}
        width={760}
        open={validationOpen}
        onClose={() => setValidationOpen(false)}
        destroyOnHidden
      >
        <ValidationPage />
      </Drawer>
    </Space>
  );
}
