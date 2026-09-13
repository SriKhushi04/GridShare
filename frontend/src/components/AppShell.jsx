import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { GridProvider } from '../context/GridContext';

export default function AppShell() {
  return (
    <GridProvider>
      <div className="flex h-screen overflow-hidden bg-[#080c14]">
        <Sidebar />
        <main className="flex-1 overflow-hidden">
          <Outlet />
        </main>
      </div>
    </GridProvider>
  );
}
