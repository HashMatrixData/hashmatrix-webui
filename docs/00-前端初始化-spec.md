# hashmatrix-webui 前端初始化 Spec

> 状态：**已确认**（经 `/interview` 逐项敲定）。据此初始化脚手架。
> 红线：本文件公开开源，仅含通用技术选型与产品决策，**不含任何甲方信息**。

## 0. 目标与范围

数据治理 / 数据中台的**全站统一前端控制台**（含 WebUI、数据大屏、可视化编排前端）。WebUI 是本平台**唯一前端工程**——其余 submodule（governance / security / tools-bi / privacy / data-foundation / gateway / platform-common）均为无界面后端服务。本轮只做**技术选型 + 初始化脚手架**，不实现业务功能。

### 三条硬约束

1. **品牌可配置化（白标 / OEM）**：Logo / 主色 / 辅色 / 品牌名 / 企业名低成本替换，配置驱动，运行期免重建换肤。
2. **i18n + light/dark**：从架构起就纳入。
3. **画布能力**：数据治理画布（血缘 / DAG 编排 / ER / 大屏）为核心竞争力，原生自研。

---

## 1. 最终技术栈

| 维度 | 选型 |
|------|------|
| 语言 | **TypeScript（strict）** |
| 框架 | **React 19** |
| 构建/形态 | **Vite SPA 单应用**（控制台 + 大屏同一应用，无 SSR） |
| UI 库 | **Ant Design v6 + ProComponents**（ProLayout / ProTable / ProForm） |
| 画布 | **AntV X6**（DAG 编排 / ER）+ **AntV G6**（血缘 / 关系图谱）+ **G2**（图表）+ **S2**（透视表/数据预览） |
| i18n | **react-i18next** + AntD `locale`；zh-CN 为源 + en-US；含日期/数字/时区本地化 |
| 主题 | AntD `defaultAlgorithm`/`darkAlgorithm` + CSS Variables；明暗系统/手动切换并持久化 |
| 路由 | React Router v7；按模块路由懒加载 |
| 服务端状态 | TanStack Query |
| 客户端状态 | Zustand |
| 请求 | axios（拦截器统一鉴权注入 / 错误处理 / 租户头） |
| 鉴权 | Keycloak OIDC（react-oidc-context + oidc-client-ts），对接网关，见架构 `docs/architecture/02` |
| 字体 | **系统中文字体栈优先**（零版权风险、信创离线友好），预留客户自备商用字体槽位 |
| 工程 | **pnpm workspaces** + ESLint(flat) + Prettier |
| 调试/可视化 | **Storybook**（Vite builder）：每个组件 + 关键页面建 story，工程师可独立参与调试；msw 提供 mock 数据使 story 自含 |
| 测试 | Vitest + Testing Library（单测）+ **Playwright 跑在 Storybook 之上**（story 即测试夹具，`@storybook/test-runner`，免准备后端环境即可做 E2E） |
| 部署 | 静态产物 → Nginx 容器，挂网关后；运行期 `config.js` 注入 |

---

## 2. 决策记录（关键取舍）

| # | 决策 | 选定 | 备注 |
|---|------|------|------|
| D1 | 框架 | React 19 | AntD v6 token 换肤最成熟 + 画布生态最全 |
| D2 | 运行形态 | Vite SPA 单应用 | 内部鉴权控制台 + 大屏同应用，无 SSR 刚需 |
| D3 | 白标交付 | **构建期默认 + 运行期覆盖** | 一份镜像多处部署，改 `config.js` 即换肤免重建 |
| D4 | 画布范围 v1 | 血缘 / DAG / ER / 大屏**全部原生自研** | **上游做引擎/API，画布 UI 全自研** |
| D5 | 集成策略 | **混合：核心自研 + 重型集成** | 见下方集成矩阵 |
| D6 | 组件库 | AntD 全家桶 + ProComponents | 与 token 白标体系天然对齐 |
| — | 白标深度 | **品牌层起步**（logo/favicon + 品牌名/企业名 + 主辅色） | 架构预留可升级到全 token |
| — | 信创约束 | **国产浏览器/旧内核兼容 + 国产 OS 适配** | 运行期不依赖公网 CDN（资源自托管）；npm 私服离线为后续专项 |
| — | 权限粒度 | **路由级 + 按钮级** | 与 Keycloak 角色映射 |
| — | 大屏适配 | **等比缩放 scale**（基准分辨率） | 投屏/拼接屏/4K |
| — | 画布主题 | **结构/语义色固定 + 强调色随品牌** | 状态色保可读，高亮/选中随主色 |
| — | 配置注入 | **部署期写 `config.js`**（`window.__CONFIG__`） | Nginx 容器 env 渲染，含 brand/API 地址/OIDC |
| — | 调试/可视化 | **Storybook**（组件 + 关键页面 story；msw mock 自含） | 工程师独立参与调试，免起全栈环境 |
| — | 质量门 | CI = lint + 单测 + Storybook 构建 + **Playwright(基于 Storybook) E2E** + build；code-reviewer 子代理工程师**酌情**用（非强制门控） | E2E 以 story 为夹具，免备后端环境 |
| — | 微前端 | **预留接口不上**（pnpm 分包 + 路由懒加载保持可演进边界） | Module Federation/无界 后置 |
| — | 可观测 | **预留接口默认关**（内网可接自托管 GlitchTip/Sentry） | |
| — | 大数据量表格 | **服务端分页 + 虚拟滚动** | 元数据/字段/质量规则常达数十万~百万行 |

---

## 3. 集成矩阵（D5 落地）

> 原则：**上游产品做引擎/API，重型专业 UI 集成纳入（品牌化外框），核心流程与画布原生自研。**

| 能力 | 上游（引擎/API） | 前端 UI 策略 |
|------|-----------------|-------------|
| 元数据 / 数据血缘 | OpenMetadata | **原生自研**（血缘 G6 + 元数据管理） |
| 作业编排 / 调度 | DolphinScheduler | 上游引擎 + **原生 DAG 编排画布（X6）** |
| 数据大屏 | 取数 API | **原生大屏编辑器**（scale 容器 + G2） |
| BI / 报表 | DataEase / Superset | 报表设计器**集成纳入**（iframe + SSO + 品牌化外框）；取数 API 复用 |
| 隐私计算 | 隐语 SecretFlow / SecretPad | **集成纳入**（iframe + SSO + 品牌化外框） |
| 数据治理 / 安全 / 数据基础 核心流程 | 平台自研后端 | **原生自研** |

---

## 4. 白标引擎设计（约束 1 核心）

**单一品牌配置源**，构建期默认 + 运行期覆盖：

- 默认：`packages/app/src/brand/brand.default.json`
- 运行期覆盖：`packages/app/public/config.js` → `window.__CONFIG__.brand`（容器启动由 env 渲染）

**brand 字段（品牌层）**：`appName`（品牌名）、`companyName`（企业名）、`logo`（亮/暗/favicon 槽位）、`colorPrimary`（主色）、`colorSecondary`（辅色/强调色），预留 `fontFamily` 槽位。

**一处配置，四路分发**：

1. **AntD `ConfigProvider`**：`theme.token.colorPrimary ← brand.colorPrimary`（组件全量换肤）。
2. **CSS Variables**：`--brand-primary` / `--brand-secondary` 注入 `:root`，供非 AntD 区域（画布强调色、自研组件）消费。
3. **i18n 品牌串**：`appName`/`companyName` 注入 i18n resources，文案用占位引用（同时满足换肤 + 多语言）。
4. **资源槽位**：logo / favicon 运行期替换（指向 `public/brand/`）。

**画布消费**：画布只取 `--brand-secondary`（强调/选中/高亮），结构色与状态语义色（成功/错误/警告）固定，保证可读性（呼应画布主题决策）。

**换肤流程**：改 `public/config.js`（容器挂载/env 渲染）→ 刷新即生效，**无需重新构建**。

---

## 5. 目录结构（提案）

```
hashmatrix-webui/
├─ pnpm-workspace.yaml
├─ package.json
├─ packages/
│  └─ app/                          # 主控制台 SPA
│     ├─ index.html
│     ├─ vite.config.ts             # build target 降级以兼容国产旧内核
│     ├─ .storybook/                # Storybook(Vite builder) + test-runner 配置
│     ├─ public/
│     │  ├─ config.js               # 运行期 window.__CONFIG__ (brand/api/oidc)
│     │  └─ brand/                  # logo/favicon 资源槽位
│     ├─ src/
│     │  ├─ main.tsx
│     │  ├─ app/                    # Provider 装配 + 路由
│     │  ├─ brand/                  # 白标引擎: config → token/CSS var/i18n/资源
│     │  ├─ theme/                  # AntD algorithm + 明暗 + CSS Vars
│     │  ├─ i18n/                   # react-i18next, zh-CN/en-US 命名空间
│     │  ├─ auth/                   # Keycloak OIDC + 路由守卫
│     │  ├─ layout/                 # ProLayout 壳(导航 + 品牌位 + 语言/明暗/租户切换)
│     │  ├─ canvas/                 # X6/G6 封装(lineage/dag/er) + 大屏 scale 容器
│     │  ├─ modules/               # feature 模块(governance/security/data-foundation 自研)
│     │  ├─ integration/           # 第三方集成(iframe+SSO 品牌化外框: bi/privacy)
│     │  ├─ shared/                # 组件/hooks/请求封装/权限(路由级+按钮级)；组件同级放 *.stories.tsx
│     │  ├─ mocks/                 # msw handlers，供 story / E2E 自含数据
│     │  └─ routes/
│     └─ tests/                     # vitest(单测) + playwright(跑在 Storybook 之上)
├─ deploy/                          # Dockerfile + nginx.conf + config.js 模板
└─ docs/
```

---

## 6. 落定后执行项（脚手架阶段）

1. 初始化：pnpm workspaces + Vite + React 19 + TS(strict) + AntD v6 + ProComponents；Vite `build.target` 降级兼容国产旧内核。
2. 白标引擎骨架：`brand.default.json` + 运行期 `config.js`（`window.__CONFIG__`）→ token / CSS var / i18n / 资源槽位映射。
3. i18n（zh-CN/en-US）+ 明暗主题 + **三开关 demo**（语言 / 明暗 / 换肤）打通。
4. Keycloak OIDC 登录壳 + ProLayout 导航 + 路由级/按钮级权限骨架。
5. 画布封装样例：血缘（G6）+ DAG 编排（X6）各一个最小可运行 demo，强调色随品牌。
6. 数据大屏 `scale` 自适应容器 demo（G2 图表）。
7. **Storybook**：接入 Vite builder；为已建组件 + 关键页面补 story；msw 提供 mock 数据使 story 自含。
8. **E2E**：`@storybook/test-runner`（Playwright）跑在 Storybook 之上，story 即夹具，免备后端环境。
9. CI：lint + Vitest + Storybook 构建 + Playwright(基于 Storybook) E2E + build；`deploy/`（Dockerfile + nginx + `config.js` 模板）。
10. 更新 README / CLAUDE.md 技术栈段；提交推送；记忆落档。

## 7. 暂缓 / 后续专项（已记录，不入 v1）

- 全内网离线 npm 私服（verdaccio/nexus）与供应链锁版本流程。
- 微前端运行时（Module Federation / 无界 / qiankun）——仅保留可演进边界。
- 前端可观测自托管（GlitchTip / Sentry）——预留接口默认关。
- 白标深度升级到全 design token（圆角/字体/间距/密度）与多预设主题包。
- 字段级 / 数据行级前端权限（多租户数据隔离的前端表达）。
