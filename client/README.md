# DocApp - Doctor Appointment System Frontend

A modern, responsive React TypeScript application for managing doctor appointments. Built with the MERN stack (MongoDB, Express.js, React, Node.js).

## Features

### For Patients
- **User Registration & Authentication**: Secure sign-up and login with email/password
- **Doctor Discovery**: Browse and search for doctors by specialization
- **Appointment Booking**: Easy appointment scheduling with date and time selection
- **Appointment Management**: View, cancel, and track appointment status
- **Dashboard**: Overview of upcoming appointments and quick actions

### For Doctors
- **Professional Profile**: Complete profile management with specialization, experience, and bio
- **Availability Management**: Set working hours and availability for each day
- **Appointment Management**: View, confirm, cancel, and complete patient appointments
- **Patient Information**: Access patient details and appointment history
- **Dashboard**: Overview of today's appointments and statistics

### General Features
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- **Real-time Updates**: Live status updates for appointments
- **Search & Filter**: Advanced filtering by status, date, and specialization
- **Modern UI**: Beautiful, intuitive interface built with Tailwind CSS
- **Type Safety**: Full TypeScript support for better development experience

## Technology Stack

- **Frontend Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS
- **State Management**: React Context API
- **Form Handling**: React Hook Form
- **Routing**: React Router DOM
- **HTTP Client**: Axios
- **Date Handling**: date-fns
- **Icons**: Heroicons
- **UI Components**: Headless UI

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── LoadingSpinner.tsx
│   └── Navbar.tsx
├── contexts/           # React contexts for state management
│   └── AuthContext.tsx
├── pages/              # Page components
│   ├── Home.tsx
│   ├── Login.tsx
│   ├── Register.tsx
│   ├── DoctorRegister.tsx
│   ├── Dashboard.tsx
│   ├── DoctorDashboard.tsx
│   ├── BookAppointment.tsx
│   ├── Appointments.tsx
│   └── DoctorProfile.tsx
├── services/           # API service functions
│   └── api.ts
├── types/              # TypeScript type definitions
│   └── index.ts
├── App.tsx             # Main application component
└── index.tsx           # Application entry point
```

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd client
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```

4. **Open your browser**
   Navigate to `http://localhost:3000` to view the application.

### Environment Variables

Create a `.env` file in the client directory:

```env
REACT_APP_API_URL=http://localhost:5000/api
```

## Available Scripts

- `npm start` - Runs the app in development mode
- `npm test` - Launches the test runner
- `npm run build` - Builds the app for production
- `npm run eject` - Ejects from Create React App (not recommended)

## API Integration

The frontend is designed to work with a RESTful API backend. The API service layer (`src/services/api.ts`) handles all communication with the backend, including:

- Authentication (login, register, logout)
- Doctor management (CRUD operations)
- Appointment management (booking, status updates, cancellations)
- User profile management

### API Endpoints

The application expects the following API endpoints:

#### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - Patient registration
- `POST /api/auth/register-doctor` - Doctor registration
- `GET /api/auth/me` - Get current user

#### Doctors
- `GET /api/doctors` - Get all doctors
- `GET /api/doctors/:id` - Get doctor by ID
- `GET /api/doctors/specialization/:specialization` - Get doctors by specialization
- `PUT /api/doctors/profile` - Update doctor profile
- `PUT /api/doctors/availability` - Update doctor availability

#### Appointments
- `POST /api/appointments` - Create appointment
- `GET /api/appointments/patient` - Get patient appointments
- `GET /api/appointments/doctor` - Get doctor appointments
- `PUT /api/appointments/:id/status` - Update appointment status
- `PUT /api/appointments/:id/cancel` - Cancel appointment
- `GET /api/appointments/:id` - Get appointment by ID

## Key Features Implementation

### Authentication System
- JWT-based authentication with automatic token refresh
- Protected routes based on user roles
- Automatic logout on token expiration

### Responsive Design
- Mobile-first approach with Tailwind CSS
- Responsive navigation with hamburger menu
- Optimized layouts for all screen sizes

### Form Validation
- Client-side validation using React Hook Form
- Real-time error feedback
- Password strength requirements
- Email format validation

### State Management
- React Context for global state management
- Local state for component-specific data
- Optimistic updates for better UX

## Security Features

- Input sanitization and validation
- Secure password handling
- Protected API routes
- CORS configuration
- XSS protection

## Performance Optimizations

- Code splitting with React.lazy()
- Optimized bundle size
- Efficient re-rendering with React.memo()
- Lazy loading of components

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions, please contact the development team or create an issue in the repository.

## Future Enhancements

- Real-time notifications
- Video consultation integration
- Payment gateway integration
- Prescription management
- Medical records upload
- Multi-language support
- Dark mode theme
- PWA capabilities
