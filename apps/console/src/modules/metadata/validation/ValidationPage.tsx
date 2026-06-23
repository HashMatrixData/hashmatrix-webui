import { Alert, Button, Card, List, Space, Table, Tag, Typography } from 'antd';
import type { TableColumnsType } from 'antd';
import { CheckCircleTwoTone, CloseCircleTwoTone, ReloadOutlined } from '@ant-design/icons';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { http } from '@hashmatrix/sdk';
import type { ValidationIssue, ValidationReport } from '@/mocks/validation';
import { RULE_LABEL, RULE_ORDER, SEVERITY_COLOR, SEVERITY_LABEL } from './validationMeta';

interface ValidateResult {
  data: ValidationReport;
}
const VALIDATE_KEY = ['meta-validate'];

/**
 * 一致性校验（元数据管理模块 · 子模块）：编码唯一 / 继承父类存在 / 无循环继承 /
 * 关系端点完整。对应 governance 元模型引擎（Epic #1 / 子 #9）；后端 post-M1，当前 mock。
 */
export function ValidationPage() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const { data: report, isFetching } = useQuery({
    queryKey: VALIDATE_KEY,
    queryFn: async () => (await http.get<ValidateResult>('/api/meta/validate')).data.data,
  });

  const columns: TableColumnsType<ValidationIssue> = [
    {
      title: t('validation.colSeverity'),
      dataIndex: 'severity',
      width: 90,
      render: (s: ValidationIssue['severity']) => (
        <Tag color={SEVERITY_COLOR[s]}>{t(SEVERITY_LABEL[s])}</Tag>
      ),
    },
    {
      title: t('validation.colRule'),
      dataIndex: 'rule',
      width: 160,
      render: (r: ValidationIssue['rule']) => t(RULE_LABEL[r]),
    },
    {
      title: t('validation.colTarget'),
      dataIndex: 'target',
      width: 180,
      render: (v: string) => <Typography.Text code>{v}</Typography.Text>,
    },
    { title: t('validation.colDetail'), dataIndex: 'detail' },
  ];

  // 以问题总数（含未来 warning）判通过，避免新增 warning 规则时漏报。
  const issueCount = report?.issues.length ?? 0;

  return (
    <Space orientation="vertical" size="large" style={{ display: 'flex' }}>
      <Space align="center" style={{ justifyContent: 'space-between', width: '100%' }}>
        <Typography.Title level={3} style={{ margin: 0 }}>
          {t('menu.validation')}
        </Typography.Title>
        <Button
          icon={<ReloadOutlined />}
          loading={isFetching}
          onClick={() => queryClient.invalidateQueries({ queryKey: VALIDATE_KEY })}
        >
          {t('validation.recheck')}
        </Button>
      </Space>
      <Alert type="info" showIcon title={t('validation.mockBadge')} description={t('validation.pageDesc')} />

      {report && (
        <Alert
          type={issueCount === 0 ? 'success' : 'error'}
          showIcon
          title={
            issueCount === 0
              ? t('validation.passTitle')
              : t('validation.failTitle', { errors: issueCount })
          }
          description={t('validation.checkedDesc', { count: report.summary.checked })}
        />
      )}

      <Card title={t('validation.rulesTitle')} size="small">
        <List
          dataSource={RULE_ORDER}
          renderItem={(rule) => {
            const hits = report?.ruleHits[rule] ?? 0;
            return (
              <List.Item>
                <Space>
                  {hits === 0 ? (
                    <CheckCircleTwoTone twoToneColor="#52c41a" />
                  ) : (
                    <CloseCircleTwoTone twoToneColor="#ff4d4f" />
                  )}
                  <span>{t(RULE_LABEL[rule])}</span>
                  <Typography.Text type="secondary">
                    {hits === 0 ? t('validation.rulePass') : t('validation.ruleHit', { count: hits })}
                  </Typography.Text>
                </Space>
              </List.Item>
            );
          }}
        />
      </Card>

      {report && report.issues.length > 0 && (
        <Card title={t('validation.issuesTitle')} size="small" styles={{ body: { padding: 0 } }}>
          <Table<ValidationIssue>
            rowKey="id"
            size="small"
            columns={columns}
            dataSource={report.issues}
            pagination={false}
          />
        </Card>
      )}
    </Space>
  );
}
