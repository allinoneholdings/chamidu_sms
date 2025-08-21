const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const Attendance = require('../models/Attendance');
const Class = require('../models/Class');
const Student = require('../models/Student');

// Get attendance for a specific class and date
router.get('/class/:classId/date/:date', auth, async (req, res) => {
  try {
    const { classId, date } = req.params;
    
    // Check if user is teacher of this class
    const classObj = await Class.findById(classId);
    if (!classObj) {
      return res.status(404).json({ message: 'Class not found' });
    }
    
    if (classObj.teacher_id.toString() !== req.user._id.toString() && req.user.role !== 'admin' && req.user.role !== 'super_admin') {
      return res.status(403).json({ message: 'Access denied. You can only view attendance for your own classes.' });
    }

    const startDate = new Date(date);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(date);
    endDate.setHours(23, 59, 59, 999);

    const attendance = await Attendance.find({
      class_id: classId,
      date: { $gte: startDate, $lte: endDate }
    }).populate('student_id', 'first_name last_name email');

    res.json(attendance);
  } catch (error) {
    console.error('Error fetching attendance:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Bulk create/update attendance records
router.post('/bulk', auth, async (req, res) => {
  try {
    const { records } = req.body;
    
    if (!records || !Array.isArray(records) || records.length === 0) {
      return res.status(400).json({ message: 'Invalid records data' });
    }

    const results = [];
    
    for (const record of records) {
      const { class_id, student_id, date, status, notes } = record;
      
      // Check if user is teacher of this class
      const classObj = await Class.findById(class_id);
      if (!classObj) {
        return res.status(404).json({ message: `Class ${class_id} not found` });
      }
      
      if (classObj.teacher_id.toString() !== req.user._id.toString() && req.user.role !== 'admin' && req.user.role !== 'super_admin') {
        return res.status(403).json({ message: 'Access denied. You can only mark attendance for your own classes.' });
      }

      // Check if student exists and is in this class
      const student = await Student.findById(student_id);
      if (!student) {
        return res.status(404).json({ message: `Student ${student_id} not found` });
      }
      
      if (student.class_id.toString() !== class_id) {
        return res.status(400).json({ message: `Student ${student_id} is not enrolled in class ${class_id}` });
      }

      // Set the date to start of day for consistency
      const attendanceDate = new Date(date);
      attendanceDate.setHours(0, 0, 0, 0);

      // Try to find existing attendance record
      let attendance = await Attendance.findOne({
        class_id,
        student_id,
        date: attendanceDate
      });

      if (attendance) {
        // Update existing record
        attendance.status = status;
        attendance.notes = notes;
        attendance.marked_by = req.user._id;
        await attendance.save();
        results.push({ action: 'updated', record: attendance });
      } else {
        // Create new record
        attendance = new Attendance({
          class_id,
          student_id,
          date: attendanceDate,
          status,
          notes,
          marked_by: req.user._id
        });
        await attendance.save();
        results.push({ action: 'created', record: attendance });
      }
    }

    res.json({ 
      message: 'Attendance records processed successfully', 
      results,
      total: results.length 
    });
  } catch (error) {
    console.error('Error processing attendance records:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update individual attendance record
router.put('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;
    
    // Find the attendance record
    const attendance = await Attendance.findById(id);
    if (!attendance) {
      return res.status(404).json({ message: 'Attendance record not found' });
    }
    
    // Check if user is teacher of this class or admin
    const classObj = await Class.findById(attendance.class_id);
    if (!classObj) {
      return res.status(404).json({ message: 'Class not found' });
    }
    
    if (classObj.teacher_id.toString() !== req.user._id.toString() && req.user.role !== 'admin' && req.user.role !== 'super_admin') {
      return res.status(403).json({ message: 'Access denied. You can only update attendance for your own classes.' });
    }
    
    // Update the attendance record
    if (status) {
      attendance.status = status;
    }
    if (notes !== undefined) {
      attendance.notes = notes;
    }
    attendance.marked_by = req.user._id;
    
    await attendance.save();
    
    // Populate student and class info for response
    await attendance.populate('student_id', 'first_name last_name');
    await attendance.populate('class_id', 'class_name');
    
    res.json({
      message: 'Attendance updated successfully',
      attendance
    });
  } catch (error) {
    console.error('Error updating attendance:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete individual attendance record
router.delete('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Find the attendance record
    const attendance = await Attendance.findById(id);
    if (!attendance) {
      return res.status(404).json({ message: 'Attendance record not found' });
    }
    
    // Check if user is teacher of this class or admin
    const classObj = await Class.findById(attendance.class_id);
    if (!classObj) {
      return res.status(404).json({ message: 'Class not found' });
    }
    
    if (classObj.teacher_id.toString() !== req.user._id.toString() && req.user.role !== 'admin' && req.user.role !== 'super_admin') {
      return res.status(403).json({ message: 'Access denied. You can only delete attendance for your own classes.' });
    }
    
    await attendance.deleteOne();
    
    res.json({
      message: 'Attendance record deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting attendance:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single attendance record by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    
    const attendance = await Attendance.findById(id)
      .populate('student_id', 'first_name last_name email')
      .populate('class_id', 'class_name')
      .populate('marked_by', 'first_name last_name');
    
    if (!attendance) {
      return res.status(404).json({ message: 'Attendance record not found' });
    }
    
    // Check if user is teacher of this class or admin
    const classObj = await Class.findById(attendance.class_id);
    if (!classObj) {
      return res.status(404).json({ message: 'Class not found' });
    }
    
    if (classObj.teacher_id.toString() !== req.user._id.toString() && req.user.role !== 'admin' && req.user.role !== 'super_admin') {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    res.json(attendance);
  } catch (error) {
    console.error('Error fetching attendance:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get attendance summary for a class
router.get('/class/:classId/summary', auth, async (req, res) => {
  try {
    const { classId } = req.params;
    const { startDate, endDate } = req.query;
    
    // Check if user is teacher of this class
    const classObj = await Class.findById(classId);
    if (!classObj) {
      return res.status(404).json({ message: 'Class not found' });
    }
    
    if (classObj.teacher_id.toString() !== req.user._id.toString() && req.user.role !== 'admin' && req.user.role !== 'super_admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    let dateFilter = {};
    if (startDate && endDate) {
      console.log('Received date parameters:', { startDate, endDate });
      
      // Create dates in local timezone to avoid timezone issues
      const start = new Date(startDate + 'T00:00:00');
      const end = new Date(endDate + 'T23:59:59.999');
      
      console.log('Processed dates:', { 
        start: start.toISOString(), 
        end: end.toISOString(),
        startLocal: start.toString(),
        endLocal: end.toString()
      });
      
      dateFilter = { date: { $gte: start, $lte: end } };
    }

    const attendance = await Attendance.find({
      class_id: classId,
      ...dateFilter
    }).populate('student_id', 'first_name last_name');

    // Group by student and calculate statistics
    const studentStats = {};
    attendance.forEach(record => {
      const studentId = record.student_id._id.toString();
      if (!studentStats[studentId]) {
        studentStats[studentId] = {
          student: record.student_id,
          total: 0,
          present: 0,
          absent: 0,
          late: 0,
          excused: 0
        };
      }
      
      studentStats[studentId].total++;
      studentStats[studentId][record.status]++;
    });

    res.json({
      class: classObj,
      summary: Object.values(studentStats),
      totalRecords: attendance.length
    });
  } catch (error) {
    console.error('Error fetching attendance summary:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

