## Laboratory Equipment Reservation System

A web application for managing laboratory equipment reservations with user authentication and admin functionalities.

## Features

1. **Authentication & User Management**
   - User registration and login
   - JWT-based authentication
   - Password reset functionality
   - User roles (Admin and User)

2. **Equipment Management**
   - Add, update, and delete equipment
   - Equipment details: name, description, serial number, photo, status
   - Equipment categories

3. **Reservation System**
   - Request equipment reservations
   - Admin approval workflow
   - Return process management
   - Conflict detection

4. **Email Notifications**
   - Registration confirmation
   - Reservation status updates
   - Return reminders
   - Password reset

## Technologies Used

- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT (JSON Web Tokens)
- **Email**: Nodemailer
- **File Uploads**: Multer
- **Validation**: Express-validator

## Setup

1. **Clone the repository**

2. **Install dependencies**
   ```
   npm install
   ```

3. **Configure environment variables**
   Create a `.env` file in the root directory with the following variables:
   ```
   PORT=3000
   MONGODB_URI=mongodb://localhost:27017/lab-equipment
   JWT_SECRET=your_jwt_secret_key_change_this_in_production
   EMAIL_SERVICE=gmail
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASS=your_app_password
   EMAIL_FROM=your_email@gmail.com
   NODE_ENV=development
   ```

4. **Start MongoDB**
   Make sure MongoDB is running on your machine or use MongoDB Atlas.

5. **Run the application**
   - Development mode:
     ```
     npm run dev
     ```
   - Production mode:
     ```
     npm start
     ```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login and get token
- `GET /api/auth/me` - Get current user info
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password

### Users
- `GET /api/users` - Get all users (Admin only)
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user (Admin only)
- `PUT /api/users/:id/change-password` - Change password

### Equipment
- `GET /api/equipment` - Get all equipment
- `GET /api/equipment/categories` - Get equipment categories
- `GET /api/equipment/:id` - Get equipment by ID
- `POST /api/equipment` - Create equipment (Admin only)
- `PUT /api/equipment/:id` - Update equipment (Admin only)
- `DELETE /api/equipment/:id` - Delete equipment (Admin only)

### Reservations
- `GET /api/reservations` - Get all reservations
- `GET /api/reservations/statistics` - Get reservation statistics (Admin only)
- `GET /api/reservations/:id` - Get reservation by ID
- `POST /api/reservations` - Create a new reservation
- `PUT /api/reservations/:id/status` - Update reservation status (Admin only)
- `PUT /api/reservations/:id/return` - Return equipment
- `PUT /api/reservations/:id/cancel` - Cancel reservation

## License

This project is licensed under the ISC License.
