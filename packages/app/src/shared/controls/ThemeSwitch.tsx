import { Segmented } from 'antd';
import { SunOutlined, MoonOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useThemeStore, type ThemeMode } from '@/theme';

/** 明暗切换，持久化到 localStorage（见 theme/store）。 */
export function ThemeSwitch() {
  const { t } = useTranslation();
  const mode = useThemeStore((s) => s.mode);
  const setMode = useThemeStore((s) => s.setMode);

  return (
    <Segmented<ThemeMode>
      aria-label={t('theme.label')}
      value={mode}
      onChange={setMode}
      options={[
        { label: t('theme.light'), value: 'light', icon: <SunOutlined /> },
        { label: t('theme.dark'), value: 'dark', icon: <MoonOutlined /> },
      ]}
    />
  );
}
