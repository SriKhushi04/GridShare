import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import HeaderNav from './HeaderNav';

export default function AppShell() {
  const location = useLocation();

  return (
    <div className="min-h-[100dvh] flex flex-col bg-[var(--bg-page)] text-[var(--text-primary)] transition-colors duration-300">
      <HeaderNav />
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 py-8 flex flex-col">
        <div key={location.pathname} className="page-transition flex-1 flex flex-col">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
