'use client';

import { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import axios from 'axios';
import { Plus, Trash2, Save, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '@/contexts/AuthContext';

interface Employee {
  _id: string;
  name: string;
  employeeId: string;
  email: string;
  role: string;
}

// interface KPICategory {
//   category: string;
//   kpiMeasurement: string;
//   weight: number;
//   grade: number;
//   result: number;
// }
const fixedCategories: KPICategory[] = [
  { category: 'Personal', kpiMeasurement: 'Punctuality & Attendance - Attendance log', weight: 3, grade: 1, result: 0 },
  { category: 'Personal', kpiMeasurement: 'Adaptability - Supervisor observation + self-reflection', weight: 2, grade: 1, result: 0 },
  { category: 'Personal', kpiMeasurement: 'Communication Etiquette - Email/chat etiquette, meeting behavior', weight: 2, grade: 1, result: 0 },
  { category: 'Professional', kpiMeasurement: 'Company Tools Adoption - Onboarding checklist completion', weight: 5, grade: 1, result: 0 },
  { category: 'Professional', kpiMeasurement: 'Understanding of Beyond Universe Mission - Short presentation / written summary', weight: 5, grade: 1, result: 0 },
  { category: 'Professional', kpiMeasurement: 'Professional Appearance & Behavior - Manager observation', weight: 3, grade: 1, result: 0 },
  { category: 'Task & Skills', kpiMeasurement: 'Task Completion Rate - Projects platform / supervisor view', weight: 6, grade: 1, result: 0 },
  { category: 'Task & Skills', kpiMeasurement: 'Accuracy & Quality - Supervisor review', weight: 6, grade: 1, result: 0 },
  { category: 'Task & Skills', kpiMeasurement: 'Initiative - Peer/supervisor feedback', weight: 6, grade: 1, result: 0 },
  { category: 'Deliverables', kpiMeasurement: 'Initial Project Contribution - Submission & evaluation', weight: 8, grade: 1, result: 0 },
  { category: 'Deliverables', kpiMeasurement: 'Documentation & Reporting - Manager review', weight: 3, grade: 1, result: 0 },
  { category: 'Deliverables', kpiMeasurement: 'Presentation Demo or Self-production - Scheduled at end of week 4', weight: 3, grade: 1, result: 0 },
  { category: 'Technical Skills', kpiMeasurement: 'Technical Onboarding Completion - Checklist completion', weight: 3, grade: 1, result: 0 },
  { category: 'Technical Skills', kpiMeasurement: 'Skill Application - Output review', weight: 5, grade: 1, result: 0 },
  { category: 'Technical Skills', kpiMeasurement: 'Problem Solving - Issue logs / peer feedback', weight: 5, grade: 1, result: 0 },
  { category: 'Attitude', kpiMeasurement: 'Team Collaboration - Peer review', weight: 10, grade: 1, result: 0 },
  { category: 'Attitude', kpiMeasurement: 'Enthusiasm & Ownership - Supervisor notes', weight: 10, grade: 1, result: 0 },
  { category: 'Attitude', kpiMeasurement: 'Receptiveness to Feedback - Feedback loop tracking', weight: 10, grade: 1, result: 0 },
  { category: 'Strategic Understanding', kpiMeasurement: "BU's Core Technologies - Quiz or peer interview", weight: 3, grade: 1, result: 0 },
  { category: 'Strategic Understanding', kpiMeasurement: 'Industry Awareness - Insight shared in team channel', weight: 2, grade: 1, result: 0 },
];

interface EvaluationForm {
  monthOf: string;
  dateOfEvaluation: string;
  employeeId: string;
  employeeName: string;
  evaluatorName: string;
  categories: KPICategory[];
  notes?: string;
}

export default function CreateEvaluation() {
  const { user } = useAuth();
  const [users, setUsers] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Check if user is admin
  useEffect(() => {
    if (user && user.role !== 'admin') {
      toast.error('Access denied. Admin privileges required.');
      return;
    }
  }, [user]);

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors }
  } = useForm<EvaluationForm>({
    defaultValues: {
      monthOf: '',
      dateOfEvaluation: new Date().toISOString().split('T')[0],
      employeeId: '',
      employeeName: '',
      evaluatorName: '',
      categories: [
        {
          category: '',
          kpiMeasurement: '',
          weight: 0,
          grade: 1,
          result: 0
        }
      ],
      notes: ''
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'categories'
  });
  
  useEffect(() => {
    setValue('categories', fixedCategories);
  }, [setValue]);
  
  const watchedCategories = watch('categories');
  const selectedEmployeeId = watch('employeeId');

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (selectedEmployeeId) {
      const selectedUser = users.find(user => user._id === selectedEmployeeId);
      if (selectedUser) {
        setValue('employeeName', selectedUser.name);
      }
    }
  }, [selectedEmployeeId, users, setValue]);

  const fetchUsers = async () => {
    try {
      const response = await axios.get('/api/users');
      const employees = response.data.filter((user: Employee) => user.role === 'employee');
      setUsers(employees);
    } catch (error: any) {
      toast.error('Failed to fetch employees');
      console.error('Error fetching users:', error);
    }
  };

  const addCategory = () => {
    append({
      category: '',
      kpiMeasurement: '',
      weight: 0,
      grade: 1,
      result: 0
    });
  };

  const removeCategory = (index: number) => {
    if (fields.length > 1) {
      remove(index);
    }
  };

  const calculateWeightedContribution = (weight: number, result: number) => {
    return Math.round((weight * result / 100) * 100) / 100;
  };

  const calculateFinalScore = () => {
    if (!watchedCategories) return 0;
    
    const totalWeightedContribution = watchedCategories.reduce((sum, category) => {
      return sum + calculateWeightedContribution(category.weight, category.result);
    }, 0);
    
    return Math.round(totalWeightedContribution * 100) / 100;
  };

  const onSubmit = async (data: EvaluationForm) => {
    // Check if user is admin
    if (!user || user.role !== 'admin') {
      toast.error('Access denied. Admin privileges required.');
      return;
    }

    console.log('Form submission started with data:', data);
    setIsSubmitting(true);
    try {
      // Calculate weighted contributions and final score
      const categoriesWithCalculations = data.categories.map(category => ({
        ...category,
        weightedContribution: calculateWeightedContribution(category.weight, category.result)
      }));

      const finalScore = calculateFinalScore();

      const evaluationData = {
        ...data,
        categories: categoriesWithCalculations,
        finalScore
      };

    

      console.log('Submitting evaluation data:', evaluationData);
      console.log('API endpoint: /api/kpi');
      console.log('User role:', user.role);
      console.log('Auth token:', axios.defaults.headers.common['Authorization']);

      const response = await axios.post('/api/kpi', evaluationData);
      console.log('API response:', response.data);
      
      toast.success('KPI evaluation created successfully!');
      reset();
      
      // Reset to default categories
      setValue('categories', [{
        category: '',
        kpiMeasurement: '',
        weight: 0,
        grade: 1,
        result: 0
      }]);
    } catch (error: any) {
      console.error('Form submission error:', error);
      console.error('Error response:', error.response);
      console.error('Error message:', error.message);
      
      const message = error.response?.data?.message || 'Failed to create evaluation';
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };
  const allResultsFilled = watchedCategories?.every(
    (category) => category.result !== null && category.result !== undefined && category.result !== ''
  );
  
  
  // const totalWeight = watchedCategories?.reduce((sum, category) => sum + (category.weight || 0), 0) || 0;
  const totalWeight = watchedCategories?.reduce(
    (sum, category) => sum + Number(category.weight || 0),
    0
  ) || 0;
  
  const finalScore = calculateFinalScore();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Create KPI Evaluation</h3>
        <div className="text-sm text-gray-600">
          {user ? (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              user.role === 'admin' 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              {user.role === 'admin' ? 'Admin User' : 'Regular User'}
            </span>
          ) : (
            <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
              Not Authenticated
            </span>
          )}
        </div>
      </div>

      {/* Authentication Warning */}
      {(!user || user.role !== 'admin') && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <div className="text-red-600">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <div className="text-red-800">
              <p className="font-medium">Admin Access Required</p>
              <p className="text-sm">You must be logged in as an administrator to create KPI evaluations.</p>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className={`space-y-6 ${(!user || user.role !== 'admin') ? 'opacity-50 pointer-events-none' : ''}`}>
        {/* Basic Information */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h4 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Month Of <span className="text-danger-600">*</span>
              </label>
              <input
                {...register('monthOf', { required: 'Month is required' })}
                type="text"
                className="input"
                placeholder="e.g., Jul-25"
              />
              {errors.monthOf && (
                <p className="mt-1 text-sm text-danger-600">{errors.monthOf.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date of Evaluation <span className="text-danger-600">*</span>
              </label>
              <input
                {...register('dateOfEvaluation', { required: 'Date is required' })}
                type="date"
                className="input"
              />
              {errors.dateOfEvaluation && (
                <p className="mt-1 text-sm text-danger-600">{errors.dateOfEvaluation.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Employee <span className="text-danger-600">*</span>
              </label>
              <select
                {...register('employeeId', { required: 'Employee is required' })}
                className="input"
              >
                <option value="">Select an employee</option>
                {users.map((user) => (
                  <option key={user._id} value={user._id}>
                    {user.name} ({user.employeeId})
                  </option>
                ))}
              </select>
              {errors.employeeId && (
                <p className="mt-1 text-sm text-danger-600">{errors.employeeId.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Evaluator Name <span className="text-danger-600">*</span>
              </label>
              <input
                {...register('evaluatorName', { required: 'Evaluator name is required' })}
                type="text"
                className="input"
                placeholder="Enter evaluator name"
              />
              {errors.evaluatorName && (
                <p className="mt-1 text-sm text-danger-600">{errors.evaluatorName.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* KPI Categories */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-medium text-gray-900">KPI Categories</h4>
            <button
              type="button"
              onClick={addCategory}
              className="btn-primary flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>Add Category</span>
            </button>
          </div>

          <div className="space-y-4">
            {fields.map((field, index) => (
              <div key={field.id} className="border rounded-lg p-4 bg-gray-50">
                <div className="flex items-center justify-between mb-3">
                  <h5 className="font-medium text-gray-900">Category {index + 1}</h5>
                  {fields.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeCategory(index)}
                      className="text-danger-600 hover:text-danger-700 p-1"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Category <span className="text-danger-600">*</span>
                    </label>
                    {/* <input
                      {...register(`categories.${index}.category` as const, {
                        required: 'Category is required'
                      })}
                      type="text"
                      className="input text-sm"
                      placeholder="e.g., Personal - Punctuality"
                    /> */}

<div className="text-sm font-medium text-primary-600 p-2 bg-primary-50 rounded border">
{field.category}</div>

                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      KPI Measurement <span className="text-danger-600">*</span>
                    </label>
                    {/* <input
                      {...register(`categories.${index}.kpiMeasurement` as const, {
                        required: 'KPI measurement is required'
                      })}
                      type="text"
                      className="input text-sm"
                      placeholder="e.g., Attendance log"
                    /> */}

<div className="text-sm font-medium text-primary-600 p-2 bg-primary-50 rounded border">{field.kpiMeasurement}</div>

                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Weight (%) <span className="text-danger-600">*</span>
                    </label>
                    {/* <input
                      {...register(`categories.${index}.weight` as const, {
                        required: 'Weight is required',
                        min: { value: 0, message: 'Weight must be positive' },
                        max: { value: 100, message: 'Weight cannot exceed 100%' }
                      })}
                      type="number"
                      step="0.1"
                      className="input text-sm"
                      placeholder="0"
                    /> */}
                    <div className="text-sm font-medium text-primary-600 p-2 bg-primary-50 rounded border">{field.weight}</div>

                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Grade (1-5) <span className="text-danger-600">*</span>
                    </label>
                    <select
                      {...register(`categories.${index}.grade` as const, {
                        required: 'Grade is required'
                      })}
                      className="input text-sm"
                    >
                      <option value={1}>1</option>
                      <option value={2}>2</option>
                      <option value={3}>3</option>
                      <option value={4}>4</option>
                      <option value={5}>5</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Result (%) <span className="text-danger-600">*</span>
                    </label>
                    <input
                      {...register(`categories.${index}.result` as const, {
                        required: 'Result is required',
                        min: { value: 0, message: 'Result must be positive' },
                        max: { value: 100, message: 'Result cannot exceed 100%' }
                      })}
                      type="number"
                      step="0.1"
                      className="input text-sm"
                      placeholder="0"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Weighted Contribution
                    </label>
                    <div className="text-sm font-medium text-primary-600 p-2 bg-primary-50 rounded border">
                      {watchedCategories?.[index] ? 
                        calculateWeightedContribution(
                          watchedCategories[index].weight || 0,
                          watchedCategories[index].result || 0
                        ).toFixed(2) + '%' : '0%'
                      }
                    </div>
                  </div>
                </div>

                {errors.categories?.[index] && (
                  <div className="mt-2 text-sm text-danger-600">
                    {Object.values(errors.categories[index] || {}).map((error: any, i) => (
                      <p key={i}>{error?.message}</p>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Weight and Score Summary */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-sm text-gray-600">Total Weight</div>
                <div className={`text-lg font-bold ${totalWeight == 100 ? 'text-success-600' : 'text-danger-600'}`}>
                  {totalWeight}%
                </div>
                {totalWeight !== 100 && (
                  <div className="text-xs text-gray-500">
                    {totalWeight > 100 ? 'Exceeds 100%' : 'Less than 100%'}
                  </div>
                )}
              </div>
              
              <div>
                <div className="text-sm text-gray-600">Final Score</div>
                <div className="text-2xl font-bold text-primary-600">
                  {finalScore}%
                </div>
              </div>
              
              <div>
                <div className="text-sm text-gray-600">Status</div>
                {/* <div className="text-sm font-medium text-gray-900">
                  {totalWeight === 100 ? 'Ready to Submit' : 'Check Weights'}
                </div> */}

<div className="text-sm font-medium text-gray-900">
  { allResultsFilled ? 'Ready to Submit' : ' Complete Results'}
</div>

              </div>
            </div>
            
            {/* Weight Requirement Help */}
            {totalWeight !== 100 && (
              <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center space-x-2">
                  <div className="text-yellow-600">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  </div>
                  <div className="text-yellow-800 text-sm">
                    <strong>Submit Button Disabled:</strong> The total weight of all KPI categories must equal exactly 100% to submit the evaluation.
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Notes */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h4 className="text-lg font-medium text-gray-900 mb-4">Additional Notes</h4>
          <textarea
            {...register('notes')}
            rows={3}
            className="input"
            placeholder="Enter any additional notes or comments..."
          />
        </div>

        {/* Submit Button */}
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => reset()}
            className="btn-secondary"
          >
            Reset Form
          </button>
          <button
            type="submit"
            disabled={isSubmitting || totalWeight !== 100}
            className="btn-primary flex items-center space-x-2"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Creating...</span>
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                <span>Create Evaluation</span>
              </>
            )}
          </button>
        </div>

        {/* Debug Information */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-4 p-4 bg-gray-100 rounded-lg text-xs text-gray-600">
            <h5 className="font-medium mb-2">Debug Info:</h5>
            <div className="space-y-1">
              <div>User Role: {user?.role || 'Not logged in'}</div>
              <div>Total Weight: {totalWeight}%</div>
              <div>Final Score: {finalScore}%</div>
              <div>Submit Button Disabled: {isSubmitting || totalWeight !== 100 ? 'Yes' : 'No'}</div>
              <div>Form Disabled: {(!user || user.role !== 'admin') ? 'Yes' : 'No'}</div>
            </div>
          </div>  
        )}
      </form>
    </div>
  );
}
