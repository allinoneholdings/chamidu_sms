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
    const classes = await Class.find()
      .populate('teacher_id', 'first_name last_name user_name')
      .sort({ class_name: 1 });
    res.json(classes);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

// @route   GET /api/classes/teacher/:teacherId
// @desc    Get classes assigned to a specific teacher
// @access  Private (Teacher can only see their own classes)
router.get('/teacher/:teacherId', auth, async (req, res) => {
  try {
    const { teacherId } = req.params;
    
    // Check if user is requesting their own classes or is admin
    if (req.user._id.toString() !== teacherId && req.user.role !== 'admin' && req.user.role !== 'super_admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const classes = await Class.find({ teacher_id: teacherId })
      .populate('teacher_id', 'first_name last_name user_name')
      .sort({ class_name: 1 });
    
    res.json(classes);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

// @route   GET /api/classes/my-classes
// @desc    Get classes for the currently logged-in teacher
// @access  Private (Teachers only)
router.get('/my-classes', auth, async (req, res) => {
  try {
    // Only teachers can access this endpoint
    if (req.user.role !== 'teacher') {
      return res.status(403).json({ message: 'Access denied. Only teachers can access this endpoint.' });
    }

    const classes = await Class.find({ teacher_id: req.user._id })
      .populate('teacher_id', 'first_name last_name user_name')
      .sort({ class_name: 1 });
    
    res.json(classes);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

// @route   GET /api/classes/:id/students
// @desc    Get students enrolled in a specific class
// @access  Private (Teacher can only see students in their own classes)
router.get('/:id/students', auth, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if class exists
    const classItem = await Class.findById(id);
    if (!classItem) {
      return res.status(404).json({ message: 'Class not found' });
    }

    // Check if user is teacher of this class or is admin
    if (classItem.teacher_id.toString() !== req.user._id.toString() && req.user.role !== 'admin' && req.user.role !== 'super_admin') {
      return res.status(403).json({ message: 'Access denied. You can only view students in your own classes.' });
    }

    // Get students in this class
    const Student = require('../models/Student');
    const students = await Student.find({ class_id: id })
      .select('first_name last_name email phone_no address admission_date')
      .sort({ first_name: 1, last_name: 1 });
    
    res.json(students);
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
    const classItem = await Class.findById(req.params.id)
      .populate('teacher_id', 'first_name last_name user_name');
    
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
    check('academic_year', 'Academic year is required').not().isEmpty(),
    check('teacher_id', 'Teacher assignment is required').not().isEmpty()
  ]
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { class_name, description, capacity, academic_year, semester, teacher_id } = req.body;

    // Check if class with name already exists
    const existingClass = await Class.findOne({ class_name });
    if (existingClass) {
      return res.status(400).json({ message: 'Class with this name already exists' });
    }

    // Validate that the teacher exists and is actually a teacher
    const User = require('../models/User');
    const teacher = await User.findById(teacher_id);
    if (!teacher || teacher.role !== 'teacher') {
      return res.status(400).json({ message: 'Invalid teacher ID or user is not a teacher' });
    }

    const newClass = new Class({
      class_name,
      description,
      capacity,
      academic_year,
      semester,
      teacher_id
    });

    const classItem = await newClass.save();
    
    // Populate teacher info before sending response
    await classItem.populate('teacher_id', 'first_name last_name user_name');
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
    check('academic_year', 'Academic year is required').not().isEmpty(),
    check('teacher_id', 'Teacher assignment is required').not().isEmpty()
  ]
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { class_name, description, capacity, academic_year, semester, teacher_id } = req.body;

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

    // Validate that the teacher exists and is actually a teacher
    const User = require('../models/User');
    const teacher = await User.findById(teacher_id);
    if (!teacher || teacher.role !== 'teacher') {
      return res.status(400).json({ message: 'Invalid teacher ID or user is not a teacher' });
    }

    // Update class
    classItem.class_name = class_name;
    classItem.description = description;
    classItem.capacity = capacity;
    classItem.academic_year = academic_year;
    classItem.semester = semester;
    classItem.teacher_id = teacher_id;

    await classItem.save();
    
    // Populate teacher info before sending response
    await classItem.populate('teacher_id', 'first_name last_name user_name');
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
