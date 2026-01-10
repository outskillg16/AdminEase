import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import LandingPage from './components/LandingPage';
import AuthPage from './components/AuthPage';
import HomePage from './components/HomePage';
import Dashboard from './components/Dashboard';
import OnboardingForm from './components/OnboardingForm';
import AIConfiguration from './components/AIConfiguration';
import AIAssistant from './components/AIAssistant';
import AIAssistantTidyPaws from './components/AIAssistantTidyPaws';
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
    } = supabase.auth.onAuthStateChange((event, session) => {
      // Only update user state on significant auth events to prevent unnecessary re-renders
      // This prevents route navigation when window regains focus and session is refreshed
      if (event === 'SIGNED_IN' || event === 'SIGNED_OUT' || event === 'USER_UPDATED') {
        setUser(session?.user ?? null);
      }
      // Ignore TOKEN_REFRESHED event to maintain current route when switching apps/tabs
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
        <Route path="/" element={user ? <Navigate to="/home" /> : <LandingPage user={user} onSignOut={handleSignOut} />} />
        <Route path="/auth" element={user ? <Navigate to="/home" /> : <AuthPage />} />
        <Route
          path="/home"
          element={user ? <HomePage user={user} onLogout={handleSignOut} /> : <Navigate to="/" />}
        />
        <Route
          path="/dashboard"
          element={user ? <Dashboard user={user} onLogout={handleSignOut} /> : <Navigate to="/" />}
        />
        <Route
          path="/onboarding"
          element={
            user ? (
              <OnboardingForm user={user} onLogout={handleSignOut} onComplete={() => window.location.href = '/home'} />
            ) : (
              <Navigate to="/" />
            )
          }
        />
        <Route
          path="/ai-configuration"
          element={
            user ? (
              <AIConfiguration user={user} onLogout={handleSignOut} />
            ) : (
              <Navigate to="/" />
            )
          }
        />
        <Route
          path="/call-management"
          element={
            user ? (
              <CallManagement user={user} onLogout={handleSignOut} />
            ) : (
              <Navigate to="/" />
            )
          }
        />
        <Route
          path="/appointments"
          element={
            user ? (
              <Appointments user={user} onLogout={handleSignOut} />
            ) : (
              <Navigate to="/" />
            )
          }
        />
        <Route
          path="/documents"
          element={
            user ? (
              <Documents user={user} onLogout={handleSignOut} />
            ) : (
              <Navigate to="/" />
            )
          }
        />
        <Route
          path="/ai-assistant"
          element={
            user ? (
              <AIAssistant user={user} onLogout={handleSignOut} />
            ) : (
              <Navigate to="/" />
            )
          }
        />
        <Route
          path="/ai-assistant-tidypaws"
          element={
            user ? (
              <AIAssistantTidyPaws user={user} onLogout={handleSignOut} />
            ) : (
              <Navigate to="/" />
            )
          }
        />
        <Route
          path="/customers"
          element={
            user ? (
              <Customers user={user} onLogout={handleSignOut} />
            ) : (
              <Navigate to="/" />
            )
          }
        />
        <Route path="*" element={user ? <Navigate to="/home" /> : <Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
