import { useState } from 'react';
import { ProTable, type ProColumns } from '@ant-design/pro-components';
import { Descriptions, Drawer, Empty, Tag, Typography } from 'antd';
import { useTranslation } from 'react-i18next';
import { http } from '@hashmatrix/sdk';
import type { ChangeEvent, EventType } from '@/mocks/events';
import { EVENT_TYPE_COLOR, EVENT_TYPE_LABEL } from './eventMeta';

interface PagedResult {
  data: ChangeEvent[];
  total: number;
}

/**
 * 变更事件流（只读）：ProTable + 服务端分页 + type 过滤；行点击查看事件详情。
 * 事件由后端发布（Kafka topic），前端仅观测。数据经 axios → msw。
 */
export function EventsTable() {
  const { t } = useTranslation();
  const [selected, setSelected] = useState<ChangeEvent | null>(null);
  const [open, setOpen] = useState(false);

  // 过滤项由 EVENT_TYPE_LABEL 派生，单一事实源（新增/改名事件类型仅改 eventMeta）。
  const typeValueEnum = Object.fromEntries(
    (Object.keys(EVENT_TYPE_LABEL) as EventType[]).map((k) => [k, { text: t(EVENT_TYPE_LABEL[k]) }]),
  );

  const columns: ProColumns<ChangeEvent>[] = [
    {
      title: t('events.colType'),
      dataIndex: 'type',
      width: 130,
      valueType: 'select',
      valueEnum: typeValueEnum,
      render: (_, row) => (
        <Tag color={EVENT_TYPE_COLOR[row.type]}>{t(EVENT_TYPE_LABEL[row.type])}</Tag>
      ),
    },
    {
      title: t('events.colTopic'),
      dataIndex: 'topic',
      search: false,
      render: (_, row) => <Typography.Text code>{row.topic}</Typography.Text>,
    },
    {
      title: t('events.colSubject'),
      dataIndex: 'subject',
      search: false,
      width: 200,
      render: (_, row) => <Typography.Text code>{row.subject}</Typography.Text>,
    },
    {
      title: t('events.colTime'),
      dataIndex: 'occurredAt',
      search: false,
      width: 120,
      render: (_, row) => row.occurredAt.slice(0, 10),
    },
    { title: t('events.colSummary'), dataIndex: 'summary', search: false },
  ];

  return (
    <>
      <ProTable<ChangeEvent>
        rowKey="id"
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
          const { current, pageSize, type } = params;
          const res = await http.get<PagedResult>('/api/meta/events', {
            params: { current, pageSize, type },
          });
          return { data: res.data.data, total: res.data.total, success: true };
        }}
      />
      <Drawer
        width={520}
        open={open}
        onClose={() => setOpen(false)}
        title={selected ? `${t('events.detailTitle')} · ${selected.id}` : t('events.detailTitle')}
        destroyOnHidden
      >
        {selected ? (
          <Descriptions column={1} bordered size="small">
            <Descriptions.Item label={t('events.colType')}>
              <Tag color={EVENT_TYPE_COLOR[selected.type]}>{t(EVENT_TYPE_LABEL[selected.type])}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label={t('events.colTopic')}>
              <Typography.Text code>{selected.topic}</Typography.Text>
            </Descriptions.Item>
            <Descriptions.Item label={t('events.colSubject')}>
              <Typography.Text code>{selected.subject}</Typography.Text>
            </Descriptions.Item>
            <Descriptions.Item label={t('events.colTime')}>
              {selected.occurredAt.slice(0, 19).replace('T', ' ')}
            </Descriptions.Item>
            <Descriptions.Item label={t('events.colSummary')}>{selected.summary}</Descriptions.Item>
          </Descriptions>
        ) : (
          <Empty />
        )}
      </Drawer>
    </>
  );
}
