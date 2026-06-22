import { useTranslation } from 'react-i18next';
import { MetadataTabsPage } from './MetadataTabsPage';
import { InstancePage } from './instance/InstancePage';
import { LineageAnalysisPage } from './lineage/LineageAnalysisPage';

/**
 * 元数据资产（资产平面）：实例 / 血缘分析，归为一个 Tab 工作台。
 */
export function AssetsPage() {
  const { t } = useTranslation();
  return (
    <MetadataTabsPage
      tabs={[
        { key: 'instance', label: t('menu.instance'), children: <InstancePage /> },
        { key: 'lineage', label: t('menu.metaLineage'), children: <LineageAnalysisPage /> },
      ]}
    />
  );
}
