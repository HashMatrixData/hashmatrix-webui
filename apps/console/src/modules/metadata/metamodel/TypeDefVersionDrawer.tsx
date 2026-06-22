import { Drawer, Empty, Spin, Tag, Timeline, Typography } from 'antd';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { http } from '@hashmatrix/sdk';
import type { TypeDefVersion } from '@/mocks/typedefVersions';
import { STATUS_COLOR, STATUS_LABEL } from '../shared/metaTags';

interface TypeDefVersionDrawerProps {
  /** 目标元类编码；null 表示未选。 */
  typeName: string | null;
  open: boolean;
  onClose: () => void;
}

interface VersionResult {
  data: TypeDefVersion[];
}

/** 元类版本历史（#8）：vN 变更记录时间线（只读）。 */
export function TypeDefVersionDrawer({ typeName, open, onClose }: TypeDefVersionDrawerProps) {
  const { t } = useTranslation();
  const { data: versions = [], isLoading } = useQuery({
    queryKey: ['typedef-versions', typeName],
    queryFn: async () =>
      (await http.get<VersionResult>(`/api/meta/typedefs/${typeName}/versions`)).data.data,
    enabled: open && typeName !== null,
  });

  return (
    <Drawer
      width={480}
      open={open}
      onClose={onClose}
      title={typeName ? `${t('metamodel.versionTitle')} · ${typeName}` : t('metamodel.versionTitle')}
      destroyOnHidden
    >
      {isLoading ? (
        <div style={{ display: 'grid', placeItems: 'center', minHeight: 160 }}>
          <Spin />
        </div>
      ) : versions.length > 0 ? (
        <Timeline
          items={versions.map((v) => ({
            color: v.status === 'PUBLISHED' ? 'green' : 'gray',
            children: (
              <div>
                <Typography.Text strong>v{v.version}</Typography.Text>{' '}
                <Tag color={STATUS_COLOR[v.status]}>{t(STATUS_LABEL[v.status])}</Tag>
                <div>
                  <Typography.Text>{v.summary}</Typography.Text>
                </div>
                <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                  {v.changedAt.slice(0, 10)}
                </Typography.Text>
              </div>
            ),
          }))}
        />
      ) : (
        <Empty />
      )}
    </Drawer>
  );
}
