import type { ReactNode } from 'react';
import { Tabs } from 'antd';
import { useSearchParams } from 'react-router-dom';

export interface MetadataTab {
  key: string;
  label: ReactNode;
  children: ReactNode;
}

/**
 * 元数据管理分组页外壳：用 Tabs 承载分组内各子页面，activeKey 与 URL `?tab=` 同步（可深链）。
 * 子页面懒渲染（antd Tabs 默认仅渲染激活页），避免一次拉起分组内全部子页的请求。
 */
export function MetadataTabsPage({ tabs }: { tabs: MetadataTab[] }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const active = searchParams.get('tab') ?? tabs[0]?.key;

  return (
    <Tabs
      activeKey={active}
      onChange={(key) => setSearchParams({ tab: key })}
      destroyOnHidden
      items={tabs}
    />
  );
}
