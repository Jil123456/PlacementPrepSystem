import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import AIChat from '../common/AIChat';

const MainLayout = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-dark-900 text-slate-200 flex flex-col font-['Inter']">
      <Navbar onMenuClick={() => setIsMobileMenuOpen(true)} />
      <div className="flex flex-1 overflow-hidden relative">
        <Sidebar isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />
        <main className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-6 lg:p-8 relative">
          {/* Subtle background glow effect */}
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary-600/10 rounded-full blur-[100px] -z-10 pointer-events-none"></div>
          <Outlet />
        </main>
      </div>
      <AIChat />
    </div>
  );
};

export default MainLayout;
