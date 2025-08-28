# Doctor Appointment System - Backend API

A complete Node.js/Express backend API for the doctor appointment system with MongoDB integration.

## 🚀 Features

- **User Authentication**: JWT-based authentication for patients and doctors
- **Role-based Access Control**: Different permissions for patients and doctors
- **Appointment Management**: Create, view, update, and cancel appointments
- **Doctor Profiles**: Complete doctor information and availability
- **MongoDB Integration**: Persistent data storage with Mongoose ODM
- **RESTful API**: Clean and organized API endpoints
- **Error Handling**: Comprehensive error handling and validation
- **Security**: Password hashing, JWT tokens, and input validation

## 📋 Prerequisites

- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- MongoDB Compass (for database visualization)

## 🛠️ Installation

1. **Clone the repository and navigate to server directory:**

```bash
cd server
```

2. **Install dependencies:**

```bash
npm install
```

3. **Create environment variables:**

```bash
# Create .env file with the following content:
PORT=5000
MONGODB_URI=mongodb://localhost:27017/doctor-appointment-system
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-2024
NODE_ENV=development
```

4. **Start MongoDB service:**

```bash
# On macOS with Homebrew:
brew services start mongodb-community

# On Windows:
net start MongoDB

# On Linux:
sudo systemctl start mongod
```

5. **Start the development server:**

```bash
npm run dev
```

## 🗄️ MongoDB Compass Connection

### Step 1: Install MongoDB Compass

Download and install MongoDB Compass from: https://www.mongodb.com/try/download/compass

### Step 2: Connect to Local Database

1. Open MongoDB Compass
2. Click "New Connection"
3. Enter connection string: `mongodb://localhost:27017`
4. Click "Connect"

### Step 3: Access Your Database

1. You'll see all databases on your local MongoDB instance
2. Click on `doctor-appointment-system` database
3. You'll see three collections:
   - `users` - Patient and doctor user accounts
   - `doctors` - Doctor profiles and specializations
   - `appointments` - All appointment records

### Step 4: View and Manage Data

- **Users Collection**: View all registered users with their roles
- **Doctors Collection**: See doctor profiles with specializations
- **Appointments Collection**: Track all appointments and their status

## 📡 API Endpoints

### Authentication

- `POST /api/auth/register` - Register a patient
- `POST /api/auth/register-doctor` - Register a doctor
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user (protected)

### Doctors

- `GET /api/doctors` - Get all doctors
- `GET /api/doctors/:id` - Get doctor by ID

### Appointments

- `POST /api/appointments` - Create appointment (protected)
- `GET /api/appointments/patient` - Get patient appointments (protected)
- `GET /api/appointments/doctor` - Get doctor appointments (protected)
- `PUT /api/appointments/:id/status` - Update appointment status (doctor only)
- `PUT /api/appointments/:id/cancel` - Cancel appointment (protected)
- `GET /api/appointments/:id` - Get appointment by ID (protected)

### Health Check

- `GET /api/health` - Server health check
- `GET /` - API documentation

## 🔐 Authentication

### JWT Token Usage

Include the JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

### Role-based Access

- **Patient**: Can view and manage their own appointments
- **Doctor**: Can view their appointments and update status
- **Admin**: Full access (future implementation)

## 📊 Database Schema

### User Model

```javascript
{
  name: String (required),
  email: String (required, unique),
  password: String (hashed),
  role: String (patient/doctor/admin),
  phone: String,
  timestamps: true
}
```

### Doctor Model

```javascript
{
  userId: ObjectId (ref: User),
  specialization: String (required),
  experience: Number (required),
  education: String (required),
  licenseNumber: String (required, unique),
  availability: Array,
  rating: Number,
  totalReviews: Number,
  bio: String,
  consultationFee: Number (required),
  timestamps: true
}
```

### Appointment Model

```javascript
{
  patientId: ObjectId (ref: User),
  doctorId: ObjectId (ref: Doctor),
  date: String (required),
  time: String (required),
  status: String (pending/confirmed/completed/cancelled),
  symptoms: String,
  notes: String,
  timestamps: true
}
```

## 🚀 Running the Application

### Development Mode

```bash
npm run dev
```

### Production Mode

```bash
npm start
```

### Server Status

- **URL**: http://localhost:5000
- **Health Check**: http://localhost:5000/api/health
- **API Docs**: http://localhost:5000

## 🔧 Environment Variables

| Variable      | Description               | Default                                                  |
| ------------- | ------------------------- | -------------------------------------------------------- |
| `PORT`        | Server port               | 5000                                                     |
| `MONGODB_URI` | MongoDB connection string | mongodb://localhost:27017/doctor-appointment-system      |
| `JWT_SECRET`  | JWT signing secret        | your-super-secret-jwt-key-change-this-in-production-2024 |
| `NODE_ENV`    | Environment mode          | development                                              |

## 🐛 Error Handling

The API includes comprehensive error handling:

- **400**: Bad Request (validation errors)
- **401**: Unauthorized (missing/invalid token)
- **403**: Forbidden (insufficient permissions)
- **404**: Not Found (resource not found)
- **500**: Internal Server Error (server errors)

## 📝 Logging

The server logs all requests with timestamps:

```
2024-01-15T10:30:00.000Z - POST /api/auth/register
2024-01-15T10:30:01.000Z - GET /api/doctors
```

## 🔒 Security Features

- **Password Hashing**: bcryptjs with salt rounds
- **JWT Tokens**: Secure authentication
- **Input Validation**: Request data validation
- **CORS**: Cross-origin resource sharing
- **Rate Limiting**: Ready for implementation
- **Helmet**: Security headers (ready for implementation)

## 🚀 Deployment

### Local Development

1. Ensure MongoDB is running
2. Set up environment variables
3. Run `npm run dev`

### Production Deployment

1. Set `NODE_ENV=production`
2. Use a strong JWT_SECRET
3. Set up MongoDB Atlas or production MongoDB
4. Use PM2 or similar process manager
5. Set up reverse proxy (nginx)

## 📞 Support

For issues or questions:

1. Check the logs for error messages
2. Verify MongoDB connection
3. Ensure all environment variables are set
4. Check API endpoint documentation

## 🎯 Next Steps

- [ ] Add email verification
- [ ] Implement password reset
- [ ] Add file upload for doctor documents
- [ ] Implement real-time notifications
- [ ] Add payment integration
- [ ] Implement admin dashboard
- [ ] Add API rate limiting
- [ ] Set up automated testing
