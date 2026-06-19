import type { ParseKeys } from 'i18next';
import { ProTable, StatisticCard, type ProColumns } from '@ant-design/pro-components';
import { Badge, Space, Tag, Typography } from 'antd';
import { useTranslation } from 'react-i18next';
import { SECURITY_ASSETS, type SecurityAssetRow, type SecurityLevel } from '@/mocks/securityAssets';

/** 敏感级别 → 固定语义色（不随品牌换肤；级别越高越警示）。`public` 取默认灰（无 color）。 */
const LEVEL_COLOR: Record<SecurityLevel, string | undefined> = {
  public: undefined,
  internal: 'blue',
  confidential: 'orange',
  secret: 'red',
};
const LEVEL_LABEL: Record<SecurityLevel, ParseKeys> = {
  public: 'security.levelPublic',
  internal: 'security.levelInternal',
  confidential: 'security.levelConfidential',
  secret: 'security.levelSecret',
};
const CATEGORY_LABEL: Record<SecurityAssetRow['category'], ParseKeys> = {
  pii: 'security.catPii',
  financial: 'security.catFinancial',
  contact: 'security.catContact',
  general: 'security.catGeneral',
};
const MASK_LABEL: Record<SecurityAssetRow['mask'], ParseKeys> = {
  none: 'security.maskNone',
  partial: 'security.maskPartial',
  hash: 'security.maskHash',
  encrypt: 'security.maskEncrypt',
};
/** 保护状态 → Badge 状态色 + i18n key（状态色固定，不随品牌换肤）。 */
const STATUS_BADGE: Record<
  SecurityAssetRow['status'],
  { status: 'success' | 'warning' | 'error'; labelKey: ParseKeys }
> = {
  protected: { status: 'success', labelKey: 'security.statusProtected' },
  pending: { status: 'warning', labelKey: 'security.statusPending' },
  exposed: { status: 'error', labelKey: 'security.statusExposed' },
};

// KPI 由 mock 派生（确定性 · 演示数据自洽）。
const TOTAL = SECURITY_ASSETS.length;
const SENSITIVE = SECURITY_ASSETS.filter((r) => r.level === 'confidential' || r.level === 'secret').length;
const MASK_COVERAGE = ((SECURITY_ASSETS.filter((r) => r.mask !== 'none').length / TOTAL) * 100).toFixed(0);

/**
 * 数据安全入口页（#13 · 治理与服务）。挂在「数据安全」模块首叶 `/asset/security/classification`，
 * 由 REAL_PAGE_BY_PATH 覆盖默认占位；同模块其余叶子（脱敏 / 水印 / 权限 / 策略）暂留占位，菜单不断链。
 * spec §3「核心流程原生自研」：以分类分级资产清单 demo（客户端脱敏数据；敏感级别色固定）。
 */
export function SecurityPage() {
  const { t } = useTranslation();

  const columns: ProColumns<SecurityAssetRow>[] = [
    { title: t('security.colAsset'), dataIndex: 'asset', render: (_, r) => <Tag>{r.asset}</Tag> },
    {
      title: t('security.colCategory'),
      dataIndex: 'category',
      width: 120,
      render: (_, r) => t(CATEGORY_LABEL[r.category]),
    },
    {
      title: t('security.colLevel'),
      dataIndex: 'level',
      width: 110,
      render: (_, r) => <Tag color={LEVEL_COLOR[r.level]}>{t(LEVEL_LABEL[r.level])}</Tag>,
    },
    {
      title: t('security.colMask'),
      dataIndex: 'mask',
      width: 110,
      render: (_, r) => t(MASK_LABEL[r.mask]),
    },
    {
      title: t('security.colStatus'),
      dataIndex: 'status',
      width: 110,
      render: (_, r) => {
        const badge = STATUS_BADGE[r.status];
        return <Badge status={badge.status} text={t(badge.labelKey)} />;
      },
    },
  ];

  return (
    <Space orientation="vertical" size="large" style={{ display: 'flex' }}>
      <Typography.Title level={3} style={{ marginTop: 0 }}>
        {t('menu.classification')}
      </Typography.Title>
      <Typography.Paragraph type="secondary">{t('security.intro')}</Typography.Paragraph>

      <StatisticCard.Group direction="row">
        <StatisticCard statistic={{ title: t('security.kpiAssets'), value: TOTAL }} />
        <StatisticCard statistic={{ title: t('security.kpiSensitive'), value: SENSITIVE }} />
        <StatisticCard statistic={{ title: t('security.kpiMaskCoverage'), value: MASK_COVERAGE, suffix: '%' }} />
      </StatisticCard.Group>

      <ProTable<SecurityAssetRow>
        rowKey="id"
        headerTitle={t('security.tableTitle')}
        columns={columns}
        dataSource={SECURITY_ASSETS}
        search={false}
        pagination={{ pageSize: 10 }}
        options={{ reload: false, density: true, setting: true }}
        cardBordered
      />
    </Space>
  );
}
