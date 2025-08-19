const express = require('express');
const { check, validationResult } = require('express-validator');
const Student = require('../models/Student');
const { auth, canAddStudents, canModifyStudents } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/students
// @desc    Get all students
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const students = await Student.find()
      .populate('class_id', 'class_name')
      .populate('created_by_user_id', 'first_name last_name')
      .populate('updated_by_user_id', 'first_name last_name')
      .sort({ createdAt: -1 });
    
    res.json(students);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

// @route   GET /api/students/:id
// @desc    Get student by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const student = await Student.findById(req.params.id)
      .populate('class_id', 'class_name')
      .populate('created_by_user_id', 'first_name last_name')
      .populate('updated_by_user_id', 'first_name last_name');
    
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    
    res.json(student);
  } catch (error) {
    console.error(error.message);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Student not found' });
    }
    res.status(500).send('Server error');
  }
});

// @route   POST /api/students
// @desc    Add a new student (Admin and Super Admin only)
// @access  Private
router.post('/', [
  auth,
  canAddStudents,
  [
    check('first_name', 'First name is required').not().isEmpty(),
    check('last_name', 'Last name is required').not().isEmpty(),
    check('date_of_birth', 'Date of birth is required').not().isEmpty(),
    check('email', 'Please include a valid email').isEmail(),
    check('phone_no', 'Phone number is required').not().isEmpty(),
    check('address', 'Address is required').not().isEmpty(),
    check('class_id', 'Class ID is required').not().isEmpty()
  ]
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const {
      first_name,
      last_name,
      date_of_birth,
      email,
      phone_no,
      address,
      class_id,
      admission_date
    } = req.body;

    // Check if student with email already exists
    const existingStudent = await Student.findOne({ email });
    if (existingStudent) {
      return res.status(400).json({ message: 'Student with this email already exists' });
    }

    const newStudent = new Student({
      first_name,
      last_name,
      date_of_birth,
      email,
      phone_no,
      address,
      class_id,
      admission_date: admission_date || new Date(),
      created_by_user_id: req.user.id,
      updated_by_user_id: req.user.id
    });

    const student = await newStudent.save();
    
    const populatedStudent = await Student.findById(student._id)
      .populate('class_id', 'class_name')
      .populate('created_by_user_id', 'first_name last_name')
      .populate('updated_by_user_id', 'first_name last_name');

    res.json(populatedStudent);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

// @route   PUT /api/students/:id
// @desc    Update student (Super Admin only)
// @access  Private
router.put('/:id', [
  auth,
  canModifyStudents,
  [
    check('first_name', 'First name is required').not().isEmpty(),
    check('last_name', 'Last name is required').not().isEmpty(),
    check('date_of_birth', 'Date of birth is required').not().isEmpty(),
    check('email', 'Please include a valid email').isEmail(),
    check('phone_no', 'Phone number is required').not().isEmpty(),
    check('address', 'Address is required').not().isEmpty(),
    check('class_id', 'Class ID is required').not().isEmpty()
  ]
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const {
      first_name,
      last_name,
      date_of_birth,
      email,
      phone_no,
      address,
      class_id
    } = req.body;

    // Check if student exists
    let student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Check if email is being changed and if it already exists
    if (email !== student.email) {
      const existingStudent = await Student.findOne({ email });
      if (existingStudent) {
        return res.status(400).json({ message: 'Student with this email already exists' });
      }
    }

    // Update student
    student.first_name = first_name;
    student.last_name = last_name;
    student.date_of_birth = date_of_birth;
    student.email = email;
    student.phone_no = phone_no;
    student.address = address;
    student.class_id = class_id;
    student.updated_by_user_id = req.user.id;

    await student.save();
    
    const updatedStudent = await Student.findById(student._id)
      .populate('class_id', 'class_name')
      .populate('created_by_user_id', 'first_name last_name')
      .populate('updated_by_user_id', 'first_name last_name');

    res.json(updatedStudent);
  } catch (error) {
    console.error(error.message);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Student not found' });
    }
    res.status(500).send('Server error');
  }
});

// @route   DELETE /api/students/:id
// @desc    Delete student (Super Admin only)
// @access  Private
router.delete('/:id', [auth, canModifyStudents], async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    await student.remove();
    res.json({ message: 'Student removed' });
  } catch (error) {
    console.error(error.message);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Student not found' });
    }
    res.status(500).send('Server error');
  }
});

module.exports = router;

