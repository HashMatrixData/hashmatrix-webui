# hashmatrix-webui

> hashmatrix 数据中台子模块 · 所属：接入层（全站唯一前端）
>
> 主仓：[HashMatrixData/hashmatrix](https://github.com/HashMatrixData/hashmatrix)

## 角色与位置（一眼看懂）

- **所属**：接入层 · **平台唯一前端工程**（其余 submodule 均为无界面后端服务）。
- **一句话**：用户与平台的唯一入口——统一控制台 + 数据大屏 + 可视化编排前端。
- **调用流**：浏览器 → **webui(SPA)** → 网关(APISIX) → 各分系统 API。

## 职责与边界

- **做**：控制台 UI（布局/表格/表单）、数据大屏、血缘/DAG/ER 画布、白标换肤、i18n、明暗主题、登录壳（OIDC）。
- **不做（边界）**：业务逻辑在后端各分系统；重型专业 UI（BI 报表设计器 `tools-bi`、隐私计算台 `privacy`）**集成纳入**而非自研重建；取数经网关到各服务。

## 骨架技术选型（已定稿，详见 `docs/00-前端初始化-spec.md`）

| 维度 | 选型 |
|--|--|
| 框架 / 构建 | React 19 + TypeScript(strict) + Vite SPA（pnpm workspaces） |
| UI / 白标 | Ant Design v6 + ProComponents（design token 驱动换肤） |
| 画布 | AntV X6（DAG/ER）· G6（血缘）· G2（图表）· S2（透视） |
| i18n / 主题 | react-i18next（zh/en）+ AntD 明暗算法 + CSS Vars |
| 数据 / 鉴权 | TanStack Query + Zustand + Keycloak OIDC |
| 调试 / 测试 | Storybook + Playwright(基于 Storybook) + Vitest |

## 产品形态与多租户（北极星）

**双模交付**：公网 SaaS（我们运营 · 统一**我们品牌** · 租户=企业）／私有化部署（客户环境 · **客户品牌**部署级 · 租户=客户部门）。品牌**部署级**、不按租户运行期换肤。多租户走 **C 分层桥接**：控制平面共享 + 数据平面按租户隔离（Keycloak Organizations 单 realm · schema/db-per-tenant · namespace-per-tenant），由 `control-plane` 编排开通。

**本仓视角**：品牌经 `config.js` 部署级注入、**不按租户换肤**；UI 始终在租户上下文下渲染。

> 详见主仓 `docs/00-主仓初始化-spec.md`、`docs/architecture/05-多租户与控制平面.md`。

## 说明

本仓库作为 `hashmatrix` 主仓的 git submodule，挂载于 `services/webui`。架构背景见主仓 `docs/architecture/`。

## License

Apache-2.0
