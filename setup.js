const mongoose = require('mongoose');
const User = require('./models/User');
const Class = require('./models/Class');
const Teacher = require('./models/Teacher');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Connect to MongoDB
const mongoUri = process.env.MONGODB_URI;
console.log('Connecting to MongoDB Atlas...');
console.log('MongoDB URI:', mongoUri);

mongoose.connect(mongoUri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB Connected for setup'))
.catch(err => {
  console.error('MongoDB Connection Error:', err);
  console.error('Please check your MongoDB connection string and network connection.');
  process.exit(1);
});

const setupInitialData = async () => {
  try {
    console.log('Starting setup process...');
    
    // Check if super admin already exists
    const existingSuperAdmin = await User.findOne({ role: 'super_admin' });
    
    if (!existingSuperAdmin) {
      console.log('Creating super admin user...');
    const superAdmin = new User({
      user_code: 'SA001',
      user_name: 'superadmin',
        password: 'admin123',
      first_name: 'Super',
      last_name: 'Admin',
      email: 'superadmin@excellenceacademy.edu',
      role: 'super_admin'
    });

    await superAdmin.save();
    console.log('Super admin user created successfully!');
    } else {
      console.log('Super admin already exists, skipping creation.');
    }

    const existingTeachers = await User.find({ role: 'teacher' });
    let createdTeachers = [];
    
    if (existingTeachers.length === 0) {
      console.log('Creating sample teachers...');
    const sampleTeachers = [
      {
        user_code: 'T001',
        user_name: 'teacher1',
        password: 'teacher123',
        first_name: 'John',
        last_name: 'Doe',
        email: 'teacher1@excellenceacademy.edu',
        role: 'teacher'
      },
      {
        user_code: 'T002',
        user_name: 'teacher2',
        password: 'teacher123',
        first_name: 'Jane',
        last_name: 'Smith',
        email: 'teacher2@excellenceacademy.edu',
        role: 'teacher'
      }
    ];
      
    for (const teacherData of sampleTeachers) {
        try {
      const newTeacher = new User(teacherData);
          const savedTeacher = await newTeacher.save();
          createdTeachers.push(savedTeacher);
          console.log(`Created teacher: ${savedTeacher.user_name} (${savedTeacher._id})`);
        } catch (error) {
          console.error(`Error creating teacher ${teacherData.user_name}:`, error.message);
          throw error;
        }
    }
    console.log('Sample teachers created successfully!');
    } else {
      console.log(`Found ${existingTeachers.length} existing teachers, using them.`);
      createdTeachers = existingTeachers;
    }

    const existingClasses = await Class.find();
    let createdClasses = [];
    
    if (existingClasses.length === 0) {
      console.log('Creating sample classes...');
    const sampleClasses = [
      {
        class_name: 'Mathematics 101',
        description: 'Introduction to basic mathematics concepts',
        capacity: 30,
        academic_year: '2024-2025',
          semester: 'Fall',
          teacher_id: createdTeachers[0]._id
      },
      {
        class_name: 'English Literature',
        description: 'Study of classic and contemporary literature',
        capacity: 25,
        academic_year: '2024-2025',
          semester: 'Fall',
          teacher_id: createdTeachers[1]._id
      },
      {
        class_name: 'Computer Science',
        description: 'Fundamentals of programming and algorithms',
        capacity: 35,
        academic_year: '2024-2025',
          semester: 'Fall',
          teacher_id: createdTeachers[0]._id
      }
    ];

    for (const classData of sampleClasses) {
        try {
      const newClass = new Class(classData);
          const savedClass = await newClass.save();
          createdClasses.push(savedClass);
          console.log(`Created class: ${savedClass.class_name} (${savedClass._id})`);
        } catch (error) {
          console.error(`Error creating class ${classData.class_name}:`, error.message);
          throw error;
        }
      }
      console.log('Sample classes created successfully!');
      console.log('Class assignments:');
      console.log(`- Mathematics 101 -> Teacher: ${createdTeachers[0].user_name} (${createdClasses[0]._id})`);
      console.log(`- English Literature -> Teacher: ${createdTeachers[1].user_name} (${createdClasses[1]._id})`);
      console.log(`- Computer Science -> Teacher: ${createdTeachers[0].user_name} (${createdClasses[2]._id})`);
    } else {
      console.log(`Found ${existingClasses.length} existing classes, using them.`);
      createdClasses = existingClasses;
      console.log('Existing classes:', createdClasses.map(c => ({ name: c.class_name, teacher: c.teacher_id })));
    }

    // Check if teacher profiles already exist
    const existingTeacherProfiles = await Teacher.find();
    
    if (existingTeacherProfiles.length === 0) {
      console.log('Creating teacher profiles...');
      // Create teacher profiles with additional information
      const teacherProfiles = [
        {
          user_id: createdTeachers[0]._id,
          employee_id: 'EMP001',
          department: 'Mathematics',
          specialization: 'Algebra and Calculus',
          qualification: 'MSc in Mathematics',
          experience_years: 5,
          salary: 45000,
          contact_number: '+1-555-0101',
          address: {
            street: '123 Math Street',
            city: 'Education City',
            state: 'Learning State',
            zip_code: '12345',
            country: 'USA'
          },
          emergency_contact: {
            name: 'Mary Doe',
            relationship: 'Spouse',
            phone: '+1-555-0102',
            email: 'mary.doe@email.com'
          },
          subjects: ['Mathematics 101', 'Calculus I', 'Linear Algebra'],
          classes_assigned: [createdClasses[0]._id, createdClasses[2]._id] // Math and CS classes
        },
        {
          user_id: createdTeachers[1]._id,
          employee_id: 'EMP002',
          department: 'English',
          specialization: 'Literature and Composition',
          qualification: 'MA in English Literature',
          experience_years: 3,
          salary: 42000,
          contact_number: '+1-555-0201',
          address: {
            street: '456 Literature Lane',
            city: 'Education City',
            state: 'Learning State',
            zip_code: '12345',
            country: 'USA'
          },
          emergency_contact: {
            name: 'Bob Smith',
            relationship: 'Spouse',
            phone: '+1-555-0202',
            email: 'bob.smith@email.com'
          },
          subjects: ['English Literature', 'Creative Writing', 'Grammar'],
          classes_assigned: [createdClasses[1]._id] // English class
        }
      ];

      for (const profileData of teacherProfiles) {
        try {
          const newProfile = new Teacher(profileData);
          const savedProfile = await newProfile.save();
          console.log(`Created teacher profile for: ${profileData.employee_id}`);
          console.log(`Assigned classes: ${profileData.classes_assigned.length} classes`);
        } catch (error) {
          console.error(`Error creating teacher profile for ${profileData.employee_id}:`, error.message);
          throw error;
        }
      }
      console.log('Teacher profiles created successfully!');
    } else {
      console.log(`Found ${existingTeacherProfiles.length} existing teacher profiles, skipping creation.`);
    }

    console.log('Setup complete! All necessary data has been created or already exists.');
    
    // Create sample students if they don't exist
    const Student = require('./models/Student');
    const existingStudents = await Student.find();
    
    if (existingStudents.length === 0) {
      console.log('Creating sample students...');
      
      // Get the first class to assign students to
      const firstClass = await Class.findOne();
      if (firstClass) {
        const sampleStudents = [
          {
            first_name: 'Alice',
            last_name: 'Johnson',
            date_of_birth: new Date('2005-03-15'),
            email: 'alice.johnson@student.com',
            phone_no: '+1-555-0101',
            address: '123 Student Street, Education City, USA',
            class_id: firstClass._id,
            created_by_user_id: (await User.findOne({ role: 'super_admin' }))._id,
            updated_by_user_id: (await User.findOne({ role: 'super_admin' }))._id
          },
          {
            first_name: 'Bob',
            last_name: 'Wilson',
            date_of_birth: new Date('2005-07-22'),
            email: 'bob.wilson@student.com',
            phone_no: '+1-555-0102',
            address: '456 Student Avenue, Education City, USA',
            class_id: firstClass._id,
            created_by_user_id: (await User.findOne({ role: 'super_admin' }))._id,
            updated_by_user_id: (await User.findOne({ role: 'super_admin' }))._id
          },
          {
            first_name: 'Carol',
            last_name: 'Davis',
            date_of_birth: new Date('2005-11-08'),
            email: 'carol.davis@student.com',
            phone_no: '+1-555-0103',
            address: '789 Student Lane, Education City, USA',
            class_id: firstClass._id,
            created_by_user_id: (await User.findOne({ role: 'super_admin' }))._id,
            updated_by_user_id: (await User.findOne({ role: 'super_admin' }))._id
          }
        ];

        for (const studentData of sampleStudents) {
          try {
            const newStudent = new Student(studentData);
            await newStudent.save();
            console.log(`Created student: ${studentData.first_name} ${studentData.last_name}`);
          } catch (error) {
            console.error(`Error creating student ${studentData.first_name}:`, error.message);
          }
        }
        console.log('Sample students created successfully!');
      }
    } else {
      console.log(`Found ${existingStudents.length} existing students.`);
    }

  } catch (error) {
    console.error('Setup error:', error);
    console.error('Error details:', error.message);
    console.error('Stack trace:', error.stack);
  } finally {
    try {
      console.log('Closing MongoDB connection...');
      await mongoose.connection.close();
      console.log('Setup process completed.');
    } catch (closeError) {
      console.error('Error closing MongoDB connection:', closeError.message);
    }
    process.exit(0);
  }
};

// Handle process termination
process.on('SIGINT', async () => {
  console.log('\nReceived SIGINT. Closing MongoDB connection...');
  try {
    await mongoose.connection.close();
    console.log('MongoDB connection closed gracefully.');
  } catch (error) {
    console.error('Error closing MongoDB connection:', error.message);
  }
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\nReceived SIGTERM. Closing MongoDB connection...');
  try {
    await mongoose.connection.close();
    console.log('MongoDB connection closed gracefully.');
  } catch (error) {
    console.error('Error closing MongoDB connection:', error.message);
  }
  process.exit(0);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

setupInitialData();