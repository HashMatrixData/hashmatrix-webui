import type { ParseKeys } from 'i18next';
import type { ValidationRule, ValidationSeverity } from '@/mocks/validation';

export const SEVERITY_COLOR: Record<ValidationSeverity, string> = {
  ERROR: 'red',
  WARNING: 'orange',
};
export const SEVERITY_LABEL: Record<ValidationSeverity, ParseKeys> = {
  ERROR: 'validation.severity.error',
  WARNING: 'validation.severity.warning',
};

export const RULE_LABEL: Record<ValidationRule, ParseKeys> = {
  UNIQUE_CODE: 'validation.rule.uniqueCode',
  SUPER_EXISTS: 'validation.rule.superExists',
  NO_CYCLE: 'validation.rule.noCycle',
  REL_ENDPOINT: 'validation.rule.relEndpoint',
};

/** 规则展示顺序（校验清单）。 */
export const RULE_ORDER: ValidationRule[] = ['UNIQUE_CODE', 'SUPER_EXISTS', 'NO_CYCLE', 'REL_ENDPOINT'];
