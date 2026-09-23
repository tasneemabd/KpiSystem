'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { Eye, Edit, Trash2, CheckCircle, XCircle, Clock } from 'lucide-react';
import toast from 'react-hot-toast';

interface KPICategory {
  category: string;
  kpiMeasurement: string;
  weight: number;
  grade: number;
  result: number;
  weightedContribution: number;
}

interface KPIEvaluation {
  _id: string;
  monthOf: string;
  dateOfEvaluation: string;
  employeeId: {
    _id: string;
    name: string;
    employeeId: string;
    email: string;
  };
  employeeName: string;
  evaluatorName: string;
  categories: KPICategory[];
  finalScore: number;
  status: 'draft' | 'submitted' | 'approved' | 'rejected';
  notes?: string;
  createdAt: string;
  createdBy: {
    _id: string;
    name: string;
  };
}

export default function KPIManagement() {
  const [evaluations, setEvaluations] = useState<KPIEvaluation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvaluation, setSelectedEvaluation] = useState<KPIEvaluation | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  useEffect(() => {
    fetchEvaluations();
  }, []);

  const fetchEvaluations = async () => {
    try {
      const response = await axios.get('/api/kpi');
      setEvaluations(response.data);
    } catch (error: any) {
      toast.error('Failed to fetch evaluations');
      console.error('Error fetching evaluations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (evaluationId: string) => {
    if (!confirm('Are you sure you want to delete this evaluation?')) return;
    
    try {
      await axios.delete(`/api/kpi/${evaluationId}`);
      toast.success('Evaluation deleted successfully');
      fetchEvaluations();
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to delete evaluation';
      toast.error(message);
    }
  };

  const handleStatusChange = async (evaluationId: string, newStatus: string, notes?: string) => {
    try {
      await axios.patch(`/api/kpi/${evaluationId}/status`, { status: newStatus, notes });
      toast.success('Status updated successfully');
      fetchEvaluations();
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to update status';
      toast.error(message);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-success-100 text-success-800';
      case 'rejected':
        return 'bg-danger-100 text-danger-800';
      case 'submitted':
        return 'bg-warning-100 text-warning-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-4 w-4" />;
      case 'rejected':
        return <XCircle className="h-4 w-4" />;
      case 'submitted':
        return <Clock className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusText = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const filteredEvaluations = evaluations.filter(evaluation => {
    if (filterStatus === 'all') return true;
    return evaluation.status === filterStatus;
  });

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
        <h3 className="text-lg font-semibold text-gray-900">KPI Evaluations Management</h3>
        
        {/* Status Filter */}
        <div className="flex items-center space-x-2">
          <label className="text-sm font-medium text-gray-700">Filter by status:</label>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="input py-1 px-2 text-sm"
          >
            <option value="all">All Statuses</option>
            <option value="draft">Draft</option>
            <option value="submitted">Submitted</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Evaluations Table */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table w-full">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Month</th>
                <th>Evaluator</th>
                <th>Final Score</th>
                <th>Status</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredEvaluations.map((evaluation) => (
                <tr key={evaluation._id}>
                  <td>
                    <div>
                      <div className="font-medium text-gray-900">{evaluation.employeeName}</div>
                      <div className="text-sm text-gray-500">ID: {evaluation.employeeId.employeeId}</div>
                    </div>
                  </td>
                  <td className="font-medium">{evaluation.monthOf}</td>
                  <td>{evaluation.evaluatorName}</td>
                  <td>
                    <div className="text-lg font-bold text-primary-600">
                      {evaluation.finalScore}%
                    </div>
                  </td>
                  <td>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(evaluation.status)}`}>
                      {getStatusIcon(evaluation.status)}
                      <span className="ml-1">{getStatusText(evaluation.status)}</span>
                    </span>
                  </td>
                  <td className="text-sm text-gray-500">
                    {new Date(evaluation.createdAt).toLocaleDateString()}
                  </td>
                  <td>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setSelectedEvaluation(evaluation)}
                        className="text-primary-600 hover:text-primary-700 p-1"
                        title="View details"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      
                      <button
                        onClick={() => handleDelete(evaluation._id)}
                        className="text-danger-600 hover:text-danger-700 p-1"
                        title="Delete evaluation"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredEvaluations.length === 0 && (
          <div className="p-6 text-center text-gray-500">
            <p>No evaluations found with the selected status.</p>
          </div>
        )}
      </div>

      {/* Evaluation Detail Modal */}
      {selectedEvaluation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="text-lg font-semibold text-gray-900">
                KPI Evaluation Details
              </h3>
              <button
                onClick={() => setSelectedEvaluation(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="h-6 w-6" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Evaluation Header */}
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Month Of</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedEvaluation.monthOf}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Date of Evaluation</label>
                  <p className="mt-1 text-sm text-gray-900">
                    {new Date(selectedEvaluation.dateOfEvaluation).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Employee Name</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedEvaluation.employeeName}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Evaluator Name</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedEvaluation.evaluatorName}</p>
                </div>
              </div>

              {/* KPI Categories Table */}
              <div>
                <h4 className="text-lg font-medium text-gray-900 mb-4">KPI Categories</h4>
                <div className="overflow-x-auto">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Category</th>
                        <th>KPI Measurement</th>
                        <th>Weight (%)</th>
                        <th>Grade (1-5)</th>
                        <th>Result (%)</th>
                        <th>Weighted Contribution (%)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedEvaluation.categories.map((category, index) => (
                        <tr key={index}>
                          <td>{category.category}</td>
                          <td>{category.kpiMeasurement}</td>
                          <td>{category.weight}%</td>
                          <td>{category.grade}</td>
                          <td>{category.result}%</td>
                          <td>{category.weightedContribution}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Final Score */}
              <div className="bg-primary-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-lg font-medium text-primary-900">Final Score</span>
                  </div>
                  <div className="text-3xl font-bold text-primary-600">
                    {selectedEvaluation.finalScore}%
                  </div>
                </div>
              </div>

              {/* Status Management */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-lg font-medium text-gray-900 mb-4">Status Management</h4>
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-700">Current Status:</span>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedEvaluation.status)}`}>
                    {getStatusIcon(selectedEvaluation.status)}
                    <span className="ml-1">{getStatusText(selectedEvaluation.status)}</span>
                  </span>
                </div>
                
                <div className="mt-4 flex items-center space-x-2">
                  <span className="text-sm text-gray-700">Change Status:</span>
                  <button
                    onClick={() => handleStatusChange(selectedEvaluation._id, 'approved')}
                    className="btn bg-success-600 hover:bg-success-700 text-white text-sm px-3 py-1"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleStatusChange(selectedEvaluation._id, 'rejected')}
                    className="btn bg-danger-600 hover:bg-danger-700 text-white text-sm px-3 py-1"
                  >
                    Reject
                  </button>
                  <button
                    onClick={() => handleStatusChange(selectedEvaluation._id, 'submitted')}
                    className="btn bg-warning-600 hover:bg-warning-700 text-white text-sm px-3 py-1"
                  >
                    Mark Submitted
                  </button>
                </div>
              </div>

              {/* Notes */}
              {selectedEvaluation.notes && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                  <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-lg">
                    {selectedEvaluation.notes}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
