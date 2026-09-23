const express = require('express');
const { body, validationResult } = require('express-validator');
const KPIEvaluation = require('../models/KPIEvaluation');
const User = require('../models/User');
const { authenticateToken, requireAdmin, requireOwnershipOrAdmin } = require('../middleware/auth');

const router = express.Router();

// Get all KPI evaluations (admin only)
router.get('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const evaluations = await KPIEvaluation.find()
      .populate('employeeId', 'name employeeId email')
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 });

    res.json(evaluations);
  } catch (error) {
    console.error('Get evaluations error:', error);
    res.status(500).json({ message: 'Failed to get evaluations' });
  }
});

// Get KPI evaluations for a specific employee
router.get('/employee/:employeeId', authenticateToken, async (req, res) => {
  try {
    const { employeeId } = req.params;
    
    // Check if user can access this data
    if (req.user.role !== 'admin' && req.user._id.toString() !== employeeId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const evaluations = await KPIEvaluation.find({ employeeId })
      .populate('employeeId', 'name employeeId email')
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 });

    res.json(evaluations);
  } catch (error) {
    console.error('Get employee evaluations error:', error);
    res.status(500).json({ message: 'Failed to get evaluations' });
  }
});

// Get single KPI evaluation by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const evaluation = await KPIEvaluation.findById(req.params.id)
      .populate('employeeId', 'name employeeId email')
      .populate('createdBy', 'name');

    if (!evaluation) {
      return res.status(404).json({ message: 'Evaluation not found' });
    }

    // Check if user can access this evaluation
    if (req.user.role !== 'admin' && req.user._id.toString() !== evaluation.employeeId._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(evaluation);
  } catch (error) {
    console.error('Get evaluation error:', error);
    res.status(500).json({ message: 'Failed to get evaluation' });
  }
});

// Create new KPI evaluation (admin only)
router.post('/', [
  authenticateToken,
  requireAdmin,
  body('monthOf').notEmpty().trim(),
  body('dateOfEvaluation').isISO8601(),
  body('employeeId').isMongoId(),
  body('employeeName').notEmpty().trim(),
  body('evaluatorName').notEmpty().trim(),
  body('categories').isArray({ min: 1 }),
  body('categories.*.category').notEmpty().trim(),
  body('categories.*.kpiMeasurement').notEmpty().trim(),
  body('categories.*.weight').isFloat({ min: 0, max: 100 }),
  body('categories.*.grade').isInt({ min: 1, max: 5 }),
  body('categories.*.result').isFloat({ min: 0, max: 100 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const evaluationData = req.body;
    
    // Verify employee exists
    const employee = await User.findById(evaluationData.employeeId);
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    // Create evaluation
    const evaluation = new KPIEvaluation({
      ...evaluationData,
      createdBy: req.user._id
    });

    // Calculate weighted contributions and final score
    evaluation.calculateWeightedContributions();

    await evaluation.save();

    // Populate references
    await evaluation.populate('employeeId', 'name employeeId email');
    await evaluation.populate('createdBy', 'name');

    res.status(201).json(evaluation);
  } catch (error) {
    console.error('Create evaluation error:', error);
    res.status(500).json({ message: 'Failed to create evaluation' });
  }
});

// Update KPI evaluation (admin only)
router.put('/:id', [
  authenticateToken,
  requireAdmin,
  body('monthOf').notEmpty().trim(),
  body('dateOfEvaluation').isISO8601(),
  body('employeeName').notEmpty().trim(),
  body('evaluatorName').notEmpty().trim(),
  body('categories').isArray({ min: 1 }),
  body('categories.*.category').notEmpty().trim(),
  body('categories.*.kpiMeasurement').notEmpty().trim(),
  body('categories.*.weight').isFloat({ min: 0, max: 100 }),
  body('categories.*.grade').isInt({ min: 1, max: 5 }),
  body('categories.*.result').isFloat({ min: 0, max: 100 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const updateData = req.body;

    const evaluation = await KPIEvaluation.findById(id);
    if (!evaluation) {
      return res.status(404).json({ message: 'Evaluation not found' });
    }

    // Update fields
    Object.assign(evaluation, updateData);
    
    // Calculate weighted contributions and final score
    evaluation.calculateWeightedContributions();

    await evaluation.save();

    // Populate references
    await evaluation.populate('employeeId', 'name employeeId email');
    await evaluation.populate('createdBy', 'name');

    res.json(evaluation);
  } catch (error) {
    console.error('Update evaluation error:', error);
    res.status(500).json({ message: 'Failed to update evaluation' });
  }
});

// Delete KPI evaluation (admin only)
router.delete('/:id', [authenticateToken, requireAdmin], async (req, res) => {
  try {
    const { id } = req.params;
    
    const evaluation = await KPIEvaluation.findById(id);
    if (!evaluation) {
      return res.status(404).json({ message: 'Evaluation not found' });
    }

    await KPIEvaluation.findByIdAndDelete(id);
    res.json({ message: 'Evaluation deleted successfully' });
  } catch (error) {
    console.error('Delete evaluation error:', error);
    res.status(500).json({ message: 'Failed to delete evaluation' });
  }
});

// Update evaluation status (admin only)
router.patch('/:id/status', [
  authenticateToken,
  requireAdmin,
  body('status').isIn(['draft', 'submitted', 'approved', 'rejected']),
  body('notes').optional().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { status, notes } = req.body;

    const evaluation = await KPIEvaluation.findById(id);
    if (!evaluation) {
      return res.status(404).json({ message: 'Evaluation not found' });
    }

    evaluation.status = status;
    if (notes) evaluation.notes = notes;

    await evaluation.save();

    res.json(evaluation);
  } catch (error) {
    console.error('Update status error:', error);
    res.status(500).json({ message: 'Failed to update status' });
  }
});

module.exports = router;
