import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import DailyCheckIn from './pages/DailyCheckIn';
import Habits from './pages/Habits';
import AIInsights from './pages/AIInsights';
import CalendarPage from './pages/CalendarPage';
import WeeklyReport from './pages/WeeklyReport';
import HealthPage from './pages/HealthPage';
import CarePage from './pages/CarePage';
import ProfilePage from './pages/ProfilePage';
import Navbar from './components/Navbar';
import { subscribeToPush, setupForegroundNotifications } from './services/pushNotifications';

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

function App() {
  // Auto-subscribe to FCM push notifications and set up foreground handler
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      subscribeToPush().catch(err => console.log('Push auto-subscribe skipped:', err));
      const unsubscribe = setupForegroundNotifications();
      return () => {
        if (typeof unsubscribe === 'function') unsubscribe();
      };
    }
  }, []);

  return (
    <Router>
      <div className="min-h-screen bg-neutral-900 text-gray-100 font-sans pb-32 md:pb-0">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          <Route path="/" element={
            <ProtectedRoute>
              <Navbar />
              <Dashboard />
            </ProtectedRoute>
          } />
          
          <Route path="/check-in" element={
            <ProtectedRoute>
              <Navbar />
              <DailyCheckIn />
            </ProtectedRoute>
          } />
          
          <Route path="/habits" element={
            <ProtectedRoute>
              <Navbar />
              <Habits />
            </ProtectedRoute>
          } />

          <Route path="/calendar" element={
            <ProtectedRoute>
              <Navbar />
              <CalendarPage />
            </ProtectedRoute>
          } />

          <Route path="/report" element={
            <ProtectedRoute>
              <Navbar />
              <WeeklyReport />
            </ProtectedRoute>
          } />

          <Route path="/health" element={
            <ProtectedRoute>
              <Navbar />
              <HealthPage />
            </ProtectedRoute>
          } />

          <Route path="/insights" element={
            <ProtectedRoute>
              <Navbar />
              <AIInsights />
            </ProtectedRoute>
          } />

          <Route path="/care" element={
            <ProtectedRoute>
              <Navbar />
              <CarePage />
            </ProtectedRoute>
          } />

          <Route path="/profile" element={
            <ProtectedRoute>
              <Navbar />
              <ProfilePage />
            </ProtectedRoute>
          } />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
