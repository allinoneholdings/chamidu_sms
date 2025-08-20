const mongoose = require('mongoose');

const teacherSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  employee_id: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  department: {
    type: String,
    required: true,
    trim: true
  },
  specialization: {
    type: String,
    trim: true
  },
  qualification: {
    type: String,
    required: true,
    trim: true
  },
  experience_years: {
    type: Number,
    default: 0,
    min: 0
  },
  hire_date: {
    type: Date,
    default: Date.now
  },
  salary: {
    type: Number,
    min: 0
  },
  contact_number: {
    type: String,
    trim: true
  },
  address: {
    street: String,
    city: String,
    state: String,
    zip_code: String,
    country: String
  },
  emergency_contact: {
    name: String,
    relationship: String,
    phone: String,
    email: String
  },
  subjects: [{
    type: String,
    trim: true
  }],
  availability: {
    monday: {
      start: String,
      end: String,
      available: { type: Boolean, default: true }
    },
    tuesday: {
      start: String,
      end: String,
      available: { type: Boolean, default: true }
    },
    wednesday: {
      start: String,
      end: String,
      available: { type: Boolean, default: true }
    },
    thursday: {
      start: String,
      end: String,
      available: { type: Boolean, default: true }
    },
    friday: {
      start: String,
      end: String,
      available: { type: Boolean, default: true }
    },
    saturday: {
      start: String,
      end: String,
      available: { type: Boolean, default: false }
    },
    sunday: {
      start: String,
      end: String,
      available: { type: Boolean, default: false }
    }
  },
  performance_metrics: {
    student_satisfaction: {
      type: Number,
      min: 0,
      max: 5,
      default: 0
    },
    attendance_rate: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },
    class_completion_rate: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    }
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'on_leave', 'terminated'],
    default: 'active'
  },
  notes: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Index for better query performance
teacherSchema.index({ user_id: 1 });
teacherSchema.index({ employee_id: 1 });
teacherSchema.index({ department: 1 });
teacherSchema.index({ status: 1 });

// Virtual for full name
teacherSchema.virtual('full_name').get(function() {
  if (this.user_id && this.user_id.first_name && this.user_id.last_name) {
    return `${this.user_id.first_name} ${this.user_id.last_name}`;
  }
  return '';
});

// Virtual for total classes
teacherSchema.virtual('total_classes').get(function() {
  return this.classes_assigned ? this.classes_assigned.length : 0;
});

// Method to get teacher's schedule
teacherSchema.methods.getSchedule = function() {
  const schedule = {};
  for (const [day, availability] of Object.entries(this.availability)) {
    if (availability.available) {
      schedule[day] = {
        start: availability.start,
        end: availability.end
      };
    }
  }
  return schedule;
};

// Method to check if teacher is available on a specific day and time
teacherSchema.methods.isAvailable = function(day, time) {
  const dayAvailability = this.availability[day.toLowerCase()];
  if (!dayAvailability || !dayAvailability.available) {
    return false;
  }
  
  // Simple time comparison (you can enhance this logic)
  return time >= dayAvailability.start && time <= dayAvailability.end;
};

// Method to add a class assignment
teacherSchema.methods.assignClass = function(classId) {
  if (!this.classes_assigned.includes(classId)) {
    this.classes_assigned.push(classId);
    return this.save();
  }
  return Promise.resolve(this);
};

// Method to remove a class assignment
teacherSchema.methods.removeClass = function(classId) {
  this.classes_assigned = this.classes_assigned.filter(id => id.toString() !== classId.toString());
  return this.save();
};

// Static method to find teachers by department
teacherSchema.statics.findByDepartment = function(department) {
  return this.find({ department: new RegExp(department, 'i') });
};

// Static method to find available teachers
teacherSchema.statics.findAvailable = function() {
  return this.find({ status: 'active' });
};

// Pre-save middleware to validate data
teacherSchema.pre('save', function(next) {
  // Validate experience years
  if (this.experience_years < 0) {
    this.experience_years = 0;
  }
  
  // Validate salary
  if (this.salary && this.salary < 0) {
    this.salary = 0;
  }
  
  next();
});

module.exports = mongoose.model('Teacher', teacherSchema);
