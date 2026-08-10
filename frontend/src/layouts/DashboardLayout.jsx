import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--color-bg-secondary)' }}>
      <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <main style={{
        marginLeft: isMobile ? 0 : 'var(--sidebar-width)',
        padding: 'var(--space-8)',
        minHeight: 'calc(100vh - var(--header-height))',
        transition: 'margin-left var(--transition-slow)',
        maxWidth: '1200px',
      }}>
        <Outlet />
      </main>
    </div>
  );
}
