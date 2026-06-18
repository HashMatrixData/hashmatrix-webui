import { useTranslation } from 'react-i18next';
import { ScaleContainer } from '@hashmatrix/ui';
import { TrendChart } from '@hashmatrix/ui';
import { useBrandStore } from '@hashmatrix/brand';

const STATS = [
  { labelKey: 'dashboard.datasets', value: '1,280', suffix: '' },
  { labelKey: 'dashboard.jobs', value: '342', suffix: '' },
  { labelKey: 'dashboard.quality', value: '98.6', suffix: '%' },
] as const;

/** 数据大屏页（DoD #6）：scale 容器内按 1920×1080 基准绘制，等比自适应。 */
export function DashboardPage() {
  const { t } = useTranslation();
  const brand = useBrandStore((s) => s.brand);

  return (
    <div style={{ height: 'calc(100vh - 200px)', minHeight: 420 }}>
      <ScaleContainer baseWidth={1920} baseHeight={1080}>
        <div
          style={{
            width: 1920,
            height: 1080,
            padding: 48,
            boxSizing: 'border-box',
            color: '#e6f4ff',
            display: 'flex',
            flexDirection: 'column',
            gap: 32,
            background: 'radial-gradient(ellipse at top, #123a6b 0%, #0b1f3a 70%)',
          }}
        >
          <h1 style={{ fontSize: 52, margin: 0, textAlign: 'center', color: '#fff' }}>
            {brand.appName} · {t('menu.dashboard')}
          </h1>

          <div style={{ display: 'flex', gap: 32 }}>
            {STATS.map((s) => (
              <div
                key={s.labelKey}
                style={{
                  flex: 1,
                  background: 'rgba(255,255,255,0.06)',
                  borderTop: `4px solid var(--brand-secondary, ${brand.colorSecondary})`,
                  borderRadius: 12,
                  padding: 32,
                  textAlign: 'center',
                }}
              >
                <div style={{ fontSize: 64, fontWeight: 700, color: '#fff' }}>
                  {s.value}
                  <span style={{ fontSize: 32 }}>{s.suffix}</span>
                </div>
                <div style={{ fontSize: 24, opacity: 0.75 }}>{t(s.labelKey)}</div>
              </div>
            ))}
          </div>

          <div
            style={{
              flex: 1,
              background: 'rgba(255,255,255,0.06)',
              borderRadius: 12,
              padding: 24,
              minHeight: 0,
            }}
          >
            <TrendChart />
          </div>
        </div>
      </ScaleContainer>
    </div>
  );
}
