const express = require('express');
const { check, validationResult } = require('express-validator');
const Class = require('../models/Class');
const { auth, requireAdmin, requireSuperAdmin } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/classes
// @desc    Get all classes
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const classes = await Class.find().sort({ class_name: 1 });
    res.json(classes);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

// @route   GET /api/classes/:id
// @desc    Get class by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const classItem = await Class.findById(req.params.id);
    
    if (!classItem) {
      return res.status(404).json({ message: 'Class not found' });
    }
    
    res.json(classItem);
  } catch (error) {
    console.error(error.message);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Class not found' });
    }
    res.status(500).send('Server error');
  }
});

// @route   POST /api/classes
// @desc    Add a new class (Admin and Super Admin only)
// @access  Private
router.post('/', [
  auth,
  requireAdmin,
  [
    check('class_name', 'Class name is required').not().isEmpty(),
    check('academic_year', 'Academic year is required').not().isEmpty()
  ]
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { class_name, description, capacity, academic_year, semester } = req.body;

    // Check if class with name already exists
    const existingClass = await Class.findOne({ class_name });
    if (existingClass) {
      return res.status(400).json({ message: 'Class with this name already exists' });
    }

    const newClass = new Class({
      class_name,
      description,
      capacity,
      academic_year,
      semester
    });

    const classItem = await newClass.save();
    res.json(classItem);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

// @route   PUT /api/classes/:id
// @desc    Update class (Admin and Super Admin only)
// @access  Private
router.put('/:id', [
  auth,
  requireSuperAdmin,
  [
    check('class_name', 'Class name is required').not().isEmpty(),
    check('academic_year', 'Academic year is required').not().isEmpty()
  ]
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { class_name, description, capacity, academic_year, semester } = req.body;

    // Check if class exists
    let classItem = await Class.findById(req.params.id);
    if (!classItem) {
      return res.status(404).json({ message: 'Class not found' });
    }

    // Check if class name is being changed and if it already exists
    if (class_name !== classItem.class_name) {
      const existingClass = await Class.findOne({ class_name });
      if (existingClass) {
        return res.status(400).json({ message: 'Class with this name already exists' });
      }
    }

    // Update class
    classItem.class_name = class_name;
    classItem.description = description;
    classItem.capacity = capacity;
    classItem.academic_year = academic_year;
    classItem.semester = semester;

    await classItem.save();
    res.json(classItem);
  } catch (error) {
    console.error(error.message);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Class not found' });
    }
    res.status(500).send('Server error');
  }
});

// @route   DELETE /api/classes/:id
// @desc    Delete class (Admin and Super Admin only)
// @access  Private
router.delete('/:id', [auth, requireSuperAdmin], async (req, res) => {
  try {
    const classItem = await Class.findById(req.params.id);
    
    if (!classItem) {
      return res.status(404).json({ message: 'Class not found' });
    }

    await classItem.remove();
    res.json({ message: 'Class removed' });
  } catch (error) {
    console.error(error.message);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Class not found' });
    }
    res.status(500).send('Server error');
  }
});

module.exports = router;
