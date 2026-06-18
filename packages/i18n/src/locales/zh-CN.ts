/** zh-CN 为源语言（见 spec §1）。品牌串（brand.appName/companyName）运行期由白标引擎注入。 */
const zhCN = {
  common: {
    loading: '加载中…',
    confirm: '确定',
    cancel: '取消',
    save: '保存',
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
  menu: {
    dashboard: '数据大屏',
    lineage: '数据血缘',
    orchestration: 'DAG 编排',
    playground: '三开关 Demo',
    governance: '数据治理',
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
  demo: {
    title: '三开关 Demo',
    subtitle: '语言 / 明暗 / 换肤 实时联动',
    primaryColor: '主色',
    secondaryColor: '辅色（强调）',
    sampleButton: '示例按钮',
    sampleCardTitle: '示例卡片',
    sampleCardDesc: '该区域强调色取自 CSS 变量 --brand-secondary，随换肤实时变化。',
  },
  governance: {
    currentRole: '当前角色',
    routeGuardNote: '本页受路由级角色守卫保护（governance:editor / admin）。下方删除按钮受按钮级权限保护（仅 admin）。',
    buttonPermTitle: '按钮级权限示例',
    buttonPermDesc: '无权限时按钮整体不渲染（可改 fallback 显示禁用态）。',
    dangerAction: '危险操作（admin 可见）',
    dangerNeedsAdmin: '需 admin',
    datasetCardTitle: '元数据集（ProTable · 服务端分页）',
  },
  dataset: {
    colId: 'ID',
    colName: '名称',
    colLayer: '分层',
    colOwner: '负责人',
    colRows: '行数',
    colQuality: '质量分',
    syncAdmin: '同步元数据（admin）',
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
  lineage: {
    focusNote: '聚焦节点（dws.agg_daily）描边取品牌强调色；结构色固定。可拖拽/缩放画布。',
  },
  orchestration: {
    statusFixed: '状态色固定：',
    selectedNote: '选中任务描边随品牌强调色。',
  },
  dashboard: {
    datasets: '数据集 / Datasets',
    jobs: '作业 / Jobs',
    quality: '质量达标 / Quality',
  },
};

export default zhCN;
export type Resources = typeof zhCN;
