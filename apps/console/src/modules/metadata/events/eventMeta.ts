import type { ParseKeys } from 'i18next';
import type { EventType } from '@/mocks/events';

export const EVENT_TYPE_COLOR: Record<EventType, string> = {
  'model.changed': 'blue',
  'collect.anomaly': 'orange',
  'instance.changed': 'green',
};
export const EVENT_TYPE_LABEL: Record<EventType, ParseKeys> = {
  'model.changed': 'events.type.modelChanged',
  'collect.anomaly': 'events.type.collectAnomaly',
  'instance.changed': 'events.type.instanceChanged',
};
