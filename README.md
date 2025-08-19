# Student Management System

A comprehensive student management system built with the MERN stack (MongoDB, Express.js, React.js, Node.js) featuring role-based access control and a beautiful, responsive user interface.

## Features

### 🎓 **Student Management**
- Add, view, update, and delete student records
- Comprehensive student information tracking
- Class assignment and management
- Admission date tracking

### 🔐 **Role-Based Access Control**
- **Admin**: Can add students and manage classes
- **Super Admin**: Full access to add, update, and delete students, classes, and users
- **Student**: View-only access to relevant information

### 🏫 **School Landing Page**
- Beautiful, modern design for "Excellence Academy"
- Responsive layout for all devices
- Professional presentation of school features
- Call-to-action sections for user engagement

### 🛠 **Technical Features**
- JWT-based authentication
- RESTful API with Express.js
- MongoDB database with Mongoose ODM
- React frontend with modern UI/UX
- Responsive design for mobile and desktop
- Form validation and error handling
- Toast notifications for user feedback

## Project Structure

```
student-management-system/
├── client/                 # React frontend
│   ├── public/
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── context/       # React context
│   │   ├── App.js         # Main app component
│   │   └── index.js       # Entry point
│   └── package.json
├── models/                 # MongoDB models
├── routes/                 # API routes
├── middleware/             # Authentication middleware
├── server.js              # Express server
└── package.json           # Backend dependencies
```

## Database Schema

### User Model
- `user_id` (Primary Key)
- `user_code`, `user_name`, `role`
- `password`, `first_name`, `last_name`, `email`

### Student Model
- `student_id` (Primary Key)
- `first_name`, `last_name`, `date_of_birth`
- `email`, `phone_no`, `address`, `admission_date`
- `class_id` (Foreign Key to Class)
- `created_by_user_id`, `updated_by_user_id` (Foreign Keys to User)

### Class Model
- `class_id` (Primary Key)
- `class_name`, `description`, `capacity`
- `academic_year`, `semester`

## Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local installation or MongoDB Atlas)
- npm or yarn package manager

### Backend Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd student-management-system
   ```

2. **Install backend dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   Create a `.env` file in the root directory:
   ```env
   MONGODB_URI=mongodb://localhost:27017/student-management
   JWT_SECRET=your_jwt_secret_key_here_change_in_production
   NODE_ENV=development
   PORT=5000
   ```

4. **Start the backend server**
   ```bash
   npm run server
   ```

### Frontend Setup

1. **Navigate to client directory**
   ```bash
   cd client
   ```

2. **Install frontend dependencies**
   ```bash
   npm install
   ```

3. **Start the React development server**
   ```bash
   npm start
   ```

### Development Mode

Run both backend and frontend simultaneously:
```bash
# From root directory
npm run dev
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration (Admin only)
- `GET /api/auth/me` - Get current user

### Students
- `GET /api/students` - Get all students
- `GET /api/students/:id` - Get student by ID
- `POST /api/students` - Add new student (Admin/Super Admin)
- `PUT /api/students/:id` - Update student (Super Admin only)
- `DELETE /api/students/:id` - Delete student (Super Admin only)

### Classes
- `GET /api/classes` - Get all classes
- `POST /api/classes` - Add new class (Admin/Super Admin)
- `PUT /api/classes/:id` - Update class (Admin/Super Admin)
- `DELETE /api/classes/:id` - Delete class (Admin/Super Admin)

### Users
- `GET /api/users` - Get all users (Admin/Super Admin)
- `PUT /api/users/:id` - Update user (Admin/Super Admin)
- `DELETE /api/users/:id` - Delete user (Admin/Super Admin)

## Usage

### Initial Setup
1. Start the application
2. Register the first super admin user
3. Create classes for student enrollment
4. Add students to the system

### User Roles
- **Super Admin**: Full system access
- **Admin**: Can add students and manage classes
- **Student**: View-only access

### Student Management
- Admins can add new students
- Super admins can modify and delete student records
- All changes are tracked with user timestamps

## Technologies Used

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - Object Data Modeling
- **JWT** - JSON Web Tokens for authentication
- **bcryptjs** - Password hashing
- **express-validator** - Input validation

### Frontend
- **React.js** - UI library
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **React Icons** - Icon library
- **React Toastify** - Toast notifications

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions, please open an issue in the repository.

---

**Built with ❤️ for educational excellence**

