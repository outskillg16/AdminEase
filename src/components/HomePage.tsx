import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Home,
  Calendar,
  FileText,
  Settings,
  LogOut,
  User,
  Zap,
  Menu,
  X,
  UserPlus,
  Bot,
  Phone,
  Users,
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import GreetingHeader from './home/GreetingHeader';
import WeekAtGlance from './home/WeekAtGlance';
import WeeklySummary from './home/WeeklySummary';
import TodaysCalendar from './home/TodaysCalendar';
import UpcomingWeek from './home/UpcomingWeek';
import RecentActivity from './home/RecentActivity';
import { CreateAppointmentModal } from './Appointments';

interface HomePageProps {
  user: {
    id: string;
    email: string;
    user_metadata?: {
      full_name?: string;
    };
  };
  onLogout: () => void;
}

interface WeeklyStats {
  total: number;
  completed: number;
  upcoming: number;
  cancelled: number;
  rescheduled: number;
}

export default function HomePage({ user, onLogout }: HomePageProps) {
  const navigate = useNavigate();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [activeTab, setActiveTab] = useState('Home');

  const [currentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [todayAppointments, setTodayAppointments] = useState<any[]>([]);
  const [weekAppointments, setWeekAppointments] = useState<any[]>([]);
  const [upcomingAppointments, setUpcomingAppointments] = useState<any[]>([]);
  const [weeklyStats, setWeeklyStats] = useState<WeeklyStats>({
    total: 0,
    completed: 0,
    upcoming: 0,
    cancelled: 0,
    rescheduled: 0,
  });
  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showNewAppointmentModal, setShowNewAppointmentModal] = useState(false);

  const fullName = user.user_metadata?.full_name || user.email.split('@')[0];
  const initials = fullName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  useEffect(() => {
    document.title = 'Home - AdminEase';
    fetchAllData();
  }, []);

  useEffect(() => {
    fetchTodayAppointments();
  }, [selectedDate]);

  const getWeekRange = () => {
    const today = new Date();
    const currentDay = today.getDay();
    const monday = new Date(today);
    monday.setDate(today.getDate() - (currentDay === 0 ? 6 : currentDay - 1));
    monday.setHours(0, 0, 0, 0);

    const friday = new Date(monday);
    friday.setDate(monday.getDate() + 4);
    friday.setHours(23, 59, 59, 999);

    return { monday, friday };
  };

  const fetchAllData = async () => {
    setIsLoading(true);
    try {
      await Promise.all([
        fetchWeekAppointments(),
        fetchTodayAppointments(),
        fetchUpcomingAppointments(),
        fetchWeeklyStats(),
        fetchRecentActivities(),
      ]);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchWeekAppointments = async () => {
    try {
      const { monday, friday } = getWeekRange();

      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .eq('user_id', user.id)
        .gte('appointment_date', monday.toISOString())
        .lte('appointment_date', friday.toISOString())
        .neq('status', 'cancelled')
        .order('appointment_time', { ascending: true });

      if (error) throw error;
      setWeekAppointments(data || []);
    } catch (err: any) {
      console.error('Error fetching week appointments:', err);
    }
  };

  const fetchTodayAppointments = async () => {
    try {
      const startOfDay = new Date(selectedDate);
      startOfDay.setHours(0, 0, 0, 0);

      const endOfDay = new Date(selectedDate);
      endOfDay.setHours(23, 59, 59, 999);

      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .eq('user_id', user.id)
        .gte('appointment_date', startOfDay.toISOString())
        .lte('appointment_date', endOfDay.toISOString())
        .neq('status', 'cancelled')
        .order('appointment_time', { ascending: true });

      if (error) throw error;
      setTodayAppointments(data || []);
    } catch (err: any) {
      console.error('Error fetching today appointments:', err);
    }
  };

  const fetchUpcomingAppointments = async () => {
    try {
      const now = new Date();
      const { friday } = getWeekRange();

      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'scheduled')
        .gte('appointment_date', now.toISOString().split('T')[0])
        .lte('appointment_date', friday.toISOString().split('T')[0])
        .order('appointment_date', { ascending: true })
        .order('appointment_time', { ascending: true })
        .limit(5);

      if (error) throw error;

      const filtered = (data || []).filter((apt) => {
        const aptDate = new Date(apt.appointment_date);
        const [hours, minutes] = apt.appointment_time.split(':').map(Number);
        aptDate.setHours(hours, minutes, 0);
        return aptDate > now;
      });

      setUpcomingAppointments(filtered);
    } catch (err: any) {
      console.error('Error fetching upcoming appointments:', err);
    }
  };

  const fetchWeeklyStats = async () => {
    try {
      const { monday, friday } = getWeekRange();

      const { data, error } = await supabase
        .from('appointments')
        .select('status, appointment_date')
        .eq('user_id', user.id)
        .gte('appointment_date', monday.toISOString())
        .lte('appointment_date', friday.toISOString());

      if (error) throw error;

      const now = new Date();
      const stats: WeeklyStats = {
        total: data?.length || 0,
        completed: data?.filter((a) => a.status === 'completed').length || 0,
        upcoming: data?.filter((a) => {
          if (a.status !== 'scheduled') return false;
          return new Date(a.appointment_date) >= now;
        }).length || 0,
        cancelled: data?.filter((a) => a.status === 'cancelled').length || 0,
        rescheduled: data?.filter((a) => a.status === 'rescheduled').length || 0,
      };

      setWeeklyStats(stats);
    } catch (err: any) {
      console.error('Error fetching weekly stats:', err);
    }
  };

  const fetchRecentActivities = async () => {
    try {
      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(15);

      if (error) throw error;

      const activities = (data || []).map((apt) => ({
        id: apt.id,
        type: 'AI Chat Session',
        description: `Setup a meeting with ${apt.first_name} for ${new Date(apt.appointment_date).toLocaleDateString()}`,
        timestamp: apt.created_at,
      }));

      setRecentActivities(activities);
    } catch (err: any) {
      console.error('Error fetching recent activities:', err);
    }
  };

  const handleNavigate = (tab: string) => {
    setActiveTab(tab);
    if (tab === 'Onboarding') navigate('/onboarding');
    if (tab === 'AI Configuration') navigate('/ai-configuration');
    if (tab === 'AI Assistant') navigate('/ai-assistant');
    if (tab === 'Call Management') navigate('/call-management');
    if (tab === 'Appointments') navigate('/appointments');
    if (tab === 'Documents') navigate('/documents');
    if (tab === 'Customers') navigate('/customers');
  };

  const tabs = ['Home', 'Onboarding', 'AI Configuration', 'AI Assistant', 'Call Management', 'Appointments', 'Documents', 'Customers'];

  const getTabIcon = (tab: string) => {
    const iconProps = { className: "w-5 h-5" };
    switch (tab) {
      case 'Home':
        return <Home {...iconProps} />;
      case 'Onboarding':
        return <UserPlus {...iconProps} />;
      case 'AI Configuration':
        return <Settings {...iconProps} />;
      case 'AI Assistant':
        return <Bot {...iconProps} />;
      case 'Call Management':
        return <Phone {...iconProps} />;
      case 'Appointments':
        return <Calendar {...iconProps} />;
      case 'Documents':
        return <FileText {...iconProps} />;
      case 'Customers':
        return <Users {...iconProps} />;
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <div className="w-8 h-8 bg-white rounded-full" />
          </div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <button
              onClick={() => navigate('/home')}
              className="flex items-center space-x-3 hover:opacity-80 transition-opacity"
            >
              <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
                  AdminEase
                </h1>
              </div>
            </button>

            <div className="flex items-center space-x-1">
              <nav className="hidden lg:flex space-x-1">
                {tabs.map((tab) => (
                  <button
                    key={tab}
                    onClick={() => handleNavigate(tab)}
                    className={`p-2.5 rounded-lg transition-all group relative ${
                      activeTab === tab
                        ? 'bg-cyan-50 text-cyan-600 shadow-sm'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {getTabIcon(tab)}
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 px-3 py-1.5 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-lg z-50">
                      {tab}
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 border-4 border-transparent border-b-gray-900"></div>
                    </div>
                  </button>
                ))}
              </nav>
              <div className="relative">
                <button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="p-2.5 rounded-lg text-gray-600 hover:bg-gray-50 transition group relative"
                >
                  <LogOut className="w-5 h-5" />
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 px-3 py-1.5 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-lg z-50">
                    Sign Out
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 border-4 border-transparent border-b-gray-900"></div>
                  </div>
                </button>

                {showProfileMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1">
                    <button
                      onClick={() => {
                        navigate('/onboarding');
                        setShowProfileMenu(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                    >
                      <User className="w-4 h-4" />
                      <span>Profile Settings</span>
                    </button>
                    <button
                      onClick={() => {
                        navigate('/ai-configuration');
                        setShowProfileMenu(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                    >
                      <Settings className="w-4 h-4" />
                      <span>AI Configuration</span>
                    </button>
                    <hr className="my-1" />
                    <button
                      onClick={onLogout}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>

              <button
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
              >
                {showMobileMenu ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>

          {showMobileMenu && (
            <div className="lg:hidden border-t border-gray-200 py-4">
              <nav className="flex flex-col space-y-1">
                {tabs.map((tab) => (
                  <button
                    key={tab}
                    onClick={() => {
                      handleNavigate(tab);
                      setShowMobileMenu(false);
                    }}
                    className={`px-4 py-3 text-sm font-medium text-left transition-all flex items-center gap-2 ${
                      activeTab === tab
                        ? 'bg-cyan-50 text-cyan-600 border-l-4 border-cyan-600'
                        : 'text-gray-600 hover:bg-gray-50 border-l-4 border-transparent'
                    }`}
                  >
                    {getTabIcon(tab)}
                    <span>{tab}</span>
                  </button>
                ))}
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <GreetingHeader
          userName={fullName}
          appointmentCount={todayAppointments.length}
          currentDate={currentDate}
          onOpenAIAssistant={() => navigate('/ai-assistant')}
        />

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6 items-start">
          <div className="lg:col-span-2 space-y-6">
            <WeekAtGlance appointments={weekAppointments} />

            <TodaysCalendar
              appointments={todayAppointments}
              selectedDate={selectedDate}
              onDateChange={setSelectedDate}
              onSync={fetchTodayAppointments}
              onNavigateToCalendar={() => navigate('/appointments')}
            />

            <UpcomingWeek
              appointments={upcomingAppointments}
              onViewAll={() => navigate('/appointments')}
            />
          </div>

          <div className="space-y-6">
            <WeeklySummary
              stats={weeklyStats}
              onNewAppointment={() => setShowNewAppointmentModal(true)}
            />

            <RecentActivity activities={recentActivities} />
          </div>
        </div>
      </main>

      {/* New Appointment Modal */}
      {showNewAppointmentModal && (
        <CreateAppointmentModal
          user={user}
          onClose={() => setShowNewAppointmentModal(false)}
          onSuccess={() => {
            setShowNewAppointmentModal(false);
            fetchAllData();
          }}
          setError={setError}
        />
      )}
    </div>
  );
}
