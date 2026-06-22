import { useMemo, useState } from 'react';
import { App, Button, Card, Descriptions, Empty, Space, Tag, Tree, Typography } from 'antd';
import type { TreeDataNode } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { ModalForm, ProFormText, ProFormTextArea } from '@ant-design/pro-components';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { http, type ApiError } from '@hashmatrix/sdk';
import {
  findClassification,
  type ClassificationNode,
} from '@/mocks/classifications';
import { SCOPE_COLOR, SCOPE_LABEL } from '../shared/metaTags';

interface TreeResult {
  data: ClassificationNode[];
}
interface AddForm {
  name: string;
  displayName: string;
  description?: string;
}
const CLASSIFICATIONS_KEY = ['classifications'];
/** 命名规则：字母开头，仅字母/数字/下划线。 */
const NAME_PATTERN = /^[A-Za-z][A-Za-z0-9_]*$/;

/**
 * 分类树（#6）：多级分类，PLATFORM 预置只读 + TENANT 私有可扩展（#10）。
 * 选中节点查看详情；在选中节点下新增私有子分类（落 TENANT）。
 */
export function ClassificationTree() {
  const { t } = useTranslation();
  const { message } = App.useApp();
  const queryClient = useQueryClient();
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [addOpen, setAddOpen] = useState(false);

  const { data: tree = [] } = useQuery({
    queryKey: CLASSIFICATIONS_KEY,
    queryFn: async () => (await http.get<TreeResult>('/api/meta/classifications')).data.data,
  });

  const selected = useMemo(
    () => (selectedKey ? findClassification(tree, selectedKey) : null),
    [tree, selectedKey],
  );

  const treeData: TreeDataNode[] = useMemo(() => {
    const toNodes = (nodes: ClassificationNode[]): TreeDataNode[] =>
      nodes.map((n) => ({
        key: n.key,
        title: (
          <Space size={4}>
            <span>{n.displayName}</span>
            <Typography.Text type="secondary" style={{ fontSize: 12 }}>
              {n.name}
            </Typography.Text>
            <Tag color={SCOPE_COLOR[n.scope]}>{t(SCOPE_LABEL[n.scope])}</Tag>
          </Space>
        ),
        children: n.children ? toNodes(n.children) : undefined,
      }));
    return toNodes(tree);
  }, [tree, t]);

  const handleAdd = async (values: AddForm): Promise<boolean> => {
    if (!selected) return false;
    try {
      await http.post('/api/meta/classifications', { parentKey: selected.key, ...values });
      message.success(t('classification.addOk'));
      await queryClient.invalidateQueries({ queryKey: CLASSIFICATIONS_KEY });
      return true;
    } catch (err) {
      message.error((err as ApiError).message || t('classification.addFail'));
      return false;
    }
  };

  return (
    <Space align="start" size="large" style={{ display: 'flex', width: '100%' }}>
      <Card
        title={t('classification.treeTitle')}
        size="small"
        style={{ width: 420, flex: '0 0 auto' }}
        extra={
          <ModalForm<AddForm>
            title={t('classification.addTitle')}
            open={addOpen}
            onOpenChange={setAddOpen}
            trigger={
              <Button type="primary" size="small" icon={<PlusOutlined />} disabled={!selected}>
                {t('classification.addChild')}
              </Button>
            }
            width={420}
            modalProps={{ destroyOnHidden: true }}
            onFinish={handleAdd}
          >
            <Typography.Paragraph type="secondary">
              {t('classification.addUnder', { name: selected?.displayName ?? '' })}
            </Typography.Paragraph>
            <ProFormText
              name="name"
              label={t('classification.colName')}
              rules={[
                { required: true, message: t('classification.ruleRequired') },
                { pattern: NAME_PATTERN, message: t('classification.ruleNamePattern') },
              ]}
            />
            <ProFormText
              name="displayName"
              label={t('classification.colDisplayName')}
              rules={[{ required: true, message: t('classification.ruleRequired') }]}
            />
            <ProFormTextArea name="description" label={t('classification.colDescription')} />
          </ModalForm>
        }
      >
        {treeData.length > 0 ? (
          <Tree
            treeData={treeData}
            defaultExpandAll
            selectedKeys={selectedKey ? [selectedKey] : []}
            onSelect={(keys) => setSelectedKey(keys.length ? String(keys[0]) : null)}
          />
        ) : (
          <Empty />
        )}
      </Card>

      <Card title={t('classification.detailTitle')} size="small" style={{ flex: 1, minWidth: 280 }}>
        {selected ? (
          <Descriptions column={1} size="small">
            <Descriptions.Item label={t('classification.colName')}>
              <Typography.Text code>{selected.name}</Typography.Text>
            </Descriptions.Item>
            <Descriptions.Item label={t('classification.colDisplayName')}>
              {selected.displayName}
            </Descriptions.Item>
            <Descriptions.Item label={t('classification.colScope')}>
              <Tag color={SCOPE_COLOR[selected.scope]}>{t(SCOPE_LABEL[selected.scope])}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label={t('classification.colKey')}>
              <Typography.Text code>{selected.key}</Typography.Text>
            </Descriptions.Item>
            <Descriptions.Item label={t('classification.colDescription')}>
              {selected.description ?? t('classification.empty')}
            </Descriptions.Item>
          </Descriptions>
        ) : (
          <Empty description={t('classification.selectHint')} />
        )}
      </Card>
    </Space>
  );
}
