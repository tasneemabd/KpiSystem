const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const KPIEvaluation = require('../models/KPIEvaluation');

dotenv.config({ path: './config.env' });

const users = [
  {
    email: process.env.ADMIN_EMAIL || 'admin@buniversemr.com', password: process.env.ADMIN_PASSWORD || 'admin123',
    name: 'Sarah Mitchell - System Administrator', employeeId: 'ADM-001', role: 'admin', isFirstLogin: false, isActive: true
  },
  {
    email: 'james.wilson@buniversemr.com', password: 'Manager123!',
    name: 'James Wilson - Operations Manager', employeeId: 'MGR-001', role: 'admin', isFirstLogin: false, isActive: true
  },
  {
    email: 'olivia.brown@buniversemr.com', password: 'Manager123!',
    name: 'Olivia Brown - People Manager', employeeId: 'MGR-002', role: 'admin', isFirstLogin: false, isActive: true
  },
  {
    email: 'noah.davis@buniversemr.com', password: 'Employee123!',
    name: 'Noah Davis - Software Engineer', employeeId: 'EMP-001', role: 'employee', isFirstLogin: false, isActive: true
  },
  {
    email: 'emma.johnson@buniversemr.com', password: 'Employee123!',
    name: 'Emma Johnson - Financial Analyst', employeeId: 'EMP-002', role: 'employee', isFirstLogin: false, isActive: true
  },
  {
    email: 'liam.martin@buniversemr.com', password: 'Employee123!',
    name: 'Liam Martin - Marketing Specialist', employeeId: 'EMP-003', role: 'employee', isFirstLogin: false, isActive: true
  },
  {
    email: 'ava.thompson@buniversemr.com', password: 'Employee123!',
    name: 'Ava Thompson - Customer Success Specialist', employeeId: 'EMP-004', role: 'employee', isFirstLogin: true, isActive: true
  },
  {
    email: 'ethan.anderson@buniversemr.com', password: 'Employee123!',
    name: 'Ethan Anderson - Product Analyst', employeeId: 'EMP-005', role: 'employee', isFirstLogin: false, isActive: false
  }
];

// معايير التقييم الخاصة بكل وظيفة
const kpiProfiles = {
  'EMP-001': {
    categories: [
      { category: 'Delivery velocity', kpiMeasurement: 'Completed sprint commitments on time', weight: 40 },
      { category: 'Code quality', kpiMeasurement: 'Defect-free release rate', weight: 35 },
      { category: 'Collaboration', kpiMeasurement: 'Peer feedback and technical support', weight: 25 }
    ]
  },
  'EMP-002': {
    categories: [
      { category: 'Reporting accuracy', kpiMeasurement: 'Reports completed without material errors', weight: 50 },
      { category: 'Month-end close', kpiMeasurement: 'Close activities completed by deadline', weight: 30 },
      { category: 'Stakeholder service', kpiMeasurement: 'Response quality for internal requests', weight: 20 }
    ]
  },
  'EMP-003': {
    categories: [
      { category: 'Campaign performance', kpiMeasurement: 'Qualified leads generated against target', weight: 45 },
      { category: 'Content delivery', kpiMeasurement: 'Campaign assets delivered on schedule', weight: 30 },
      { category: 'Market insight', kpiMeasurement: 'Actionable competitor and customer insights', weight: 25 }
    ]
  },
  'EMP-004': {
    categories: [
      { category: 'Customer retention', kpiMeasurement: 'Renewal rate for assigned accounts', weight: 45 },
      { category: 'Response time', kpiMeasurement: 'Requests resolved within service target', weight: 30 },
      { category: 'Customer feedback', kpiMeasurement: 'Positive customer feedback score', weight: 25 }
    ]
  },
  'EMP-005': {
    categories: [
      { category: 'Analysis quality', kpiMeasurement: 'Insights supported by reliable data', weight: 40 },
      { category: 'Product discovery', kpiMeasurement: 'Validated opportunities documented', weight: 35 },
      { category: 'Communication', kpiMeasurement: 'Recommendations clearly presented', weight: 25 }
    ]
  }
};

// قائمة الأشهر الـ 15 (من يناير 2025 حتى مارس 2026)
const monthList = [
  { monthOf: 'January 2025', dateOfEvaluation: '2025-01-31' },
  { monthOf: 'February 2025', dateOfEvaluation: '2025-02-28' },
  { monthOf: 'March 2025', dateOfEvaluation: '2025-03-31' },
  { monthOf: 'April 2025', dateOfEvaluation: '2025-04-30' },
  { monthOf: 'May 2025', dateOfEvaluation: '2025-05-31' },
  { monthOf: 'June 2025', dateOfEvaluation: '2025-06-30' },
  { monthOf: 'July 2025', dateOfEvaluation: '2025-07-31' },
  { monthOf: 'August 2025', dateOfEvaluation: '2025-08-31' },
  { monthOf: 'September 2025', dateOfEvaluation: '2025-09-30' },
  { monthOf: 'October 2025', dateOfEvaluation: '2025-10-31' },
  { monthOf: 'November 2025', dateOfEvaluation: '2025-11-30' },
  { monthOf: 'December 2025', dateOfEvaluation: '2025-12-31' },
  { monthOf: 'January 2026', dateOfEvaluation: '2026-01-31' },
  { monthOf: 'February 2026', dateOfEvaluation: '2026-02-28' },
  { monthOf: 'March 2026', dateOfEvaluation: '2026-03-31' }
];

const statuses = ['approved', 'approved', 'approved', 'submitted', 'draft', 'rejected'];
const notesTemplates = [
  'Strong delivery and overall excellent response to monthly objectives.',
  'Met core targets, though slight improvements needed in timing and documentation.',
  'Outstanding performance across all key indicators.',
  'Pending review from direct line manager.',
  'Requires minor revisions in calculation methodology.',
  'Solid consistent results compared to previous quarters.'
];

function generate15Evaluations() {
  const generatedTemplates = [];
  const employees = ['EMP-001', 'EMP-002', 'EMP-003', 'EMP-004', 'EMP-005'];

  employees.forEach((empId) => {
    const profile = kpiProfiles[empId];

    monthList.forEach((m, index) => {
      // تنويع النتائج والحالات بناءً على مؤشر الشهر
      const status = index === 14 ? 'draft' : (index === 13 ? 'submitted' : statuses[index % statuses.length]);
      
      const categories = profile.categories.map((cat) => {
        const grade = Math.floor(Math.random() * 3) + 3; // درجة بين 3 و 5
        const result = Math.floor(Math.random() * 30) + 70; // نسبة بين 70 و 99
        return [cat.category, cat.kpiMeasurement, cat.weight, grade, result];
      });

      // حساب Score الإجمالي التقريبي
      const calculatedScore = categories.reduce((sum, item) => sum + (item[2] * item[4] / 100), 0);

      generatedTemplates.push({
        employeeId: empId,
        monthOf: m.monthOf,
        dateOfEvaluation: m.dateOfEvaluation,
        status: status,
        finalScore: Math.round(calculatedScore),
        notes: notesTemplates[index % notesTemplates.length],
        categories: categories
      });
    });
  });

  return generatedTemplates;
}

const toCategories = (categories) => categories.map(([category, kpiMeasurement, weight, grade, result]) => ({
  category,
  kpiMeasurement,
  weight,
  grade,
  result,
  weightedContribution: Math.round((weight * result / 100) * 100) / 100
}));

async function upsertUser(userData) {
  let user = await User.findOne({
    $or: [{ email: userData.email.toLowerCase() }, { employeeId: userData.employeeId }]
  });
  if (!user) {
    user = await User.create(userData);
    console.log(`Created ${userData.role}: ${userData.name}`);
  } else {
    console.log(`Already exists: ${userData.name}`);
  }
  return user;
}

async function upsertEvaluation(template, employee, evaluator) {
  const evaluationData = {
    monthOf: template.monthOf,
    dateOfEvaluation: new Date(template.dateOfEvaluation),
    employeeId: employee._id,
    employeeName: employee.name,
    evaluatorName: evaluator.name,
    categories: toCategories(template.categories),
    finalScore: template.finalScore,
    status: template.status,
    notes: template.notes,
    createdBy: evaluator._id
  };

  const existing = await KPIEvaluation.findOne({ employeeId: employee._id, monthOf: template.monthOf });
  if (existing) {
    console.log(`Already exists: ${employee.employeeId} / ${template.monthOf}`);
    return existing;
  }

  const evaluation = new KPIEvaluation(evaluationData);
  evaluation.calculateWeightedContributions();
  await evaluation.save();
  console.log(`Created evaluation: ${employee.employeeId} / ${template.monthOf}`);
  return evaluation;
}

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB');

  const usersByEmployeeId = {};
  for (const userData of users) {
    usersByEmployeeId[userData.employeeId] = await upsertUser(userData);
  }

  const evaluationTemplates = generate15Evaluations();
  const evaluator = usersByEmployeeId['ADM-001'];

  for (const template of evaluationTemplates) {
    await upsertEvaluation(template, usersByEmployeeId[template.employeeId], evaluator);
  }

  console.log(`Seed complete: ${users.length} users and ${evaluationTemplates.length} evaluations generated.`);
}

seed()
  .catch((error) => {
    console.error('Seed failed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.connection.close();
  });