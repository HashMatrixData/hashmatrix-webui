import type { BaseResources } from './zh-CN';

const baseEnUS: BaseResources = {
  common: {
    loading: 'Loading…',
    confirm: 'OK',
    cancel: 'Cancel',
    save: 'Save',
    loadError: 'Failed to load data. Please try again.',
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
  brand: {
    preset: {
      label: 'Brand theme',
      default: 'Default Blue',
      violet: 'Violet',
      forest: 'Forest',
      sunset: 'Sunset',
    },
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
};

export default baseEnUS;
