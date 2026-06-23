import { Descriptions, Drawer, Empty, Tag, Typography } from 'antd';
import { useTranslation } from 'react-i18next';
import type { RelationshipDef } from '@/mocks/relationships';
import {
  CARDINALITY_SYMBOL,
  REL_TYPE_COLOR,
  REL_TYPE_LABEL,
  SCOPE_COLOR,
  SCOPE_LABEL,
  STATUS_COLOR,
  STATUS_LABEL,
} from './relationshipMeta';

interface RelationshipDetailDrawerProps {
  relationship: RelationshipDef | null;
  open: boolean;
  onClose: () => void;
}

/** 关系定义详情（只读）：类型 / 基数 / 源·目标端点 / 作用域 / 状态。 */
export function RelationshipDetailDrawer({ relationship, open, onClose }: RelationshipDetailDrawerProps) {
  const { t } = useTranslation();

  const renderEnd = (end: RelationshipDef['end1']) => (
    <Typography.Text code>
      {end.typeName}.{end.attributeName}
    </Typography.Text>
  );

  return (
    <Drawer
      width={560}
      open={open}
      onClose={onClose}
      title={relationship ? `${relationship.displayName} · ${relationship.name}` : t('relationship.detailTitle')}
      destroyOnHidden
    >
      {relationship ? (
        <Descriptions column={1} bordered size="small">
          <Descriptions.Item label={t('relationship.colName')}>
            <Typography.Text code>{relationship.name}</Typography.Text>
          </Descriptions.Item>
          <Descriptions.Item label={t('relationship.colDisplayName')}>
            {relationship.displayName}
          </Descriptions.Item>
          <Descriptions.Item label={t('relationship.colType')}>
            <Tag color={REL_TYPE_COLOR[relationship.relationshipType]}>
              {t(REL_TYPE_LABEL[relationship.relationshipType])}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label={t('relationship.colCardinality')}>
            <Tag>{CARDINALITY_SYMBOL[relationship.cardinality]}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label={t('relationship.colEnd1')}>{renderEnd(relationship.end1)}</Descriptions.Item>
          <Descriptions.Item label={t('relationship.colEnd2')}>{renderEnd(relationship.end2)}</Descriptions.Item>
          <Descriptions.Item label={t('relationship.colScope')}>
            <Tag color={SCOPE_COLOR[relationship.scope]}>{t(SCOPE_LABEL[relationship.scope])}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label={t('relationship.colStatus')}>
            <Tag color={STATUS_COLOR[relationship.status]}>{t(STATUS_LABEL[relationship.status])}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label={t('relationship.colVersion')}>v{relationship.version}</Descriptions.Item>
          <Descriptions.Item label={t('relationship.colDescription')}>
            {relationship.description ?? t('relationship.empty')}
          </Descriptions.Item>
        </Descriptions>
      ) : (
        <Empty />
      )}
    </Drawer>
  );
}
