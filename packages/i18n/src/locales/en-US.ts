import type { Resources } from './zh-CN';

const enUS: Resources = {
  common: {
    loading: 'Loading…',
    confirm: 'OK',
    cancel: 'Cancel',
    save: 'Save',
    poweredBy: 'Powered by {{companyName}}',
  },
  language: {
    label: 'Language',
    'zh-CN': '简体中文',
    'en-US': 'English',
  },
  theme: {
    label: 'Theme',
    light: 'Light',
    dark: 'Dark',
    skin: 'Skin',
  },
  menu: {
    dashboard: 'Dashboard',
    lineage: 'Data Lineage',
    orchestration: 'DAG Orchestration',
    playground: 'Three-Switch Demo',
    governance: 'Data Governance',
  },
  brand: {
    preset: {
      label: 'Brand theme',
      default: 'Default Blue',
      violet: 'Violet',
      forest: 'Forest',
      sunset: 'Sunset',
    },
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
  auth: {
    signIn: 'Sign in',
    signOut: 'Sign out',
    signingIn: 'Redirecting to sign in…',
    signedInAs: 'Signed in as {{name}}',
    unauthorized: 'Not authorized',
    unauthorizedDesc: 'This account lacks the role required to view this page.',
    loginRequired: 'Please sign in to access the console.',
    misconfiguredTitle: 'Authentication not configured',
    misconfiguredDesc:
      'Production deployment must inject oidc.authority at runtime via config.js (see deploy/README.md). No access is granted when unconfigured.',
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

export default enUS;
