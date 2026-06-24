import { http } from '@hashmatrix/sdk';
import type { Paged } from '@hashmatrix/ui/data';

/**
 * 数据源接入客户端（M2 链① · 锚点 · 经共享 `@hashmatrix/sdk` 的 axios；baseURL 由运行期 config.js）。
 *
 * 锚定主仓契约 `data-foundation-datasources`（设计 issue HashMatrixData/hashmatrix#55）：
 * **路径形状已锁定**（见下），但 OpenAPI/registry 起草中、`packages/sdk` codegen 未落地——故本文件为
 * **手写 tolerant reader**（字段缺省不报错），契约合入并生成 SDK 后应替换为生成类型，避免双源漂移。
 *
 * D8 连接器中立：`type` 驱动方言，MySQL 仅为第一个；不写死单一数据库。
 * D7 凭据：`password` 仅**写入**（创建/测试连接入参），后端 AES-GCM 加密落库，**响应绝不回显**。
 * D9 隔离：列表/写入经 sdk 拦截器自动附 `X-Tenant-Id`（会话派生），后端按租户强制过滤。
 */

/** 连接器方言类型（D8 中立：`mysql` 是第一个，非穷举——tolerant 接受未知 type）。 */
export type DataSourceType = string;

/** 已知方言选项（UI 下拉用；新增方言只在此追加，端点/模型不变）。 */
export const KNOWN_DATA_SOURCE_TYPES: readonly DataSourceType[] = ['mysql'];

/** 数据源列表项（契约 schema 起草中 · tolerant：`status` 等可缺省）。**无 password 字段**（D7 不回显）。 */
export interface DataSourceRow {
  id: string;
  name: string;
  type: DataSourceType;
  host: string;
  port: number;
  db: string;
  username: string;
  /** 连接态（M2 可缺省；缺省按 unknown 处理）。 */
  status?: 'active' | 'error' | 'unknown';
}

/** 新建/测试连接入参（含 `password`：仅上行、绝不回显/入日志，D7）。 */
export interface DataSourceInput {
  name: string;
  type: DataSourceType;
  host: string;
  port: number;
  db: string;
  username: string;
  password: string;
}

/** 测试连接结果（真实 JDBC 连测；失败带可读错误，前端原样回显）。 */
export interface TestConnectionResult {
  ok: boolean;
  error?: string;
}

/** 列表（按 `X-Tenant-Id` 隔离 · 服务端分页，形 `{ data, total }`）。 */
export const listDataSources = (params: Record<string, unknown>) =>
  http.get<Paged<DataSourceRow>>('/api/datasources', { params }).then((r) => r.data);

/** 新建数据源（password AES-GCM 加密落库由后端处理；响应不含 password）。 */
export const createDataSource = (input: DataSourceInput) =>
  http.post<DataSourceRow>('/api/datasources', input).then((r) => r.data);

/** 测试连接（真连 demo 数据源；连不上返回 `{ ok:false, error }`）。 */
export const testDataSourceConnection = (input: DataSourceInput) =>
  http.post<TestConnectionResult>('/api/datasources/test', input).then((r) => r.data);
