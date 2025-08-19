const express = require('express');
const { auth, requireAdmin } = require('../middleware/auth');
const Student = require('../models/Student');
const Class = require('../models/Class');
const User = require('../models/User');

const router = express.Router();

// @route   GET /api/dashboard/stats
// @desc    Get dashboard statistics
// @access  Private
router.get('/stats', auth, async (req, res) => {
  try {
    // Get total counts
    const totalStudents = await Student.countDocuments();
    const totalClasses = await Class.countDocuments();
    const totalUsers = await User.countDocuments();
    
    // Get recent admissions (students added in the last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentAdmissions = await Student.countDocuments({
      created_at: { $gte: thirtyDaysAgo }
    });

    // Get monthly growth for students
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    
    const lastMonthStudents = await Student.countDocuments({
      created_at: { $gte: lastMonth }
    });

    const previousMonth = new Date();
    previousMonth.setMonth(previousMonth.getMonth() - 2);
    
    const previousMonthStudents = await Student.countDocuments({
      created_at: { $gte: previousMonth, $lt: lastMonth }
    });

    // Calculate percentage change
    let studentGrowth = 0;
    if (previousMonthStudents > 0) {
      studentGrowth = ((lastMonthStudents - previousMonthStudents) / previousMonthStudents) * 100;
    }

    // Get recent class additions
    const recentClasses = await Class.countDocuments({
      created_at: { $gte: thirtyDaysAgo }
    });

    // Get user role distribution
    const userRoles = await User.aggregate([
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 }
        }
      }
    ]);

    const roleDistribution = {};
    userRoles.forEach(role => {
      roleDistribution[role._id] = role.count;
    });

    res.json({
      totalStudents,
      totalClasses,
      totalUsers,
      recentAdmissions,
      studentGrowth: Math.round(studentGrowth * 100) / 100,
      recentClasses,
      roleDistribution
    });

  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/dashboard/recent-students
// @desc    Get recent students for dashboard
// @access  Private
router.get('/recent-students', auth, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 5;
    
    const recentStudents = await Student.find()
      .sort({ created_at: -1 })
      .limit(limit)
      .populate('class_id', 'class_name')
      .select('first_name last_name email class_id created_at');

    res.json(recentStudents);

  } catch (error) {
    console.error('Error fetching recent students:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/dashboard/recent-classes
// @desc    Get recent classes for dashboard
// @access  Private
router.get('/recent-classes', auth, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 5;
    
    const recentClasses = await Class.find()
      .sort({ created_at: -1 })
      .limit(limit)
      .select('class_name description capacity semester created_at');

    res.json(recentClasses);

  } catch (error) {
    console.error('Error fetching recent classes:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/dashboard/activity-summary
// @desc    Get recent activity summary for dashboard
// @access  Private
router.get('/activity-summary', auth, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    
    // Get recent students
    const recentStudents = await Student.find()
      .sort({ created_at: -1 })
      .limit(limit)
      .select('first_name last_name created_at');

    // Get recent classes
    const recentClasses = await Class.find()
      .sort({ created_at: -1 })
      .limit(limit)
      .select('class_name created_at');

    // Get recent users
    const recentUsers = await User.find()
      .sort({ created_at: -1 })
      .limit(limit)
      .select('first_name last_name role created_at');

    // Combine and sort all activities
    const activities = [
      ...recentStudents.map(student => ({
        type: 'student',
        action: 'added',
        name: `${student.first_name} ${student.last_name}`,
        timestamp: student.created_at,
        description: `New student ${student.first_name} ${student.last_name} was enrolled`
      })),
      ...recentClasses.map(classItem => ({
        type: 'class',
        action: 'created',
        name: classItem.class_name,
        timestamp: classItem.created_at,
        description: `New class ${classItem.class_name} was created`
      })),
      ...recentUsers.map(user => ({
        type: 'user',
        action: 'registered',
        name: `${user.first_name} ${user.last_name}`,
        timestamp: user.created_at,
        description: `New ${user.role} user ${user.first_name} ${user.last_name} was registered`
      }))
    ];

    // Sort by timestamp (most recent first)
    activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    // Return only the requested limit
    res.json(activities.slice(0, limit));

  } catch (error) {
    console.error('Error fetching activity summary:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/dashboard/class-enrollment
// @desc    Get class enrollment statistics for dashboard
// @access  Private
router.get('/class-enrollment', auth, async (req, res) => {
  try {
    const classEnrollment = await Class.aggregate([
      {
        $lookup: {
          from: 'students',
          localField: '_id',
          foreignField: 'class_id',
          as: 'enrolled_students'
        }
      },
      {
        $project: {
          class_name: 1,
          capacity: 1,
          enrolled_count: { $size: '$enrolled_students' },
          enrollment_percentage: {
            $multiply: [
              { $divide: [{ $size: '$enrolled_students' }, '$capacity'] },
              100
            ]
          }
        }
      },
      {
        $sort: { enrollment_percentage: -1 }
      },
      {
        $limit: 10
      }
    ]);

    res.json(classEnrollment);

  } catch (error) {
    console.error('Error fetching class enrollment:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

