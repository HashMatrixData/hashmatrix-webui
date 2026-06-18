# CLAUDE.md — hashmatrix-webui 协作与合规指引

本文件为 Claude Code 及所有协作者在本仓库工作的**强制约束**。违反「信息红线」的内容一律不得提交。

## 🔴 信息红线（强制 · 不可协商）

本仓库为**公开开源仓库**。所有内容（代码、注释、文档、配置样例、提交信息、Issue/PR、分支与标签名）必须满足：

1. **禁止出现任何甲方/客户可识别信息**，包括但不限于：真实单位名称/简称/品牌、人员姓名或账号、招标/合同/立项编号、内部项目代号、甲方专有业务术语、真实数据、具体部署地点、客户网络或系统拓扑。
2. **禁止透漏任何项目机密**：商务/合同条款、里程碑与报价、验收细节、甲方环境参数、真实业务数据样本。
3. **仅允许记录可面向大众公开的内容**：通用技术方案、代码实现、系统架构与产品决策、开源组件选型、通用工程最佳实践。
4. **示例/测试数据一律虚构脱敏**，使用通用占位（如 `example.com`、`acme`、`tenant-demo`），严禁使用任何真实甲方数据。
5. **敏感原始资料一律置于 `.gitignore`、不得入库**（仅本地留存）。

> 判定标准：把本仓任意文件公开到互联网，不会泄露任何客户身份或项目机密。不确定时一律按「不写入」处理。

## 提交前自检（每次 commit / PR 必过）

- [ ] 无甲方名称 / 编号 / 代号 / 人员 / 地点等可识别信息
- [ ] 无商务 / 合同 / 验收 / 报价等项目机密
- [ ] 示例数据均为虚构 / 脱敏
- [ ] 敏感原始资料未入库（已在 `.gitignore`）
- [ ] 提交信息与分支/标签名同样不含上述敏感信息

## 🧭 北极星：产品形态与多租户模式（开发者时刻谨记）

本平台**双模交付**，所有设计与代码都须按此模式思考：

| | 公网 SaaS | 私有化部署 |
|--|--|--|
| 运营 / 品牌 | 我们运营 · **我们公司统一品牌** | 客户环境 · **客户品牌（部署级）** |
| 租户 = | 企业客户 | 客户的部门 |

- **品牌是部署级**（部署期配置注入），**不按租户在运行期动态换肤**。
- **多租户隔离（C 分层桥接）**：控制平面共享 + 数据平面按租户隔离。身份 = Keycloak **Organizations 单 realm**（org=租户，JWT 带 tenant 声明）；数据 = **schema/db-per-tenant**；计算 = **namespace-per-tenant**；由 `control-plane` 编排开通。

**本仓视角（webui）**：前端品牌经部署期 `config.js` 注入（公网=我们品牌 / 私有化=客户品牌），**绝不按租户在运行期换肤**；一个部署内登录页与界面风格统一。UI 始终运行在某租户上下文下，组件与请求都带租户维度。

### 🧭 北极星结构：同仓双 app（本仓特有 · 时刻谨记）

本仓是平台**唯一前端仓**，但**不是单一应用**。控制平面（`control-plane`）引入后，前端按面向拆为**两个 app 目标 + 共享 `packages/*`**，**同一 monorepo，不拆仓**：

| App | 平面 | 受众 / 身份 | 对接后端 | 拓扑 |
|--|--|--|--|--|
| `apps/console` | **使用平面** · 租户控制台 | 租户用户（JWT 带 `tenant`，**org 作用域**） | governance / security / tools-bi / privacy / data-foundation | per-tenant / 按 org 多租户 |
| `apps/admin` | **管理平面** · 运营控制台 | 平台运营方（**跨租户 superadmin**，不绑 org） | 主要 `control-plane` | **跨租户单例**，独立域名 |

开发须遵守的硬规则：

- **安全爆炸半径优先**：`apps/admin` 含「开通 / 销毁租户、改配额、看全租户」高权限操作，其代码与 bundle **绝不可与租户用户同包**。两 app 各自构建产物、独立域名、互不可达——禁止把 admin 模块塞进 console 或共享路由。
- **共享靠 `packages/*`、不靠复制**：设计系统（`ui`）、白标引擎（`brand`）、主题（`theme`）、i18n、SDK（`sdk`，由主仓 `contracts` 生成）经 packages 共享，两 app 共用。新增能力先想"放 console、放 admin、还是上提 packages"。
- **「租户自管理」≠ admin**：一个租户管自己的成员 / 配额视图，是 `apps/console` 内**按角色门控的区段**，属于使用平面；跨租户运营才进 `apps/admin`。两者严禁混淆。
- **白标两 app 一致**：admin 同样走部署级 `config.js`（SaaS=我们品牌 / 私有化=客户品牌），**不按租户换肤**。
- **交付分两阶段**：console=Issue #1（实现中）；admin=Issue #3（#1 完成后增量，共享逻辑上提 `packages/*`）。

> 任何前端变更先确认它属于哪个平面、是否触碰分包隔离与共享边界。

> 全局定义见主仓 `docs/00-主仓初始化-spec.md` 与 `docs/architecture/05-多租户与控制平面.md`；本仓落地见 `docs/00-前端初始化-spec.md`（§0 双平面、§5 目录）。

## 仓库定位

平台**唯一前端仓**（其余 submodule 均为无界面后端服务）：使用平面控制台 + 数据大屏 + 可视化编排画布（`apps/console`）+ 管理平面运营控制台（`apps/admin`）。

技术栈**已定稿**（详见 `docs/00-前端初始化-spec.md`）：React 19 + TS(strict) + Vite SPA · **pnpm monorepo 双 app** · Ant Design v6 + ProComponents · AntV(X6/G6/G2/S2) · react-i18next · TanStack Query + Zustand · Keycloak OIDC · Storybook + Playwright(基于 Storybook) + Vitest。当前处脚手架阶段。

## 🔗 契约（Contracts）—— 跨子系统集成

本仓经**契约**消费后端能力（`packages/sdk` 即由主仓契约生成）。契约的**单一事实源在主仓** `HashMatrixData/hashmatrix` 的 `contracts/`：
- 索引（机器可读）`contracts/registry.yaml` · 规范 `contracts/CONVENTIONS.md` · 设计 `docs/architecture/06-契约治理.md`
- 在线：https://github.com/HashMatrixData/hashmatrix/tree/main/contracts

**铁律**：先改契约、再改实现；加法兼容默认放行，破坏性走 MAJOR + 弃用期双跑 + 通知消费方；消费方一律 tolerant reader。

**本仓契约**：
- producer：暂无
- consumer：`icd/governance-metadata`（资产门户取数）；后端各服务 REST **OpenAPI** 契约（`contracts/openapi/*`，用于生成 `packages/sdk`，待落地）

**如何查阅（随时拉最新，勿存本地副本）**：
- 在 superproject（`hashmatrix/services/webui`）下：直接读 `../../contracts/`。
- 独立 clone：WebFetch `https://raw.githubusercontent.com/HashMatrixData/hashmatrix/main/contracts/registry.yaml`（公开仓免鉴权）→ 按 registry 取对应契约；或 `gh api repos/HashMatrixData/hashmatrix/contents/contracts/<path> -H "Accept: application/vnd.github.raw"`。
