import { useState } from 'react';
import { Alert, App, Button, Card, Col, Popconfirm, Row, Space, Tag, Typography } from 'antd';
import { ImportOutlined } from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { http, type ApiError } from '@hashmatrix/sdk';
import type { TypeDefTemplate } from '@/mocks/templates';

interface TemplatesResult {
  data: TypeDefTemplate[];
}
interface ImportResult {
  data: { created: number; skipped: number; total: number };
}

/**
 * 模板库（元数据管理模块 · 子模块）：标准模型族（MySQL/Hive/Kafka/REST）一键导入。
 * 对应 governance 元模型引擎（Epic #1 / 子 #11）；导入落租户私有草稿，后端 post-M1，当前 mock。
 */
export function TemplatesPage() {
  const { t } = useTranslation();
  const { message } = App.useApp();
  const [importingKey, setImportingKey] = useState<string | null>(null);

  const { data: templates = [] } = useQuery({
    queryKey: ['meta-templates'],
    queryFn: async () => (await http.get<TemplatesResult>('/api/meta/templates')).data.data,
  });

  const handleImport = async (tpl: TypeDefTemplate) => {
    setImportingKey(tpl.key);
    try {
      const res = await http.post<ImportResult>(`/api/meta/templates/${tpl.key}/import`);
      const { created, skipped } = res.data.data;
      message.success(t('templates.importDone', { created, skipped }));
    } catch (err) {
      message.error((err as ApiError).message || t('templates.importFail'));
    } finally {
      setImportingKey(null);
    }
  };

  return (
    <Space orientation="vertical" size="large" style={{ display: 'flex' }}>
      <Typography.Title level={3}>{t('menu.templates')}</Typography.Title>
      <Alert type="info" showIcon title={t('templates.mockBadge')} description={t('templates.pageDesc')} />
      <Row gutter={[16, 16]}>
        {templates.map((tpl) => (
          <Col key={tpl.key} xs={24} sm={12} lg={8}>
            <Card
              title={
                <Space>
                  <span>{tpl.displayName}</span>
                  <Tag color="blue">{tpl.source}</Tag>
                </Space>
              }
              extra={
                <Popconfirm
                  title={t('templates.importConfirm', { count: tpl.typeDefs.length })}
                  onConfirm={() => handleImport(tpl)}
                >
                  <Button
                    type="primary"
                    size="small"
                    icon={<ImportOutlined />}
                    loading={importingKey === tpl.key}
                  >
                    {t('templates.cardImport')}
                  </Button>
                </Popconfirm>
              }
            >
              <Typography.Paragraph type="secondary">{tpl.description}</Typography.Paragraph>
              <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                {t('templates.includes')}
              </Typography.Text>
              <div style={{ marginTop: 8 }}>
                {tpl.typeDefs.map((td) => (
                  <Tag key={td.name} style={{ marginBottom: 4 }}>
                    {td.name}
                  </Tag>
                ))}
              </div>
            </Card>
          </Col>
        ))}
      </Row>
    </Space>
  );
}
