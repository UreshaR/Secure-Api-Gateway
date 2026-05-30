import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout   from './components/Layout';
import Login    from './pages/Login';
import Dashboard from './pages/Dashboard';
import LogsPage  from './pages/LogsPage';
import AlertsPage from './pages/AlertsPage';
import UsersPage  from './pages/UsersPage';
import CryptoPage from './pages/CryptoPage';

const Guard = ({ children, roles = [] }) => {
  const { user, loading } = useAuth();
  if (loading) return <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'100vh',background:'#080c18'}}><div className="spinner"/></div>;
  if (!user) return <Navigate to="/login" replace />;
  if (roles.length && !roles.includes(user.role)) return <Navigate to="/dashboard" replace />;
  return children;
};

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Guard><Layout /></Guard>}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="logs"    element={<Guard roles={['admin','developer']}><LogsPage /></Guard>} />
            <Route path="alerts"  element={<Guard roles={['admin','developer']}><AlertsPage /></Guard>} />
            <Route path="users"   element={<Guard roles={['admin']}><UsersPage /></Guard>} />
            <Route path="crypto"  element={<CryptoPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
      <ToastContainer position="top-right" autoClose={3500} theme="dark"
        toastStyle={{background:'#1a1f35',color:'#e2e8f0',borderLeft:'3px solid #00d4ff'}} />
    </AuthProvider>
  );
}
