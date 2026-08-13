import React from 'react';
import { redirect } from 'next/navigation';
import { getAuthUser } from '@/lib/auth';
import { AdminSidebar } from '@/components/AdminSidebar';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = getAuthUser();
  if (!user) {
    redirect('/login');
  }

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
