/**
 * 基础命名空间（两 app 共享）：通用文案 + 语言/主题/换肤控件 + 鉴权壳。
 * 各 app 在此基线上叠加自有命名空间（console: menu/demo/...；admin: menu/tenant/...）。
 * 品牌串（brand.appName/companyName）运行期由白标引擎注入。
 */
const baseZhCN = {
  common: {
    loading: '加载中…',
    confirm: '确定',
    cancel: '取消',
    save: '保存',
    loadError: '数据加载失败，请稍后重试',
    poweredBy: '由 {{companyName}} 提供',
  },
  language: {
    label: '语言',
    'zh-CN': '简体中文',
    'en-US': 'English',
  },
  theme: {
    label: '主题',
    light: '浅色',
    dark: '深色',
    skin: '换肤',
  },
  brand: {
    preset: {
      label: '品牌主题',
      default: '默认蓝',
      violet: '紫玫',
      forest: '森野',
      sunset: '日暮',
    },
  },
  auth: {
    signIn: '登录',
    signOut: '退出登录',
    signingIn: '正在跳转登录…',
    signedInAs: '当前用户：{{name}}',
    unauthorized: '无访问权限',
    unauthorizedDesc: '当前账号缺少访问该页面的角色。',
    loginRequired: '请先登录以访问控制台。',
    misconfiguredTitle: '鉴权未配置',
    misconfiguredDesc: '生产部署需在运行期 config.js 注入 oidc.authority（见 deploy/README.md）。未配置时不授予任何访问权限。',
  },
};

export default baseZhCN;
export type BaseResources = typeof baseZhCN;
