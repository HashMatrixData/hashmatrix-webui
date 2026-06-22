import { useTranslation } from 'react-i18next';
import { MetadataTabsPage } from './MetadataTabsPage';
import { MetamodelPage } from './metamodel/MetamodelPage';
import { RelationshipPage } from './relationship/RelationshipPage';
import { ClassificationPage } from './classification/ClassificationPage';
import { ValidationPage } from './validation/ValidationPage';
import { TemplatesPage } from './templates/TemplatesPage';

/**
 * 元模型设计器（建模平面）：元模型 / 关系 / 分类 / 校验 / 模板，归为一个工作台的多个 Tab。
 */
export function ModelingPage() {
  const { t } = useTranslation();
  return (
    <MetadataTabsPage
      tabs={[
        { key: 'metamodel', label: t('menu.metamodel'), children: <MetamodelPage /> },
        { key: 'relationship', label: t('menu.relationship'), children: <RelationshipPage /> },
        { key: 'classification', label: t('menu.classification'), children: <ClassificationPage /> },
        { key: 'validation', label: t('menu.validation'), children: <ValidationPage /> },
        { key: 'templates', label: t('menu.templates'), children: <TemplatesPage /> },
      ]}
    />
  );
}
