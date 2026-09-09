import React, { useState } from 'react';
import { Sidebar } from './Sidebar.js';
import { Header } from './Header.js';
import type { InstagramProfileData } from '../../../types/instagram.js';

interface DashboardLayoutProps {
  children: React.ReactNode;
  profile?: InstagramProfileData;
  currentPath: string;
  navigate: (path: string) => void;
  onLogout: () => void;
}

export function DashboardLayout({ children, profile, currentPath, navigate, onLogout }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <Sidebar
        currentPath={currentPath}
        navigate={navigate}
        onLogout={onLogout}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-h-screen min-w-0">
        <Header
          profile={profile}
          onMenuClick={() => setSidebarOpen(true)}
          navigate={navigate}
        />
        <main className="flex-1 p-4 lg:p-6 overflow-auto">
          <div className="max-w-6xl mx-auto animate-fade-in">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
