const mongoose = require('mongoose');

const kpiCategorySchema = new mongoose.Schema({
  category: {
    type: String,
    required: true,
    trim: true
  },
  kpiMeasurement: {
    type: String,
    required: true,
    trim: true
  },
  weight: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  grade: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  result: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  weightedContribution: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  }
});

const kpiEvaluationSchema = new mongoose.Schema({
  monthOf: {
    type: String,
    required: true,
    trim: true
  },
  dateOfEvaluation: {
    type: Date,
    required: true
  },
  employeeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  employeeName: {
    type: String,
    required: true,
    trim: true
  },
  evaluatorName: {
    type: String,
    required: true,
    trim: true
  },
  categories: [kpiCategorySchema],
  finalScore: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  status: {
    type: String,
    enum: ['draft', 'submitted', 'approved', 'rejected'],
    default: 'draft'
  },
  notes: {
    type: String,
    trim: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update timestamp on save
kpiEvaluationSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Calculate final score based on categories
kpiEvaluationSchema.methods.calculateFinalScore = function() {
  if (!this.categories || this.categories.length === 0) {
    return 0;
  }
  
  const totalWeightedContribution = this.categories.reduce((sum, category) => {
    return sum + category.weightedContribution;
  }, 0);
  
  return Math.round(totalWeightedContribution * 100) / 100;
};

// Calculate weighted contribution for each category
kpiEvaluationSchema.methods.calculateWeightedContributions = function() {
  if (!this.categories || this.categories.length === 0) {
    return;
  }
  
  this.categories.forEach(category => {
    category.weightedContribution = Math.round((category.weight * category.result / 100) * 100) / 100;
  });
  
  this.finalScore = this.calculateFinalScore();
};

module.exports = mongoose.model('KPIEvaluation', kpiEvaluationSchema);
