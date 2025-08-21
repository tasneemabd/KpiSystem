'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import axios from 'axios';
import { Calendar, User, Award, TrendingUp, X, BarChart3, Target, CheckCircle, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

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
  employeeName: string;
  evaluatorName: string;
  categories: KPICategory[];
  finalScore: number;
  status: 'draft' | 'submitted' | 'approved' | 'rejected';
  notes?: string;
  createdAt: string;
}

export default function EmployeeDashboard() {
  const { user } = useAuth();
  const [evaluations, setEvaluations] = useState<KPIEvaluation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvaluation, setSelectedEvaluation] = useState<KPIEvaluation | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'evaluations' | 'analytics'>('overview');

  useEffect(() => {
    fetchEvaluations();
  }, []);

  const fetchEvaluations = async () => {
    try {
      const response = await axios.get(`/api/kpi/employee/${user?.id}`);
      setEvaluations(response.data);
    } catch (error: any) {
      toast.error('Failed to fetch evaluations');
      console.error('Error fetching evaluations:', error);
    } finally {
      setLoading(false);
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

  const getStatusText = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-4 w-4" />;
      case 'rejected':
        return <X className="h-4 w-4" />;
      case 'submitted':
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <Calendar className="h-4 w-4" />;
    }
  };

  // Prepare data for performance chart
  const performanceData = evaluations
    .filter(evaluation => evaluation.status === 'approved')
    .sort((a, b) => new Date(a.dateOfEvaluation).getTime() - new Date(b.dateOfEvaluation).getTime())
    .map(evaluation => ({
      month: evaluation.monthOf,
      score: evaluation.finalScore,
      date: new Date(evaluation.dateOfEvaluation).toLocaleDateString('en-US', { month: 'short', year: '2-digit' })
    }));

  // Calculate performance metrics
  const performanceMetrics = {
    totalEvaluations: evaluations.length,
    averageScore: evaluations.length > 0 
      ? Math.round(evaluations.reduce((sum, evaluation) => sum + evaluation.finalScore, 0) / evaluations.length)
      : 0,
    highestScore: evaluations.length > 0 
      ? Math.max(...evaluations.map(evaluation => evaluation.finalScore))
      : 0,
    lowestScore: evaluations.length > 0 
      ? Math.min(...evaluations.map(evaluation => evaluation.finalScore))
      : 0,
    improvement: performanceData.length > 1 
      ? performanceData[performanceData.length - 1].score - performanceData[0].score
      : 0
  };

  // Prepare category performance data for pie chart
  const categoryPerformance = evaluations.length > 0 
    ? evaluations[0].categories.map(category => ({
        name: category.category,
        value: category.weightedContribution,
        weight: category.weight,
        result: category.result
      }))
    : [];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const renderOverviewTab = () => (
    <div className="space-y-6">
      {/* Performance Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Award className="h-8 w-8 text-primary-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-primary-600">Total Evaluations</p>
              <p className="text-2xl font-semibold text-primary-900">{performanceMetrics.totalEvaluations}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <TrendingUp className="h-8 w-8 text-success-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-success-600">Average Score</p>
              <p className="text-2xl font-semibold text-success-900">{performanceMetrics.averageScore}%</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Target className="h-8 w-8 text-warning-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-warning-600">Highest Score</p>
              <p className="text-2xl font-semibold text-warning-900">{performanceMetrics.highestScore}%</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <BarChart3 className="h-8 w-8 text-info-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-info-600">Performance Trend</p>
              <p className={`text-2xl font-semibold ${performanceMetrics.improvement >= 0 ? 'text-success-900' : 'text-danger-900'}`}>
                {performanceMetrics.improvement >= 0 ? '+' : ''}{performanceMetrics.improvement}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Improvement Chart */}
      {performanceData.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Improvement Over Time</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis domain={[0, 100]} />
                <Tooltip 
                  formatter={(value: any) => [`${value}%`, 'Score']}
                  labelFormatter={(label) => `Month: ${label}`}
                />
                <Line 
                  type="monotone" 
                  dataKey="score" 
                  stroke="#3B82F6" 
                  strokeWidth={3}
                  dot={{ fill: '#3B82F6', strokeWidth: 2, r: 6 }}
                  activeDot={{ r: 8, stroke: '#3B82F6', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Category Performance Distribution */}
      {categoryPerformance.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Category Performance Distribution</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryPerformance}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {categoryPerformance.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: any) => [`${value.toFixed(2)}%`, 'Weighted Contribution']} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Category Details</h3>
            <div className="space-y-3">
              {categoryPerformance.map((category, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-4 h-4 rounded-full" 
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    ></div>
                    <span className="font-medium text-gray-900">{category.name}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900">{category.result}%</div>
                    <div className="text-xs text-gray-500">Weight: {category.weight}%</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderEvaluationsTab = () => (
    <div className="space-y-6">
      {/* Evaluations List */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="px-6 py-4 border-b">
          <h3 className="text-lg font-semibold text-gray-900">KPI Evaluations</h3>
        </div>
        
        {evaluations.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            <Award className="h-12 w-12 mx-auto text-gray-300 mb-4" />
            <p>No KPI evaluations found.</p>
            <p className="text-sm">Your evaluations will appear here once they are created by administrators.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {evaluations.map((evaluation) => (
              <div key={evaluation._id} className="p-6 hover:bg-gray-50">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      <Calendar className="h-4 w-4" />
                      <span>{evaluation.monthOf}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      <User className="h-4 w-4" />
                      <span>Evaluated by: {evaluation.evaluatorName}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(evaluation.status)} flex items-center space-x-1`}>
                      {getStatusIcon(evaluation.status)}
                      <span>{getStatusText(evaluation.status)}</span>
                    </span>
                    <button
                      onClick={() => setSelectedEvaluation(evaluation)}
                      className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                    >
                      View Details
                    </button>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-lg font-medium text-gray-900">
                      {evaluation.employeeName}
                    </h4>
                    <p className="text-sm text-gray-500">
                      Evaluation Date: {new Date(evaluation.dateOfEvaluation).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-primary-600">
                      {evaluation.finalScore}%
                    </div>
                    <div className="text-sm text-gray-500">Final Score</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Dashboard Header */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Employee Dashboard</h2>
            <p className="text-gray-600">View your KPI evaluations and performance metrics</p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-primary-600">
              {evaluations.length}
            </div>
            <div className="text-sm text-gray-500">Total Evaluations</div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                activeTab === 'overview'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <BarChart3 className="h-5 w-5" />
              <span>Overview</span>
            </button>
            <button
              onClick={() => setActiveTab('evaluations')}
              className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                activeTab === 'evaluations'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Award className="h-5 w-5" />
              <span>Evaluations</span>
            </button>
          </nav>
        </div>
        
        <div className="p-6">
          {activeTab === 'overview' && renderOverviewTab()}
          {activeTab === 'evaluations' && renderEvaluationsTab()}
        </div>
      </div>

      {/* Enhanced Evaluation Detail Modal */}
      {selectedEvaluation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="text-lg font-semibold text-gray-900">
                KPI Evaluation Details - {selectedEvaluation.monthOf}
              </h3>
              <button
                onClick={() => setSelectedEvaluation(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
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

              {/* Status and Score Summary */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    {getStatusIcon(selectedEvaluation.status)}
                    <span className="text-sm font-medium text-gray-700">Status</span>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedEvaluation.status)}`}>
                    {getStatusText(selectedEvaluation.status)}
                  </span>
                </div>
                
                <div className="bg-primary-50 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <TrendingUp className="h-4 w-4 text-primary-600" />
                    <span className="text-sm font-medium text-primary-700">Final Score</span>
                  </div>
                  <div className="text-2xl font-bold text-primary-600">
                    {selectedEvaluation.finalScore}%
                  </div>
                </div>

                <div className="bg-success-50 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Target className="h-4 w-4 text-success-600" />
                    <span className="text-sm font-medium text-success-700">Total Categories</span>
                  </div>
                  <div className="text-2xl font-bold text-success-600">
                    {selectedEvaluation.categories.length}
                  </div>
                </div>
              </div>

              {/* KPI Categories Table */}
              <div>
                <h4 className="text-lg font-medium text-gray-900 mb-4">KPI Categories & Results</h4>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">KPI Measurement</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Weight (%)</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Grade (1-5)</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Result (%)</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Weighted Contribution (%)</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {selectedEvaluation.categories.map((category, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {category.category}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {category.kpiMeasurement}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                              {category.weight}%
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              category.grade >= 4 ? 'bg-green-100 text-green-800' :
                              category.grade >= 3 ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {category.grade}/5
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              category.result >= 80 ? 'bg-green-100 text-green-800' :
                              category.result >= 60 ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {category.result}%
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <span className="px-2 py-1 bg-primary-100 text-primary-800 rounded-full text-xs font-medium">
                              {category.weightedContribution.toFixed(2)}%
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Performance Visualization */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white border rounded-lg p-4">
                  <h5 className="text-md font-medium text-gray-900 mb-3">Category Performance</h5>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={selectedEvaluation.categories}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="category" angle={-45} textAnchor="end" height={80} />
                        <YAxis domain={[0, 100]} />
                        <Tooltip formatter={(value: any) => [`${value}%`, 'Result']} />
                        <Bar dataKey="result" fill="#3B82F6" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="bg-white border rounded-lg p-4">
                  <h5 className="text-md font-medium text-gray-900 mb-3">Weight Distribution</h5>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={selectedEvaluation.categories.map(cat => ({
                            name: cat.category,
                            value: cat.weight
                          }))}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                          outerRadius={60}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {selectedEvaluation.categories.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value: any) => [`${value}%`, 'Weight']} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Notes */}
              {selectedEvaluation.notes && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Additional Notes</label>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-900">{selectedEvaluation.notes}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
