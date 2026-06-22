import { useMemo, useState } from 'react';
import { Alert, Card, Empty, List, Select, Space, Tag, Typography } from 'antd';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { http } from '@hashmatrix/sdk';
import { downstreamOf, type LineageGraphData } from '@/mocks/lineage';
import { LineageImpactGraph } from './LineageImpactGraph';

interface LineageResult {
  data: LineageGraphData;
}
const EMPTY_GRAPH: LineageGraphData = { nodes: [], edges: [] };
const DEFAULT_FOCUS = 'dwd.order_fact';

/**
 * 血缘分析（元数据管理模块 · 子模块）：表级血缘图 + 影响分析（选焦点资产看下游受影响）。
 * 对应 governance 元模型引擎（Epic #1 / 子 #15）；后端 post-M1，当前 mock 供数。
 */
export function LineageAnalysisPage() {
  const { t } = useTranslation();
  const [focusId, setFocusId] = useState(DEFAULT_FOCUS);

  const { data: graph = EMPTY_GRAPH } = useQuery({
    queryKey: ['meta-lineage'],
    queryFn: async () => (await http.get<LineageResult>('/api/meta/lineage')).data.data,
  });

  // 默认焦点不在数据中（重命名/删除/真实数据）时回退首个节点，避免静默指向不存在节点。
  const focus =
    graph.nodes.some((n) => n.id === focusId) ? focusId : (graph.nodes[0]?.id ?? focusId);
  const impacted = useMemo(() => downstreamOf(graph, focus), [graph, focus]);
  const options = graph.nodes.map((n) => ({ label: n.label, value: n.id }));

  return (
    <Space orientation="vertical" size="large" style={{ display: 'flex' }}>
      <Typography.Title level={3}>{t('menu.metaLineage')}</Typography.Title>
      <Alert type="info" showIcon title={t('metaLineage.mockBadge')} description={t('metaLineage.pageDesc')} />

      <Space wrap>
        <span>{t('metaLineage.focusLabel')}：</span>
        <Select
          value={focus}
          options={options}
          onChange={setFocusId}
          style={{ minWidth: 220 }}
          showSearch
          optionFilterProp="label"
        />
        <Tag color="orange">{t('metaLineage.legendImpacted')}</Tag>
      </Space>

      <Card title={t('metaLineage.graphTitle')} styles={{ body: { padding: 0 } }}>
        {graph.nodes.length > 0 ? (
          <LineageImpactGraph data={graph} focusId={focus} impactedIds={impacted} />
        ) : (
          <Empty style={{ padding: 24 }} />
        )}
      </Card>

      <Card title={t('metaLineage.impactTitle')} size="small">
        <Typography.Paragraph type="secondary">{t('metaLineage.impactDesc')}</Typography.Paragraph>
        {impacted.length > 0 ? (
          <List
            size="small"
            dataSource={impacted}
            renderItem={(id) => (
              <List.Item>
                <Typography.Text code>{id}</Typography.Text>
              </List.Item>
            )}
          />
        ) : (
          <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={t('metaLineage.noImpact')} />
        )}
      </Card>
    </Space>
  );
}
