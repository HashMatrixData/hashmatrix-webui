import { Segmented } from 'antd';
import { TranslationOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { SUPPORTED_LANGUAGES, type AppLanguage } from '@hashmatrix/i18n';

function isSupportedLanguage(lng: string): lng is AppLanguage {
  return (SUPPORTED_LANGUAGES as readonly string[]).includes(lng);
}

/** 语言切换（zh-CN / en-US），变更持久化由 i18next LanguageDetector 处理。 */
export function LanguageSwitch() {
  const { t, i18n } = useTranslation();
  const current: AppLanguage = isSupportedLanguage(i18n.language) ? i18n.language : 'zh-CN';

  return (
    <Segmented
      aria-label={t('language.label')}
      value={current}
      onChange={(value) => void i18n.changeLanguage(value as string)}
      options={SUPPORTED_LANGUAGES.map((lng) => ({
        label: t(`language.${lng}`),
        value: lng,
        icon: <TranslationOutlined />,
      }))}
    />
  );
}
