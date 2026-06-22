import type { ParseKeys } from 'i18next';
import type {
  AnomalyKind,
  AnomalySeverity,
  ChangeKind,
  RunStatus,
  SourceStatus,
} from '@/mocks/collect';

export const SOURCE_STATUS_COLOR: Record<SourceStatus, string> = {
  CONNECTED: 'green',
  ERROR: 'red',
};
export const SOURCE_STATUS_LABEL: Record<SourceStatus, ParseKeys> = {
  CONNECTED: 'collect.sourceStatus.connected',
  ERROR: 'collect.sourceStatus.error',
};

export const RUN_STATUS_COLOR: Record<RunStatus, string> = {
  SUCCESS: 'green',
  ANOMALY: 'orange',
};
export const RUN_STATUS_LABEL: Record<RunStatus, ParseKeys> = {
  SUCCESS: 'collect.runStatus.success',
  ANOMALY: 'collect.runStatus.anomaly',
};

export const CHANGE_KIND_COLOR: Record<ChangeKind, string> = {
  ADDED: 'green',
  REMOVED: 'red',
  CHANGED: 'blue',
};
export const CHANGE_KIND_LABEL: Record<ChangeKind, ParseKeys> = {
  ADDED: 'collect.change.added',
  REMOVED: 'collect.change.removed',
  CHANGED: 'collect.change.changed',
};

export const SEVERITY_COLOR: Record<AnomalySeverity, string> = {
  HIGH: 'red',
  MID: 'orange',
};
export const SEVERITY_LABEL: Record<AnomalySeverity, ParseKeys> = {
  HIGH: 'collect.severity.high',
  MID: 'collect.severity.mid',
};

export const ANOMALY_KIND_LABEL: Record<AnomalyKind, ParseKeys> = {
  BULK_DROP: 'collect.anomaly.bulkDrop',
  SCHEMA_SHIFT: 'collect.anomaly.schemaShift',
  TYPE_CONFLICT: 'collect.anomaly.typeConflict',
};
