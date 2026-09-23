'use client';

import { useAuth } from '@/contexts/AuthContext';
import AdminDashboard from './AdminDashboard';
import EmployeeDashboard from './EmployeeDashboard';
import Header from './Header';

export default function Dashboard() {
  const { user } = useAuth();

  return (
    
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto px-4 py-8">
        {user?.role === 'admin' ? (
          <AdminDashboard />
        ) : (
          <EmployeeDashboard />
        )}
      </main>
    </div>
  );
}
