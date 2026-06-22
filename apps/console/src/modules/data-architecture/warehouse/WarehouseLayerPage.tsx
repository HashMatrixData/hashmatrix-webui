import { useMemo, useState } from 'react';
import type { ParseKeys } from 'i18next';
import { useQuery } from '@tanstack/react-query';
import { StatisticCard } from '@ant-design/pro-components';
import {
  App,
  Alert,
  Button,
  Card,
  Drawer,
  Form,
  Input,
  Modal,
  Select,
  Space,
  Spin,
  Tag,
  Typography,
} from 'antd';
import { useTranslation } from 'react-i18next';
import { http } from '@hashmatrix/sdk';
import {
  DQC_LABEL,
  TIER_LABEL,
  TTL_OPTIONS,
  type DqcTemplate,
  type LayerTier,
  type WarehouseLayerRow,
} from '@/mocks/warehouseLayers';

/** 层带 → code 徽章配色（结构色固定，不随品牌换肤）。 */
const TIER_COLOR: Record<LayerTier, string> = {
  source: 'default',
  common: 'blue',
  app: 'purple',
};

/** DQC 强度 → Tag 配色（自下而上质检渐严）。 */
const DQC_COLOR: Record<DqcTemplate, string> = {
  loose: 'default',
  standard: 'gold',
  strict: 'red',
};

/** 卡片分组顺序（自上而下展示，与金字塔同向）。 */
const TIER_ORDER: LayerTier[] = ['app', 'common', 'source'];

/** 分层演进模型抽屉条目（治理防线说明 · i18n key 受静态校验）。 */
const EVO_ITEMS: { titleKey: ParseKeys; bodyKey: ParseKeys }[] = [
  { titleKey: 'warehouseLayer.evoOdsTitle', bodyKey: 'warehouseLayer.evoOdsBody' },
  { titleKey: 'warehouseLayer.evoDwdTitle', bodyKey: 'warehouseLayer.evoDwdBody' },
  { titleKey: 'warehouseLayer.evoDwsTitle', bodyKey: 'warehouseLayer.evoDwsBody' },
  { titleKey: 'warehouseLayer.evoAdsTitle', bodyKey: 'warehouseLayer.evoAdsBody' },
];

interface LayerForm {
  code: string;
  name: string;
  prefix: string;
  ttl: string;
  dqc: DqcTemplate;
  description: string;
}

/**
 * 数仓分层（canonical 叶子 `/standard/warehouse-design/layer`）。
 *
 * 数据架构「建标」地基：以 OneData 五层（ODS/DIM/DWD/DWS/ADS）为骨架，统一治理
 * 每层的强制前缀、默认 TTL 生命周期与默认 DQC 质检模板，供建模网关继承。合并 V0
 * 「数仓分层」（卡片 + CRUD）与「数仓分层管理」（资产漏斗 + DQC + 演进模型）为单页，去重。
 * 数据经 msw `/api/dw-layers` 自含。
 */
export function WarehouseLayerPage() {
  const { t } = useTranslation();
  const { message } = App.useApp();
  const [keyword, setKeyword] = useState('');
  const [editing, setEditing] = useState<WarehouseLayerRow | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [evoOpen, setEvoOpen] = useState(false);
  const [form] = Form.useForm<LayerForm>();

  const { data, isLoading, isError } = useQuery({
    queryKey: ['dw-layers'],
    queryFn: () => http.get<WarehouseLayerRow[]>('/api/dw-layers').then((r) => r.data),
  });

  // 容错：测试态慢响应可能返回分页包络而非数组，非数组一律视为空集（不崩渲染）。
  const layers = useMemo(() => (Array.isArray(data) ? data : []), [data]);

  // 资产漏斗 KPI：分层数 / 全仓表资产 / 强制前缀覆盖 / 严格 DQC 层数（确定性派生）。
  const totalTables = layers.reduce((sum, l) => sum + l.tableCount, 0);
  const strictLayers = layers.filter((l) => l.dqc === 'strict').length;

  const filtered = useMemo(() => {
    const kw = keyword.trim().toLowerCase();
    if (!kw) return layers;
    return layers.filter((l) => l.name.toLowerCase().includes(kw) || l.code.toLowerCase().includes(kw));
  }, [layers, keyword]);

  function openCreate() {
    setEditing(null);
    form.setFieldsValue({ code: '', name: '', prefix: '', ttl: TTL_OPTIONS[0], dqc: 'standard', description: '' });
    setModalOpen(true);
  }

  function openEdit(layer: WarehouseLayerRow) {
    setEditing(layer);
    form.setFieldsValue({
      code: layer.code,
      name: layer.name,
      prefix: layer.prefix,
      ttl: layer.ttl,
      dqc: layer.dqc,
      description: layer.description,
    });
    setModalOpen(true);
  }

  async function handleSubmit() {
    await form.validateFields();
    // mock-first：契约落地前不持久化，仅回执；待后端 `/api/dw-layers` 写侧接入后改数据层。
    setModalOpen(false);
    message.success(t('warehouseLayer.saved'));
  }

  return (
    <Space orientation="vertical" size="large" style={{ display: 'flex' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
        <div>
          <Typography.Title level={3} style={{ marginTop: 0, marginBottom: 4 }}>
            {t('menu.dwLayer')}
          </Typography.Title>
          <Typography.Paragraph type="secondary" style={{ marginBottom: 0 }}>
            {t('warehouseLayer.intro')}
          </Typography.Paragraph>
        </div>
        <Space>
          <Button onClick={() => setEvoOpen(true)}>{t('warehouseLayer.evoBtn')}</Button>
          <Button type="primary" onClick={openCreate}>
            {t('warehouseLayer.addBtn')}
          </Button>
        </Space>
      </div>

      <StatisticCard.Group direction="row">
        <StatisticCard statistic={{ title: t('warehouseLayer.kpiLayers'), value: layers.length }} />
        <StatisticCard statistic={{ title: t('warehouseLayer.kpiTables'), value: totalTables }} />
        <StatisticCard statistic={{ title: t('warehouseLayer.kpiPrefix'), value: 100, suffix: '%' }} />
        <StatisticCard statistic={{ title: t('warehouseLayer.kpiStrict'), value: strictLayers }} />
      </StatisticCard.Group>

      <Input.Search
        allowClear
        placeholder={t('warehouseLayer.searchPlaceholder')}
        style={{ maxWidth: 320 }}
        onChange={(e) => setKeyword(e.target.value)}
      />

      {isError && <Alert type="error" showIcon message={t('common.loadError')} />}

      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '48px 0' }}>
          <Spin />
        </div>
      ) : (
        TIER_ORDER.map((tier) => {
          const tierLayers = filtered
            .filter((l) => l.tier === tier)
            .sort((a, b) => b.seq - a.seq);
          if (!tierLayers.length) return null;
          return (
            <div key={tier}>
              <Typography.Title level={5} style={{ marginTop: 0 }}>
                {t(TIER_LABEL[tier])}
              </Typography.Title>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                  gap: 16,
                }}
              >
                {tierLayers.map((layer) => (
                  <LayerCard key={layer.code} layer={layer} onConfig={() => openEdit(layer)} t={t} />
                ))}
              </div>
            </div>
          );
        })
      )}

      <Modal
        title={editing ? t('warehouseLayer.editTitle', { name: editing.name }) : t('warehouseLayer.addTitle')}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={handleSubmit}
        okText={t('warehouseLayer.save')}
        cancelText={t('common.cancel')}
        destroyOnHidden
      >
        <Form form={form} layout="vertical" requiredMark>
          <Form.Item name="name" label={t('warehouseLayer.fldName')} rules={[{ required: true }]}>
            <Input placeholder="如：明细数据层" />
          </Form.Item>
          <Form.Item name="code" label={t('warehouseLayer.fldCode')} rules={[{ required: true }]}>
            <Input placeholder="如：DWD" disabled={!!editing} />
          </Form.Item>
          <Form.Item
            name="prefix"
            label={t('warehouseLayer.fldPrefix')}
            rules={[{ required: true }]}
            extra={t('warehouseLayer.fldPrefixHint')}
          >
            <Input placeholder="如：dwd_" />
          </Form.Item>
          <Form.Item name="ttl" label={t('warehouseLayer.fldTtl')} rules={[{ required: true }]}>
            <Select options={TTL_OPTIONS.map((o) => ({ label: o, value: o }))} />
          </Form.Item>
          <Form.Item name="dqc" label={t('warehouseLayer.fldDqc')} rules={[{ required: true }]}>
            <Select
              options={(['loose', 'standard', 'strict'] as DqcTemplate[]).map((d) => ({
                label: t(DQC_LABEL[d]),
                value: d,
              }))}
            />
          </Form.Item>
          <Form.Item name="description" label={t('warehouseLayer.fldDesc')}>
            <Input.TextArea rows={2} />
          </Form.Item>
        </Form>
      </Modal>

      <Drawer
        title={t('warehouseLayer.evoTitle')}
        open={evoOpen}
        onClose={() => setEvoOpen(false)}
        width={420}
      >
        <Typography.Paragraph type="secondary">{t('warehouseLayer.evoIntro')}</Typography.Paragraph>
        <Space orientation="vertical" size="middle" style={{ display: 'flex' }}>
          {EVO_ITEMS.map((item) => (
            <Card key={item.titleKey} size="small">
              <Typography.Text strong>{t(item.titleKey)}</Typography.Text>
              <Typography.Paragraph type="secondary" style={{ marginBottom: 0, marginTop: 4 }}>
                {t(item.bodyKey)}
              </Typography.Paragraph>
            </Card>
          ))}
        </Space>
      </Drawer>
    </Space>
  );
}

interface LayerCardProps {
  layer: WarehouseLayerRow;
  onConfig: () => void;
  t: ReturnType<typeof useTranslation>['t'];
}

/** 单层卡片：code 徽章 + 名称 + 前缀 / TTL / DQC 治理属性 + 防线职责 + 资产数。 */
function LayerCard({ layer, onConfig, t }: LayerCardProps) {
  return (
    <Card
      size="small"
      title={
        <Space>
          <Tag color={TIER_COLOR[layer.tier]} style={{ fontFamily: 'monospace', margin: 0 }}>
            {layer.code}
          </Tag>
          <span>{layer.name}</span>
        </Space>
      }
      extra={
        <Button type="link" size="small" onClick={onConfig}>
          {t('warehouseLayer.configBtn')}
        </Button>
      }
    >
      <Space orientation="vertical" size={6} style={{ display: 'flex' }}>
        <Space size={6} wrap>
          <Tag style={{ fontFamily: 'monospace' }}>{t('warehouseLayer.prefixLabel')}: {layer.prefix}</Tag>
          <Tag>{t('warehouseLayer.ttlLabel')}: {layer.ttl}</Tag>
          <Tag color={DQC_COLOR[layer.dqc]}>
            {t('warehouseLayer.dqcLabel')}: {t(DQC_LABEL[layer.dqc])}
          </Tag>
        </Space>
        <Typography.Text type="secondary" style={{ fontSize: 12 }}>
          {layer.duty}
        </Typography.Text>
        <Typography.Text style={{ fontSize: 12 }}>
          {t('warehouseLayer.tableCountLabel')}：
          <Typography.Text strong>{layer.tableCount}</Typography.Text>
        </Typography.Text>
      </Space>
    </Card>
  );
}
