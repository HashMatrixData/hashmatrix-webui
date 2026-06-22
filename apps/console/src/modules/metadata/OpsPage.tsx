import { useTranslation } from 'react-i18next';
import { MetadataTabsPage } from './MetadataTabsPage';
import { CollectPage } from './collect/CollectPage';
import { EventsPage } from './events/EventsPage';

/**
 * 采集与事件（集成/运行观测平面）：采集衔接 / 变更事件，归为一个 Tab 工作台。
 */
export function OpsPage() {
  const { t } = useTranslation();
  return (
    <MetadataTabsPage
      tabs={[
        { key: 'collect', label: t('menu.collect'), children: <CollectPage /> },
        { key: 'events', label: t('menu.events'), children: <EventsPage /> },
      ]}
    />
  );
}
