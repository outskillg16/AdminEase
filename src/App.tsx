import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import LandingPage from './components/LandingPage';
import AuthPage from './components/AuthPage';
import Dashboard from './components/Dashboard';
import OnboardingForm from './components/OnboardingForm';
import AIConfiguration from './components/AIConfiguration';
import AIAssistant from './components/AIAssistant';
import CallManagement from './components/CallManagement';
import Appointments from './components/Appointments';
import Documents from './components/Documents';
import Customers from './components/Customers';
import { supabase } from './lib/supabase';

function App() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <div className="w-8 h-8 bg-white rounded-full" />
          </div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={user ? <Navigate to="/dashboard" /> : <LandingPage user={user} onSignOut={handleSignOut} />} />
        <Route path="/auth" element={user ? <Navigate to="/dashboard" /> : <AuthPage />} />
        <Route
          path="/dashboard"
          element={user ? <Dashboard user={user} onLogout={handleSignOut} /> : <Navigate to="/auth" />}
        />
        <Route
          path="/onboarding"
          element={
            user ? (
              <OnboardingForm user={user} onLogout={handleSignOut} onComplete={() => window.location.href = '/dashboard'} />
            ) : (
              <Navigate to="/auth" />
            )
          }
        />
        <Route
          path="/ai-configuration"
          element={
            user ? (
              <AIConfiguration user={user} onLogout={handleSignOut} />
            ) : (
              <Navigate to="/auth" />
            )
          }
        />
        <Route
          path="/call-management"
          element={
            user ? (
              <CallManagement user={user} onLogout={handleSignOut} />
            ) : (
              <Navigate to="/auth" />
            )
          }
        />
        <Route
          path="/appointments"
          element={
            user ? (
              <Appointments user={user} onLogout={handleSignOut} />
            ) : (
              <Navigate to="/auth" />
            )
          }
        />
        <Route
          path="/documents"
          element={
            user ? (
              <Documents user={user} onLogout={handleSignOut} />
            ) : (
              <Navigate to="/auth" />
            )
          }
        />
        <Route
          path="/ai-assistant"
          element={
            user ? (
              <AIAssistant user={user} onLogout={handleSignOut} />
            ) : (
              <Navigate to="/auth" />
            )
          }
        />
        <Route
          path="/customers"
          element={
            user ? (
              <Customers user={user} onLogout={handleSignOut} />
            ) : (
              <Navigate to="/auth" />
            )
          }
        />
        <Route path="*" element={user ? <Navigate to="/dashboard" /> : <Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
