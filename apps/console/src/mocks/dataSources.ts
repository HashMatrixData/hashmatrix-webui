import type { DataSourceInput, DataSourceRow, DataSourceTable, TablePreview } from '@/api/dataSources';

/**
 * 数据源 mock 数据（M2 链① · msw-first）。脱敏：虚构占位 `acme` / `example.com`，无真实业务数据。
 *
 * **有状态**：新建经 `addDataSource` 落到模块内 `store`，列表 `dataSources()` 即时反映——支撑「填表→
 * 保存→列表回显」的 play 断言。store 在浏览器内单例（msw worker 与 play 同上下文共享），故 play 应在
 * 起点调 `resetDataSources()` 自含，避免跨 story 泄漏（与 orgMembers/会话复位同纪律）。
 * D7：`addDataSource` **丢弃 password**（明文绝不入 mock store / 不回显），呼应后端加密落库语义。
 */

/** 确定性种子（无随机，E2E 可断言；端口/库名为通用占位）。 */
const SEED: DataSourceRow[] = Array.from({ length: 6 }, (_, i) => ({
  id: `ds_${String(i + 1).padStart(3, '0')}`,
  name: `acme_mysql_demo_${i + 1}`,
  type: 'mysql',
  host: `db-${i + 1}.example.com`,
  port: 3306,
  db: `acme_app_${i + 1}`,
  username: 'demo_reader',
  status: 'active',
}));

let store: DataSourceRow[] = [...SEED];
let seq = SEED.length;

/** 当前数据源快照（handlers 取数时调用）。 */
export const dataSources = (): DataSourceRow[] => store;

/** 复位到种子（story play 起点自含，防跨 story 状态泄漏）。 */
export const resetDataSources = (): void => {
  store = [...SEED];
  seq = SEED.length;
};

/** 新建：丢弃 password（D7），赋 id/状态，置顶入列，返回脱敏行。 */
export const addDataSource = (input: Omit<DataSourceInput, 'password'>): DataSourceRow => {
  seq += 1;
  const row: DataSourceRow = {
    id: `ds_${String(seq).padStart(3, '0')}`,
    name: input.name,
    type: input.type,
    host: input.host,
    port: input.port,
    db: input.db,
    username: input.username,
    status: 'active',
  };
  store = [row, ...store];
  return row;
};

// —— #29 浏览流：库表 + 预览（脱敏 demo；与 store 解耦，所有 demo 数据源共用同一组示例库表）——

/** demo 库表清单（虚构脱敏表名）。 */
export const DEMO_TABLES: DataSourceTable[] = [
  { name: 'orders_demo' },
  { name: 'customers_demo' },
  { name: 'products_demo' },
];

/** 某表的前 N 行预览（确定性派生，无随机；列固定 id/name/created_at，值含表名以便断言）。 */
export const previewFor = (table: string, limit = 20): TablePreview => {
  const columns = ['id', 'name', 'created_at'];
  const rows = Array.from({ length: Math.min(limit, 5) }, (_, i) => ({
    id: i + 1,
    name: `${table}_row_${i + 1}`,
    created_at: `2026-03-${String((i % 28) + 1).padStart(2, '0')}`,
  }));
  return { columns, rows };
};
