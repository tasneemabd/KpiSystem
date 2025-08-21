'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Users, Award, Plus, BarChart3 } from 'lucide-react';
import UserManagement from './admin/UserManagement';
import KPIManagement from './admin/KPIManagement';
import CreateEvaluation from './admin/CreateEvaluation';
import toast from 'react-hot-toast';

type TabType = 'overview' | 'users' | 'evaluations' | 'create';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalEvaluations: 0,
    averageScore: 0
  });

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'users', label: 'User Management', icon: Users },
    { id: 'evaluations', label: 'KPI Evaluations', icon: Award },
    { id: 'create', label: 'Create Evaluation', icon: Plus }
  ];

  useEffect(() => {
    // Add keyboard shortcuts
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.ctrlKey || event.metaKey) {
        switch (event.key) {
          case '1':
            event.preventDefault();
            handleTabChange('overview');
            break;
          case '2':
            event.preventDefault();
            handleTabChange('users');
            break;
          case '3':
            event.preventDefault();
            handleTabChange('evaluations');
            break;
          case '4':
            event.preventDefault();
            handleTabChange('create');
            break;
        }
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, []);

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    
    // Show helpful messages for certain tabs
    if (tab === 'create') {
      toast.success('Create Evaluation tab opened. Fill out the form to create a new KPI evaluation. (Ctrl+4)', {
        duration: 4000,
        icon: '📝'
      });
    } else if (tab === 'users') {
      toast.success('User Management tab opened. Manage employees and their accounts. (Ctrl+2)', {
        duration: 4000,
        icon: '👥'
      });
    } else if (tab === 'evaluations') {
      toast.success('KPI Evaluations tab opened. View and manage existing evaluations. (Ctrl+3)', {
        duration: 4000,
        icon: '📊'
      });
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return <OverviewTab stats={stats} setActiveTab={handleTabChange} />;
      case 'users':
        return <UserManagement />;
      case 'evaluations':
        return <KPIManagement />;
      case 'create':
        return <CreateEvaluation />;
      default:
        return <OverviewTab stats={stats} setActiveTab={handleTabChange} />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Dashboard Header */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Admin Dashboard</h2>
            <p className="text-gray-600">Manage users, KPI evaluations, and system settings</p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-primary-600">
              Admin
            </div>
            <div className="text-sm text-gray-500">System Administrator</div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id as TabType)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                    activeTab === tab.id
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
        
        <div className="p-6">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
}

// Overview Tab Component
function OverviewTab({ stats, setActiveTab }: { stats: any; setActiveTab: (tab: TabType) => void }) {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">System Overview</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-primary-50 rounded-lg p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Users className="h-8 w-8 text-primary-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-primary-600">Total Users</p>
              <p className="text-2xl font-semibold text-primary-900">{stats.totalUsers}</p>
            </div>
          </div>
        </div>

        <div className="bg-success-50 rounded-lg p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Award className="h-8 w-8 text-success-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-success-600">Total Evaluations</p>
              <p className="text-2xl font-semibold text-success-900">{stats.totalEvaluations}</p>
            </div>
          </div>
        </div>

        <div className="bg-warning-50 rounded-lg p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <BarChart3 className="h-8 w-8 text-warning-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-warning-600">Average Score</p>
              <p className="text-2xl font-semibold text-warning-900">{stats.averageScore}%</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gray-50 rounded-lg p-6">
        <h4 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-lg p-4 border">
            <h5 className="font-medium text-gray-900 mb-2">Create New Evaluation</h5>
            <p className="text-sm text-gray-600 mb-3">
              Create a new KPI evaluation for an employee
            </p>
            <button 
              onClick={() => setActiveTab('create')}
              className="btn-primary text-sm hover:bg-primary-700 transition-colors duration-200 flex items-center justify-center space-x-2 w-full"
            >
              <Plus className="h-4 w-4" />
              <span>Create Evaluation</span>
            </button>
          </div>
          
          <div className="bg-white rounded-lg p-4 border">
            <h5 className="font-medium text-gray-900 mb-2">Add New Employee</h5>
            <p className="text-sm text-gray-600 mb-3">
              Add a new employee to the system
            </p>
            <button 
              onClick={() => setActiveTab('users')}
              className="btn-primary text-sm hover:bg-primary-700 transition-colors duration-200 flex items-center justify-center space-x-2 w-full"
            >
              <Users className="h-4 w-4" />
              <span>Add Employee</span>
            </button>
          </div>
        </div>
        
        {/* Keyboard Shortcuts Hint */}
        <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center space-x-2">
            <div className="text-blue-600">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="text-sm text-blue-800">
              <span className="font-medium">Keyboard Shortcuts:</span> 
              <span className="ml-2">Ctrl+1 (Overview) • Ctrl+2 (Users) • Ctrl+3 (Evaluations) • Ctrl+4 (Create)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
