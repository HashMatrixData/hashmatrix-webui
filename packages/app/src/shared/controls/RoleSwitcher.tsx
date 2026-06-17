import { Select } from 'antd';
import { TeamOutlined } from '@ant-design/icons';
import { useMockSessionStore, ROLES } from '@/auth';

/**
 * RBAC 演示控件（仅 mock 会话下有意义）：切换当前用户角色，
 * 实时观察 governance 菜单/路由（路由级）与受限按钮（按钮级）的门控。
 * 真实 OIDC 下角色来自 Keycloak token，不可在前端篡改。
 */
const ROLE_PRESETS: { value: string; label: string; roles: string[] }[] = [
  { value: 'admin', label: 'admin', roles: [ROLES.ADMIN, ROLES.GOVERNANCE_EDITOR, ROLES.VIEWER] },
  { value: 'editor', label: 'governance:editor', roles: [ROLES.GOVERNANCE_EDITOR, ROLES.VIEWER] },
  { value: 'viewer', label: 'viewer', roles: [ROLES.VIEWER] },
];

export function RoleSwitcher() {
  const roles = useMockSessionStore((s) => s.roles);
  const setRoles = useMockSessionStore((s) => s.setRoles);

  const current =
    ROLE_PRESETS.find((p) => p.roles.length === roles.length && p.roles.every((r) => roles.includes(r)))
      ?.value ?? 'admin';

  return (
    <Select
      aria-label="role"
      value={current}
      style={{ minWidth: 150 }}
      suffixIcon={<TeamOutlined />}
      onChange={(value) => {
        const preset = ROLE_PRESETS.find((p) => p.value === value);
        if (preset) setRoles(preset.roles);
      }}
      options={ROLE_PRESETS.map((p) => ({ value: p.value, label: p.label }))}
    />
  );
}
