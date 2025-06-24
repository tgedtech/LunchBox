import React from 'react';
import { Outlet } from 'react-router-dom';
import NavBar from './NavBar';
import Sidebar from './Sidebar';

function Layout() {
  return (
    <div className="min-h-screen flex flex-col bg-base-100 text-base-content font-nunito-sans">
      <NavBar />
      <div className="flex flex-1 w-full overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default Layout;