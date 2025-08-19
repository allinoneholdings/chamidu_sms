const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Class = require('./models/Class');
const dotenv = require('dotenv');

// Connect to MongoDB
dotenv.config();
const mongoUri = process.env.MONGODB_URI || 'mongodb+srv://Yasintha:igcy2001@cluster0.7ch3bpc.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
console.log('Connecting to MongoDB Atlas...');
mongoose.connect(mongoUri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB Connected for setup'))
.catch(err => console.log('MongoDB Connection Error:', err));

const setupInitialData = async () => {
  try {
    // Check if super admin already exists
    const existingSuperAdmin = await User.findOne({ role: 'super_admin' });
    
    if (existingSuperAdmin) {
      console.log('Super admin already exists. Setup complete.');
      process.exit(0);
    }

    // Create super admin user
    const superAdmin = new User({
      user_code: 'SA001',
      user_name: 'superadmin',
      password: 'admin123', // This will be hashed by the User model's pre-save middleware
      first_name: 'Super',
      last_name: 'Admin',
      email: 'superadmin@excellenceacademy.edu',
      role: 'super_admin'
    });

    await superAdmin.save();
    console.log('Super admin user created successfully!');
    console.log('Username: superadmin');
    console.log('Password: admin123');

    // Create some sample classes
    const sampleClasses = [
      {
        class_name: 'Mathematics 101',
        description: 'Introduction to basic mathematics concepts',
        capacity: 30,
        academic_year: '2024-2025',
        semester: 'Fall'
      },
      {
        class_name: 'English Literature',
        description: 'Study of classic and contemporary literature',
        capacity: 25,
        academic_year: '2024-2025',
        semester: 'Fall'
      },
      {
        class_name: 'Computer Science',
        description: 'Fundamentals of programming and algorithms',
        capacity: 35,
        academic_year: '2024-2025',
        semester: 'Fall'
      }
    ];

    for (const classData of sampleClasses) {
      const newClass = new Class(classData);
      await newClass.save();
    }

    console.log('Sample classes created successfully!');
    console.log('Setup complete. You can now log in with the super admin account.');

  } catch (error) {
    console.error('Setup error:', error);
  } finally {
    mongoose.connection.close();
    process.exit(0);
  }
};

setupInitialData();