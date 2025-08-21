const express = require('express');
const router = express.Router();
const { auth, requireAdmin, requireSuperAdmin } = require('../middleware/auth');
const Teacher = require('../models/Teacher');
const User = require('../models/User');
const Class = require('../models/Class');

// @route   GET /api/teachers
// @desc    Get all teachers
// @access  Private (Admin/Super Admin)
router.get('/', auth, requireAdmin, async (req, res) => {
  try {
    const teachers = await Teacher.find()
      .populate('user_id', 'first_name last_name email user_name role')
      .populate('classes_assigned', 'class_name description');
    
    res.json(teachers);
  } catch (error) {
    console.error('Error fetching teachers:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/teachers/:id
// @desc    Get teacher by ID
// @access  Private (Admin/Super Admin)
router.get('/:id', auth, requireAdmin, async (req, res) => {
  try {
    const teacher = await Teacher.findById(req.params.id)
      .populate('user_id', 'first_name last_name email user_name role')
      .populate('classes_assigned', 'class_name description capacity academic_year semester');
    
    if (!teacher) {
      return res.status(404).json({ message: 'Teacher not found' });
    }
    
    res.json(teacher);
  } catch (error) {
    console.error('Error fetching teacher:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/teachers
// @desc    Create a new teacher
// @access  Private (Admin/Super Admin)
router.post('/', auth, requireAdmin, async (req, res) => {
  try {
    const {
      user_id,
      employee_id,
      department,
      specialization,
      qualification,
      experience_years,
      salary,
      contact_number,
      address,
      emergency_contact,
      subjects
    } = req.body;

    // Check if teacher already exists
    const existingTeacher = await Teacher.findOne({ 
      $or: [{ user_id }, { employee_id }] 
    });
    
    if (existingTeacher) {
      return res.status(400).json({ 
        message: 'Teacher with this user ID or employee ID already exists' 
      });
    }

    // Validate user exists and is a teacher
    const user = await User.findById(user_id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    if (user.role !== 'teacher') {
      return res.status(400).json({ message: 'User must have teacher role' });
    }

    // Create new teacher
    const teacher = new Teacher({
      user_id,
      employee_id,
      department,
      specialization,
      qualification,
      experience_years: experience_years || 0,
      salary: salary || 0,
      contact_number,
      address,
      emergency_contact,
      subjects: subjects || []
    });

    await teacher.save();
    
    // Populate user info for response
    await teacher.populate('user_id', 'first_name last_name email user_name role');
    
    res.status(201).json(teacher);
  } catch (error) {
    console.error('Error creating teacher:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/teachers/:id
// @desc    Update teacher
// @access  Private (Admin/Super Admin)
router.put('/:id', auth, requireAdmin, async (req, res) => {
  try {
    const {
      department,
      specialization,
      qualification,
      experience_years,
      salary,
      contact_number,
      address,
      emergency_contact,
      subjects,
      status
    } = req.body;

    const teacher = await Teacher.findById(req.params.id);
    if (!teacher) {
      return res.status(404).json({ message: 'Teacher not found' });
    }

    // Update fields
    if (department) teacher.department = department;
    if (specialization !== undefined) teacher.specialization = specialization;
    if (qualification) teacher.qualification = qualification;
    if (experience_years !== undefined) teacher.experience_years = experience_years;
    if (salary !== undefined) teacher.salary = salary;
    if (contact_number !== undefined) teacher.contact_number = contact_number;
    if (address) teacher.address = address;
    if (emergency_contact) teacher.emergency_contact = emergency_contact;
    if (subjects) teacher.subjects = subjects;
    if (status) teacher.status = status;

    await teacher.save();
    
    // Populate user info for response
    await teacher.populate('user_id', 'first_name last_name email user_name role');
    
    res.json(teacher);
  } catch (error) {
    console.error('Error updating teacher:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/teachers/:id
// @desc    Delete teacher
// @access  Private (Super Admin only)
router.delete('/:id', auth, requireSuperAdmin, async (req, res) => {
  try {
    const teacher = await Teacher.findById(req.params.id);
    if (!teacher) {
      return res.status(404).json({ message: 'Teacher not found' });
    }

    // Check if teacher has assigned classes
    if (teacher.classes_assigned && teacher.classes_assigned.length > 0) {
      return res.status(400).json({ 
        message: 'Cannot delete teacher with assigned classes. Please reassign classes first.' 
      });
    }

    await Teacher.findByIdAndDelete(req.params.id);
    res.json({ message: 'Teacher deleted successfully' });
  } catch (error) {
    console.error('Error deleting teacher:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/teachers/department/:department
// @desc    Get teachers by department
// @access  Private (Admin/Super Admin)
router.get('/department/:department', auth, requireAdmin, async (req, res) => {
  try {
    const teachers = await Teacher.findByDepartment(req.params.department)
      .populate('user_id', 'first_name last_name email user_name role')
      .populate('classes_assigned', 'class_name');
    
    res.json(teachers);
  } catch (error) {
    console.error('Error fetching teachers by department:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/teachers/available
// @desc    Get available teachers
// @access  Private (Admin/Super Admin)
router.get('/available', auth, requireAdmin, async (req, res) => {
  try {
    const teachers = await Teacher.findAvailable()
      .populate('user_id', 'first_name last_name email user_name role')
      .populate('classes_assigned', 'class_name');
    
    res.json(teachers);
  } catch (error) {
    console.error('Error fetching available teachers:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/teachers/:id/assign-class
// @desc    Assign a class to a teacher
// @access  Private (Admin/Super Admin)
router.post('/:id/assign-class', auth, requireAdmin, async (req, res) => {
  try {
    const { class_id } = req.body;
    
    if (!class_id) {
      return res.status(400).json({ message: 'Class ID is required' });
    }

    const teacher = await Teacher.findById(req.params.id);
    if (!teacher) {
      return res.status(404).json({ message: 'Teacher not found' });
    }

    const classObj = await Class.findById(class_id);
    if (!classObj) {
      return res.status(404).json({ message: 'Class not found' });
    }

    // Check if class is already assigned to another teacher
    if (classObj.teacher_id && classObj.teacher_id.toString() !== teacher.user_id.toString()) {
      return res.status(400).json({ message: 'Class is already assigned to another teacher' });
    }

    // Assign class to teacher
    await teacher.assignClass(class_id);
    
    // Update class with teacher_id
    classObj.teacher_id = teacher.user_id;
    await classObj.save();

    res.json({ message: 'Class assigned successfully', teacher });
  } catch (error) {
    console.error('Error assigning class:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/teachers/:id/remove-class/:classId
// @desc    Remove a class assignment from a teacher
// @access  Private (Admin/Super Admin)
router.delete('/:id/remove-class/:classId', auth, requireAdmin, async (req, res) => {
  try {
    const teacher = await Teacher.findById(req.params.id);
    if (!teacher) {
      return res.status(404).json({ message: 'Teacher not found' });
    }

    const classId = req.params.classId;
    
    // Remove class from teacher
    await teacher.removeClass(classId);
    
    // Remove teacher_id from class
    await Class.findByIdAndUpdate(classId, { $unset: { teacher_id: 1 } });

    res.json({ message: 'Class assignment removed successfully', teacher });
  } catch (error) {
    console.error('Error removing class assignment:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/teachers/:id/availability
// @desc    Update teacher availability
// @access  Private (Admin/Super Admin)
router.put('/:id/availability', auth, requireAdmin, async (req, res) => {
  try {
    const { availability } = req.body;
    
    if (!availability) {
      return res.status(400).json({ message: 'Availability data is required' });
    }

    const teacher = await Teacher.findById(req.params.id);
    if (!teacher) {
      return res.status(404).json({ message: 'Teacher not found' });
    }

    // Update availability
    teacher.availability = { ...teacher.availability, ...availability };
    await teacher.save();
    
    res.json({ message: 'Availability updated successfully', teacher });
  } catch (error) {
    console.error('Error updating availability:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;







