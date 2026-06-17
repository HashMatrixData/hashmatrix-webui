import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import './index.css';
import './i18n'; // 初始化 i18next（副作用）
import { bootstrapBrand } from '@/brand';
import { AppProviders } from '@/app/AppProviders';
import { router } from '@/app/router';

// 应用挂载前把初始品牌分发到 document（CSS Vars / favicon / title）。
bootstrapBrand();

const rootEl = document.getElementById('root');
if (!rootEl) throw new Error('#root not found');

createRoot(rootEl).render(
  <StrictMode>
    <AppProviders>
      <RouterProvider router={router} />
    </AppProviders>
  </StrictMode>,
);
