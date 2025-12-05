# DailyFit

A full-stack fitness tracking application that helps users monitor their workouts, track progress, and maintain their fitness goals.

## 📋 Overview

DailyFit is a comprehensive fitness tracking platform built with the MERN stack (MongoDB, Express, React, Node.js). Users can log workouts, view statistics, track weekly progress, and visualize their fitness journey through interactive charts and dashboards.

## ✨ Features

- **User Authentication**: Secure sign-up and sign-in functionality with JWT authentication
- **Workout Management**: Add, view, and track various workout activities
- **Dashboard Analytics**:
  - Weekly statistics visualization
  - Category-based workout charts
  - Workout counts and progress tracking
- **Admin Panel**: Administrative features for user management
- **Contact Page**: Easy way to get in touch
- **Responsive Design**: Modern UI built with Material-UI components

## 🛠️ Tech Stack

### Frontend

- **React** 18.2.0 - UI library
- **Redux Toolkit** - State management
- **Material-UI (MUI)** - Component library
- **MUI X-Charts** - Data visualization
- **React Router** - Navigation
- **Axios** - HTTP client
- **Day.js** - Date manipulation
- **Styled Components** - CSS-in-JS styling

### Backend

- **Node.js** - Runtime environment
- **Express** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication
- **Bcrypt** - Password hashing
- **CORS** - Cross-origin resource sharing
- **Dotenv** - Environment variables

## 📁 Project Structure

```
dailyfit/
├── client/                 # Frontend React application
│   ├── public/            # Static files
│   └── src/
│       ├── api/           # API integration
│       ├── components/    # Reusable components
│       ├── pages/         # Page components
│       ├── redux/         # State management
│       └── utils/         # Utilities and themes
│
└── server/                # Backend Node.js application
    ├── controllers/       # Request handlers
    ├── middleware/        # Custom middleware
    ├── models/           # Database models
    └── routes/           # API routes
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- npm or yarn

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd dailyfit
   ```

2. **Install server dependencies**

   ```bash
   cd server
   npm install
   ```

3. **Install client dependencies**
   ```bash
   cd ../client
   npm install
   ```

### Configuration

1. **Create a `.env` file in the server directory**
   ```env
   MONGODB_URL=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key
   ```

### Running the Application

1. **Start the backend server**

   ```bash
   cd server
   npm start
   ```

   The server will run on `http://localhost:8080`

2. **Start the frontend application** (in a new terminal)
   ```bash
   cd client
   npm start
   ```
   The client will run on `http://localhost:3000`

## 📡 API Endpoints

### User Routes (`/api/user/`)

- Authentication endpoints (signup, signin)
- User profile management
- Workout operations (add, get, update, delete)

## 🧪 Testing

```bash
# Run client tests
cd client
npm test

# Run server tests
cd server
npm test
```

## 📦 Building for Production

```bash
# Build the client
cd client
npm run build
```

The optimized production build will be created in the `client/build` folder.

## 👥 Team

- Repository: pallavibakale/dailyfit

## 🐛 Known Issues

Please check the [Issues](../../issues) section for known bugs and feature requests.

## 📞 Support

For support, please use the Contact page in the application or open an issue in the repository.

---

