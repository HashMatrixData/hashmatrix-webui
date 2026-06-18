import { create } from 'zustand';
import { ROLES } from './roles';

/**
 * 开发期 / E2E / Storybook 用的 mock 会话——免真实 Keycloak 即可跑通登录壳与权限骨架。
 * **仅开发期生效**：生产构建未配置 OIDC 时由 AppAuthProvider 兜底报错而非回落本 mock。
 * 注入 oidc.authority（运行期）即切换到真实 OidcSessionProvider。
 * 演示数据脱敏占位（example.com / Demo User）。
 */
interface MockSessionState {
  signedIn: boolean;
  name: string;
  email: string;
  roles: string[];
  signIn: () => void;
  signOut: () => void;
  /** RBAC 演示：运行期切换当前用户角色，观察路由/按钮门控。 */
  setRoles: (roles: string[]) => void;
}

export const useMockSessionStore = create<MockSessionState>((set) => ({
  signedIn: true,
  name: 'Demo User',
  email: 'demo.user@example.com',
  roles: [ROLES.ADMIN, ROLES.GOVERNANCE_EDITOR, ROLES.VIEWER],
  signIn: () => set({ signedIn: true }),
  signOut: () => set({ signedIn: false }),
  setRoles: (roles) => set({ roles }),
}));

/**
 * 各 app 启动时调用一次（render 前），为 mock 会话注入该平面的身份与角色。
 * console=租户用户角色；admin=跨租户 superadmin。真实 OIDC 下角色来自 token，与此无关。
 */
export function configureMockSession(seed: { name: string; email?: string; roles: string[] }): void {
  useMockSessionStore.setState({
    signedIn: true,
    name: seed.name,
    email: seed.email ?? '',
    roles: seed.roles,
  });
}
