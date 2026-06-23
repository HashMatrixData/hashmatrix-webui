import { Descriptions, Drawer, Empty, Space, Table, Tag, Timeline, Typography } from 'antd';
import type { TableColumnsType } from 'antd';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { http } from '@hashmatrix/sdk';
import type { InstanceSnapshot, MetadataInstance } from '@/mocks/instances';
import {
  INSTANCE_STATUS_COLOR,
  INSTANCE_STATUS_LABEL,
  SCOPE_COLOR,
  SCOPE_LABEL,
} from './instanceMeta';

interface InstanceDetailDrawerProps {
  instance: MetadataInstance | null;
  open: boolean;
  onClose: () => void;
}
interface HistoryResult {
  data: InstanceSnapshot[];
}
interface AttrRow {
  key: string;
  value: string;
}

/** 实例详情（只读）：基础信息 + 属性值 + 历史快照时间线。 */
export function InstanceDetailDrawer({ instance, open, onClose }: InstanceDetailDrawerProps) {
  const { t } = useTranslation();

  const { data: history = [] } = useQuery({
    queryKey: ['instance-history', instance?.guid],
    queryFn: async () =>
      (await http.get<HistoryResult>(`/api/meta/instances/${instance?.guid}/history`)).data.data,
    enabled: open && instance !== null,
  });

  const attrRows: AttrRow[] = instance
    ? Object.entries(instance.attributes).map(([key, value]) => ({ key, value: String(value) }))
    : [];
  const attrColumns: TableColumnsType<AttrRow> = [
    { title: t('instance.attrKey'), dataIndex: 'key', width: 200 },
    { title: t('instance.attrValue'), dataIndex: 'value' },
  ];

  return (
    <Drawer
      width={600}
      open={open}
      onClose={onClose}
      title={instance ? `${instance.displayName} · ${instance.qualifiedName}` : t('instance.detailTitle')}
      destroyOnHidden
    >
      {instance ? (
        <Space orientation="vertical" size="large" style={{ display: 'flex' }}>
          <Descriptions column={1} bordered size="small">
            <Descriptions.Item label={t('instance.colType')}>
              <Typography.Text code>{instance.typeName}</Typography.Text>
            </Descriptions.Item>
            <Descriptions.Item label={t('instance.colQualifiedName')}>
              <Typography.Text code>{instance.qualifiedName}</Typography.Text>
            </Descriptions.Item>
            <Descriptions.Item label={t('instance.colOwner')}>{instance.owner}</Descriptions.Item>
            <Descriptions.Item label={t('instance.colStatus')}>
              <Tag color={INSTANCE_STATUS_COLOR[instance.status]}>
                {t(INSTANCE_STATUS_LABEL[instance.status])}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label={t('instance.colScope')}>
              <Tag color={SCOPE_COLOR[instance.scope]}>{t(SCOPE_LABEL[instance.scope])}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label={t('instance.colClaim')}>
              {instance.claimedBy ?? t('instance.unclaimed')}
            </Descriptions.Item>
          </Descriptions>

          <div>
            <Typography.Title level={5}>{t('instance.attrsTitle')}</Typography.Title>
            <Table<AttrRow> rowKey="key" size="small" columns={attrColumns} dataSource={attrRows} pagination={false} />
          </div>

          <div>
            <Typography.Title level={5}>{t('instance.historyTitle')}</Typography.Title>
            {history.length > 0 ? (
              <Timeline
                items={history.map((h) => ({
                  children: (
                    <div>
                      <Typography.Text strong>v{h.version}</Typography.Text> {h.summary}
                      <div>
                        <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                          {h.changedAt.slice(0, 10)}
                        </Typography.Text>
                      </div>
                    </div>
                  ),
                }))}
              />
            ) : (
              <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={t('instance.noHistory')} />
            )}
          </div>
        </Space>
      ) : (
        <Empty />
      )}
    </Drawer>
  );
}
