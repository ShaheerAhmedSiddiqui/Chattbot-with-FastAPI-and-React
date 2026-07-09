import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from '../src/pages/Home';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';       
import Register from './pages/Register'; 
import ProtectedRoute from './components/layout/ProtectedRoute';

export default function App() {
  return (
    <Router>
      <Routes>
        {/* http://localhost:5173/ maps cleanly to your new landing homepage */}
        <Route path="/" element={<Home />} />
        
        {/* Authentication routes linked up via the home navbar */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Dashboard workspace workspace route context */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />

        {/* Fallback Catch-All Redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}