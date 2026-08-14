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
    <div className="admin-layout" style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#0b0f19' }}>
      <AdminSidebar />
      <main className="admin-main-content">
        {children}
      </main>
    </div>
  );
}
