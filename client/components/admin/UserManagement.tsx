'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import { Plus, Edit, Trash2, UserPlus, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';

interface User {
  _id: string;
  email: string;
  name: string;
  employeeId: string;
  role: 'admin' | 'employee';
  isActive: boolean;
  createdAt: string;
}

interface UserForm {
  email: string;
  password: string;
  name: string;
  employeeId: string;
}

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    setValue
  } = useForm<UserForm>();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axios.get('/api/users');
      setUsers(response.data);
    } catch (error: any) {
      toast.error('Failed to fetch users');
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: UserForm) => {
    setIsSubmitting(true);
    try {
      if (editingUser) {
        await axios.put(`/api/users/${editingUser._id}`, {
          name: data.name,
          email: data.email,
          employeeId: data.employeeId,
          isActive: true
        });
        toast.success('User updated successfully');
      } else {
        await axios.post('/api/users', data);
        toast.success('User created successfully');
      }
      
      setShowForm(false);
      setEditingUser(null);
      reset();
      fetchUsers();
    } catch (error: any) {
      const message = error.response?.data?.message || 'Operation failed';
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setValue('name', user.name);
    setValue('email', user.email);
    setValue('employeeId', user.employeeId);
    setShowForm(true);
  };

  const handleDelete = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    
    try {
      await axios.delete(`/api/users/${userId}`);
      toast.success('User deleted successfully');
      fetchUsers();
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to delete user';
      toast.error(message);
    }
  };

  const handleResetPassword = async (userId: string) => {
    const newPassword = prompt('Enter new password (minimum 6 characters):');
    if (!newPassword || newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    try {
      await axios.post(`/api/users/${userId}/reset-password`, { newPassword });
      toast.success('Password reset successfully');
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to reset password';
      toast.error(message);
    }
  };

  const cancelForm = () => {
    setShowForm(false);
    setEditingUser(null);
    reset();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">User Management</h3>
        <button
          onClick={() => setShowForm(true)}
          className="btn-primary flex items-center space-x-2"
        >
          <UserPlus className="h-4 w-4" />
          <span>Add User</span>
        </button>
      </div>

      {/* User Form */}
      {showForm && (
        <div className="bg-gray-50 rounded-lg p-6 border">
          <h4 className="text-lg font-medium text-gray-900 mb-4">
            {editingUser ? 'Edit User' : 'Add New User'}
          </h4>
          
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <input
                  {...register('name', { required: 'Name is required' })}
                  type="text"
                  className="input"
                  placeholder="Enter full name"
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-danger-600">{errors.name.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Employee ID
                </label>
                <input
                  {...register('employeeId', { required: 'Employee ID is required' })}
                  type="text"
                  className="input"
                  placeholder="Enter employee ID"
                />
                {errors.employeeId && (
                  <p className="mt-1 text-sm text-danger-600">{errors.employeeId.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  {...register('email', {
                    required: 'Email is required',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Invalid email address'
                    }
                  })}
                  type="email"
                  className="input"
                  placeholder="Enter email address"
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-danger-600">{errors.email.message}</p>
                )}
              </div>

              {!editingUser && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      {...register('password', {
                        required: 'Password is required',
                        minLength: {
                          value: 6,
                          message: 'Password must be at least 6 characters'
                        }
                      })}
                      type={showPassword ? 'text' : 'password'}
                      className="input pr-10"
                      placeholder="Enter password"
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="mt-1 text-sm text-danger-600">{errors.password.message}</p>
                  )}
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={cancelForm}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-primary flex items-center space-x-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <span>{editingUser ? 'Update' : 'Create'}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table w-full">
            <thead>
              <tr>
                <th>Name</th>
                <th>Employee ID</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user._id}>
                  <td className="font-medium">{user.name}</td>
                  <td>{user.employeeId}</td>
                  <td>{user.email}</td>
                  <td>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      user.role === 'admin' 
                        ? 'bg-purple-100 text-purple-800' 
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      user.isActive 
                        ? 'bg-success-100 text-success-800' 
                        : 'bg-danger-100 text-danger-800'
                    }`}>
                      {user.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="text-sm text-gray-500">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleEdit(user)}
                        className="text-primary-600 hover:text-primary-700 p-1"
                        title="Edit user"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      
                      {user.role === 'employee' && (
                        <>
                          <button
                            onClick={() => handleResetPassword(user._id)}
                            className="text-warning-600 hover:text-warning-700 p-1"
                            title="Reset password"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          
                          <button
                            onClick={() => handleDelete(user._id)}
                            className="text-danger-600 hover:text-danger-700 p-1"
                            title="Delete user"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
