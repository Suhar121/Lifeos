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
import MedicalReportsPage from './pages/MedicalReportsPage';
import Navbar from './components/Navbar';
import { subscribeToPush, setupForegroundNotifications } from './services/pushNotifications';

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

const Layout = ({ children }) => {
  return (
    <div className="flex min-h-screen text-theme-text font-sans">
      <Navbar />
      <main className="flex-1 transition-all duration-300 md:ml-64 pb-24 md:pb-0">
        {children}
      </main>
    </div>
  );
};

function App() {
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
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        <Route path="/" element={<ProtectedRoute><Layout><Dashboard /></Layout></ProtectedRoute>} />
        <Route path="/check-in" element={<ProtectedRoute><Layout><DailyCheckIn /></Layout></ProtectedRoute>} />
        <Route path="/habits" element={<ProtectedRoute><Layout><Habits /></Layout></ProtectedRoute>} />
        <Route path="/calendar" element={<ProtectedRoute><Layout><CalendarPage /></Layout></ProtectedRoute>} />
        <Route path="/report" element={<ProtectedRoute><Layout><WeeklyReport /></Layout></ProtectedRoute>} />
        <Route path="/health" element={<ProtectedRoute><Layout><HealthPage /></Layout></ProtectedRoute>} />
        <Route path="/insights" element={<ProtectedRoute><Layout><AIInsights /></Layout></ProtectedRoute>} />
        <Route path="/care" element={<ProtectedRoute><Layout><CarePage /></Layout></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Layout><ProfilePage /></Layout></ProtectedRoute>} />
        <Route path="/medical-reports" element={<ProtectedRoute><Layout><MedicalReportsPage /></Layout></ProtectedRoute>} />
      </Routes>
    </Router>
  );
}

export default App;
