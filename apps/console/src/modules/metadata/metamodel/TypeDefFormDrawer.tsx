import { App } from 'antd';
import {
  DrawerForm,
  ProFormText,
  ProFormTextArea,
  ProFormSelect,
  ProFormList,
  ProFormSwitch,
  ProFormGroup,
} from '@ant-design/pro-components';
import { useTranslation } from 'react-i18next';
import { http, type ApiError } from '@hashmatrix/sdk';
import type { AttributeType, Cardinality, TypeDef, TypeDefInput } from '@/mocks/typedefs';
import { CATEGORY_LABEL } from './metamodelMeta';

interface TypeDefFormDrawerProps {
  open: boolean;
  /** edit：传入待编辑元类（仅 TENANT 作用域）；create：null。 */
  editing: TypeDef | null;
  /** 现有元类编码，用于「编码唯一」前端校验（#9）。 */
  existingNames: string[];
  /** 可作为父类（superType）的候选元类编码。 */
  superTypeOptions: string[];
  onOpenChange: (open: boolean) => void;
  /** 保存成功后回调（触发表格 reload）。 */
  onSaved: () => void;
}

const ATTRIBUTE_TYPES: AttributeType[] = ['string', 'int', 'long', 'boolean', 'date', 'float', 'enum'];
const CARDINALITIES: Cardinality[] = ['SINGLE', 'LIST', 'SET'];
/** 编码命名规则：字母开头，仅字母/数字/下划线。 */
const NAME_PATTERN = /^[A-Za-z][A-Za-z0-9_]*$/;

/**
 * 元类新建/编辑表单（DrawerForm）：编码/名称/类别/superType 继承/属性定义。
 * 前端一致性校验（#9 面）：编码唯一 + 必填 + 命名规则；作用域/状态由「服务端」派生（#10/#8）。
 */
export function TypeDefFormDrawer({
  open,
  editing,
  existingNames,
  superTypeOptions,
  onOpenChange,
  onSaved,
}: TypeDefFormDrawerProps) {
  const { t } = useTranslation();
  const { message } = App.useApp();
  const isEdit = editing !== null;

  const categoryOptions = (['ENTITY', 'CLASSIFICATION', 'RELATIONSHIP'] as const).map((c) => ({
    label: t(CATEGORY_LABEL[c]),
    value: c,
  }));

  const handleFinish = async (values: TypeDefInput): Promise<boolean> => {
    const payload: TypeDefInput = {
      name: values.name,
      displayName: values.displayName,
      category: values.category,
      superTypes: values.superTypes ?? [],
      description: values.description,
      attributeDefs: values.attributeDefs ?? [],
    };
    try {
      if (isEdit) {
        await http.put(`/api/meta/typedefs/${editing.name}`, payload);
      } else {
        await http.post('/api/meta/typedefs', payload);
      }
      message.success(t('metamodel.saveOk'));
      onSaved();
      return true;
    } catch (err) {
      const apiError = err as ApiError;
      message.error(apiError.message || t('metamodel.saveFail'));
      return false;
    }
  };

  return (
    <DrawerForm<TypeDefInput>
      open={open}
      onOpenChange={onOpenChange}
      title={t(isEdit ? 'metamodel.formEditTitle' : 'metamodel.formCreateTitle')}
      width={680}
      // edit 用 key 强制重挂载以载入 initialValues；create 用空表单。
      key={editing?.name ?? '__new__'}
      drawerProps={{ destroyOnHidden: true }}
      initialValues={
        editing ?? { category: 'ENTITY', superTypes: [], attributeDefs: [] }
      }
      onFinish={handleFinish}
    >
      <ProFormText
        name="name"
        label={t('metamodel.colName')}
        tooltip={t('metamodel.nameTip')}
        disabled={isEdit}
        rules={[
          { required: true, message: t('metamodel.ruleRequired') },
          { pattern: NAME_PATTERN, message: t('metamodel.ruleNamePattern') },
          {
            // 即时提示，非权威：existingNames 仅当前页；唯一性最终由后端 409 裁决（见 handler）。
            validator: (_, value: string) =>
              !isEdit && value && existingNames.includes(value)
                ? Promise.reject(new Error(t('metamodel.ruleNameDup')))
                : Promise.resolve(),
          },
        ]}
      />
      <ProFormText
        name="displayName"
        label={t('metamodel.colDisplayName')}
        rules={[{ required: true, message: t('metamodel.ruleRequired') }]}
      />
      <ProFormSelect
        name="category"
        label={t('metamodel.colCategory')}
        options={categoryOptions}
        rules={[{ required: true, message: t('metamodel.ruleRequired') }]}
      />
      <ProFormSelect
        name="superTypes"
        label={t('metamodel.colSuperTypes')}
        mode="multiple"
        tooltip={t('metamodel.superTypesTip')}
        options={superTypeOptions
          .filter((n) => n !== editing?.name)
          .map((n) => ({ label: n, value: n }))}
      />
      <ProFormTextArea name="description" label={t('metamodel.colDescription')} />

      <ProFormList
        name="attributeDefs"
        label={t('metamodel.attrsTitle')}
        creatorButtonProps={{ creatorButtonText: t('metamodel.addAttr') }}
        copyIconProps={false}
      >
        <ProFormGroup>
          <ProFormText
            name="name"
            label={t('metamodel.attrName')}
            rules={[{ required: true, message: t('metamodel.ruleRequired') }]}
          />
          <ProFormSelect
            name="type"
            label={t('metamodel.attrType')}
            options={ATTRIBUTE_TYPES.map((v) => ({ label: v, value: v }))}
            rules={[{ required: true, message: t('metamodel.ruleRequired') }]}
          />
          <ProFormSelect
            name="cardinality"
            label={t('metamodel.attrCardinality')}
            options={CARDINALITIES.map((v) => ({ label: v, value: v }))}
            rules={[{ required: true, message: t('metamodel.ruleRequired') }]}
          />
          <ProFormSwitch name="required" label={t('metamodel.attrRequired')} />
          <ProFormSwitch name="unique" label={t('metamodel.attrUnique')} />
          <ProFormText name="defaultValue" label={t('metamodel.attrDefault')} />
        </ProFormGroup>
      </ProFormList>
    </DrawerForm>
  );
}
