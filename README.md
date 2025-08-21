# KPI System - Full-Stack Web Application



## Technology Stack

### Frontend
- **React 18** with TypeScript
- **Next.js 14** for routing and optimization
- **Tailwind CSS** for modern, responsive design
- **React Hook Form** for form management
- **Axios** for HTTP requests
- **Lucide React** for icons
- **React Hot Toast** for notifications

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **bcryptjs** for password hashing
- **Express Validator** for input validation
- **CORS** enabled for cross-origin requests

## Prerequisites

Before running this application, ensure you have the following installed:

- **Node.js** (v16 or higher)
- **MongoDB** (v4.4 or higher)
- **npm** or **yarn** package manager

## Installation & Setup

### 1. Clone the Repository
```bash
git clone <repository-url>
cd kpi-system
```

### 2. Install Dependencies
```bash
# Install root dependencies
npm install

# Install backend dependencies
cd server
npm install

# Install frontend dependencies
cd ../client
npm install

# Return to root directory
cd ..
```

### 3. Environment Configuration
Create a `.env` file in the `server` directory:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/kpi_system
JWT_SECRET=your_super_secret_jwt_key_here_change_in_production
ADMIN_EMAIL=admin@kpisystem.com
ADMIN_PASSWORD=admin123
```

**Important**: Change the `JWT_SECRET` to a secure random string in production.

### 4. Start MongoDB
Ensure MongoDB is running on your system:

```bash
# Start MongoDB service
mongod

# Or if using MongoDB as a service
sudo systemctl start mongod
```

### 5. Run the Application

#### Development Mode (Recommended)
```bash
# Run both frontend and backend concurrently
npm run dev
```

#### Separate Mode
```bash
# Terminal 1 - Backend
npm run server

# Terminal 2 - Frontend
npm run client
```

### 6. Access the Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **Health Check**: http://localhost:0500/api/health

## Default Login Credentials

### Admin Account
- **Email**: admin@buniversemr.com
- **Password**: admin123



## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/change-password` - Change password
- `GET /api/auth/profile` - Get user profile
- `POST /api/auth/logout` - User logout

### User Management (Admin Only)
- `GET /api/users` - Get all users
- `POST /api/users` - Create new user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user
- `POST /api/users/:id/reset-password` - Reset user password

### KPI Evaluations
- `GET /api/kpi` - Get all evaluations (Admin)
- `GET /api/kpi/employee/:employeeId` - Get employee evaluations
- `GET /api/kpi/:id` - Get specific evaluation
- `POST /api/kpi` - Create evaluation (Admin)
- `PUT /api/kpi/:id` - Update evaluation (Admin)
- `DELETE /api/kpi/:id` - Delete evaluation (Admin)
- `PATCH /api/kpi/:id/status` - Update evaluation status (Admin)

