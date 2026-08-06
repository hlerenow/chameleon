import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';

const demoTabs = [
  { to: '/', label: '页面 Props' },
  { to: '/page-storage', label: '页面 Storage' },
  { to: '/request-api', label: '请求 API' },
  { to: '/button-showcase', label: '按钮样式' },
  { to: '/interactive-button', label: '按钮 State' },
  { to: '/loop-button', label: '循环按钮' },
  { to: '/designer', label: '设计态渲染' },
];

export function DevLayout() {
  return (
    <div className="dev-layout">
      <aside className="dev-sidebar">
        <h1 className="dev-sidebar-title">Render 测试用例</h1>
        <nav className="dev-tabs" aria-label="测试用例导航">
          {demoTabs.map((tab) => (
            <NavLink
              key={tab.to}
              to={tab.to}
              end={tab.to === '/'}
              className={({ isActive }) => `dev-tab${isActive ? ' dev-tab-active' : ''}`}
            >
              {tab.label}
            </NavLink>
          ))}
        </nav>
      </aside>
      <main className="dev-content">
        <Outlet />
      </main>
    </div>
  );
}
