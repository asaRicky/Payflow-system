import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './Login';
import AdminDashboard from './AdminDashboard';
import EmployeeDashboard from './EmployeeDashboard';

// Protected Route Component
const ProtectedRoute = ({ children, requiredRole }) => {
    const userRole = localStorage.getItem('userRole');
    const userId = localStorage.getItem('userId');
    
    if (!userRole) {
        return <Navigate to="/" replace />;
    }
    
    if (requiredRole && userRole !== requiredRole) {
        return <Navigate to="/" replace />;
    }
    
    return children;
};

function App() {
    return (
        <Router>
            <Routes>
                {/* Login Route */}
                <Route path="/" element={<Login />} />
                
                {/* Admin Dashboard Route */}
                <Route 
                    path="/admin" 
                    element={
                        <ProtectedRoute requiredRole="admin">
                            <AdminDashboard />
                        </ProtectedRoute>
                    } 
                />
                
                {/* Employee Dashboard Route */}
                <Route 
                    path="/employee" 
                    element={
                        <ProtectedRoute requiredRole="employee">
                            <EmployeeDashboard />
                        </ProtectedRoute>
                    } 
                />
                
                {/* Catch all - redirect to login */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </Router>
    );
}

export default App;