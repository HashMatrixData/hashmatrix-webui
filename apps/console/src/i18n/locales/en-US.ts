import type { ConsoleResources } from './zh-CN';

const consoleEnUS: ConsoleResources = {
  menu: {
    dashboard: 'Dashboard',
    lineage: 'Data Lineage',
    orchestration: 'DAG Orchestration',
    playground: 'Three-Switch Demo',
    governance: 'Data Governance',
    metadata: 'Metadata',
    metamodel: 'Metamodel',
  },
  demo: {
    title: 'Three-Switch Demo',
    subtitle: 'Language / Dark / Skin in real time',
    primaryColor: 'Primary',
    secondaryColor: 'Secondary (accent)',
    sampleButton: 'Sample button',
    sampleCardTitle: 'Sample card',
    sampleCardDesc: 'The accent here reads CSS variable --brand-secondary and updates live on skin change.',
  },
  governance: {
    currentRole: 'Current role',
    routeGuardNote:
      'This page is protected by a route-level role guard (governance:editor / admin). The delete button below is protected by button-level permission (admin only).',
    buttonPermTitle: 'Button-level permission example',
    buttonPermDesc: 'Hidden entirely without permission (swap fallback to show a disabled state).',
    dangerAction: 'Danger action (admin only)',
    dangerNeedsAdmin: 'admin required',
    datasetCardTitle: 'Datasets (ProTable · server-side pagination)',
  },
  dataset: {
    colId: 'ID',
    colName: 'Name',
    colLayer: 'Layer',
    colOwner: 'Owner',
    colRows: 'Rows',
    colQuality: 'Quality',
    syncAdmin: 'Sync metadata (admin)',
  },
  metamodel: {
    mockBadge: 'Mock data · metamodel engine is post-M1',
    pageDesc:
      'Define inheritable metaclasses (TypeDef), attributes and cardinality, with platform/tenant scope and draft→published lifecycle. The backend engine is under construction; data is mocked for now.',
    listCardTitle: 'Metaclasses (TypeDef · server-side pagination)',
    searchPlaceholder: 'Search code / name',
    colName: 'Code',
    colDisplayName: 'Name',
    colCategory: 'Category',
    colSuperTypes: 'Inherits',
    colScope: 'Scope',
    colStatus: 'Status',
    colVersion: 'Version',
    colAttrs: 'Attrs',
    colDescription: 'Description',
    detailTitle: 'Metaclass detail',
    attrsTitle: 'Attribute definitions',
    attrName: 'Attribute',
    attrType: 'Type',
    attrRequired: 'Required',
    attrUnique: 'Unique',
    attrCardinality: 'Cardinality',
    attrDefault: 'Default',
    yes: 'Yes',
    no: 'No',
    empty: '—',
    category: {
      entity: 'Entity',
      classification: 'Classification',
      relationship: 'Relationship',
    },
    scope: {
      platform: 'Platform',
      tenant: 'Tenant',
    },
    status: {
      draft: 'Draft',
      published: 'Published',
    },
  },
  lineage: {
    focusNote:
      'The focused node (dws.agg_daily) uses the brand accent for its border; structural colors are fixed. Drag / zoom the canvas.',
  },
  orchestration: {
    statusFixed: 'Status colors are fixed:',
    selectedNote: 'The selected task border follows the brand accent.',
  },
  dashboard: {
    datasets: 'Datasets',
    jobs: 'Jobs',
    quality: 'Quality',
  },
};

export default consoleEnUS;
