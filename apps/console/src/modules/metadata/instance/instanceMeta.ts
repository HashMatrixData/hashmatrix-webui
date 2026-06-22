import type { ParseKeys } from 'i18next';
import type { InstanceStatus } from '@/mocks/instances';

// 作用域映射复用 shared（DRY）。
export { SCOPE_COLOR, SCOPE_LABEL } from '../shared/metaTags';

export const INSTANCE_STATUS_COLOR: Record<InstanceStatus, string> = {
  ACTIVE: 'green',
  DEPRECATED: 'default',
};
export const INSTANCE_STATUS_LABEL: Record<InstanceStatus, ParseKeys> = {
  ACTIVE: 'instance.status.active',
  DEPRECATED: 'instance.status.deprecated',
};
