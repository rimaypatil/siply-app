import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Welcome from './pages/Welcome';
import Setup from './pages/Setup';
import Dashboard from './pages/Dashboard';
import History from './pages/History';
import Settings from './pages/Settings';
import { UserProvider, useUser } from './context/UserContext';
import { NotificationManager } from './components/features/NotificationManager';

function PrivateRoute({ children }) {
  const { preferences, loading } = useUser();

  if (loading) return <div>Loading...</div>; // Or a nice spinner

  return preferences.isOnboarded ? children : <Navigate to="/" />;
}

function AppContent() {
  const { preferences, loading } = useUser();
  if (loading) return null;

  return (
    <>
      <NotificationManager />
      <Routes>
        <Route path="/" element={preferences.isOnboarded ? <Navigate to="/dashboard" /> : <Welcome />} />
        <Route path="/setup" element={<Setup />} />

        <Route element={<Layout />}>
          <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/history" element={<PrivateRoute><History /></PrivateRoute>} />
          <Route path="/settings" element={<PrivateRoute><Settings /></PrivateRoute>} />
        </Route>
      </Routes>
    </>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <UserProvider>
        <AppContent />
      </UserProvider>
    </BrowserRouter>
  );
}
