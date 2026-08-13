import React from 'react';
import { AdminSidebar } from '@/components/AdminSidebar';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#0b0f19' }}>
      <AdminSidebar />
      <main
        style={{
          flex: 1,
          marginLeft: '260px',
          padding: '32px',
          maxWidth: 'calc(100vw - 260px)',
          minHeight: '100vh',
        }}
      >
        {children}
      </main>
    </div>
  );
}
