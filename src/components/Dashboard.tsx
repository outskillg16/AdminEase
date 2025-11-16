import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User,
  Settings,
  LogOut,
  ChevronDown,
  Folder,
  CheckSquare,
  Users,
  Bell,
  Plus,
  UserPlus,
  BarChart3,
  Clock,
  FileText,
  MessageSquare,
  TrendingUp,
  Zap,
  Edit,
  ArrowRight,
  Menu,
  X,
} from 'lucide-react';
import { supabase } from '../lib/supabase';

interface DashboardProps {
  user: {
    id: string;
    email: string;
    user_metadata?: {
      full_name?: string;
    };
  };
  onLogout: () => void;
}

interface Activity {
  id: number;
  type: 'project' | 'task' | 'team' | 'message';
  description: string;
  timestamp: string;
  icon: any;
}

export default function Dashboard({ user, onLogout }: DashboardProps) {
  const navigate = useNavigate();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [profileComplete, setProfileComplete] = useState(true);
  const [checkingProfile, setCheckingProfile] = useState(true);
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const fullName = user.user_metadata?.full_name || user.email.split('@')[0];
  const initials = fullName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    checkProfileStatus();
  }, []);

  const checkProfileStatus = async () => {
    try {
      const { data, error } = await supabase
        .from('business_profiles')
        .select('business_configured')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;

      setProfileComplete(data?.business_configured ?? false);
    } catch (err) {
      console.error('Error checking profile:', err);
      setProfileComplete(false);
    } finally {
      setCheckingProfile(false);
    }
  };

  const stats = [
    { label: 'Total Projects', value: 24, icon: Folder, color: 'bg-blue-500', trend: '+12%' },
    { label: 'Active Tasks', value: 18, icon: CheckSquare, color: 'bg-green-500', trend: '+8%' },
    { label: 'Team Members', value: 12, icon: Users, color: 'bg-purple-500', trend: '+3' },
    { label: 'Notifications', value: 5, icon: Bell, color: 'bg-orange-500', trend: 'New' },
  ];

  const recentActivities: Activity[] = [
    {
      id: 1,
      type: 'project',
      description: 'Created new project "Mobile App Redesign"',
      timestamp: '2 hours ago',
      icon: Folder,
    },
    {
      id: 2,
      type: 'task',
      description: 'Completed task "Update user dashboard"',
      timestamp: '4 hours ago',
      icon: CheckSquare,
    },
    {
      id: 3,
      type: 'team',
      description: 'Added Sarah Johnson to Marketing Team',
      timestamp: '6 hours ago',
      icon: UserPlus,
    },
    {
      id: 4,
      type: 'message',
      description: 'Received 3 new messages',
      timestamp: '8 hours ago',
      icon: MessageSquare,
    },
  ];

  const quickActions = [
    {
      label: 'Create New Project',
      icon: Plus,
      color: 'bg-blue-600 hover:bg-blue-700',
      action: () => console.log('Create project'),
    },
    {
      label: 'Invite Team Member',
      icon: UserPlus,
      color: 'bg-green-600 hover:bg-green-700',
      action: () => console.log('Invite member'),
    },
    {
      label: 'View Reports',
      icon: BarChart3,
      color: 'bg-purple-600 hover:bg-purple-700',
      action: () => console.log('View reports'),
    },
  ];

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-lg">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                AdminEase
              </span>
            </div>

            {/* Navigation Links */}
            <nav className="hidden md:flex items-center space-x-1">
              {['Dashboard', 'Onboarding', 'AI Configuration', 'Call Management', 'Appointments', 'Documents'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 text-sm font-medium transition-all duration-200 border-b-2 ${
                    activeTab === tab
                      ? 'text-blue-600 border-blue-600'
                      : 'text-gray-600 border-transparent hover:text-gray-900 hover:border-gray-300'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </nav>

            {/* Right Side - Mobile Menu + User Profile */}
            <div className="flex items-center space-x-2">
              {/* Mobile Menu Button */}
              <button
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition"
              >
                {showMobileMenu ? (
                  <X className="w-6 h-6 text-gray-600" />
                ) : (
                  <Menu className="w-6 h-6 text-gray-600" />
                )}
              </button>

              {/* User Profile */}
              <div className="relative">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center space-x-3 hover:bg-gray-50 rounded-lg px-3 py-2 transition"
              >
                <div className="flex items-center space-x-3">
                  <div className="text-right hidden sm:block">
                    <p className="text-sm font-semibold text-gray-900">{fullName}</p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                  </div>
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold text-sm">{initials}</span>
                  </div>
                  <ChevronDown className="w-4 h-4 text-gray-500" />
                </div>
              </button>

              {/* Dropdown Menu */}
              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 animate-fade-in">
                  <button className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2 transition">
                    <User className="w-4 h-4" />
                    <span>Profile</span>
                  </button>
                  <button
                    onClick={() => navigate('/onboarding')}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2 transition"
                  >
                    <Edit className="w-4 h-4" />
                    <span>Edit Business Profile</span>
                  </button>
                  <button className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2 transition">
                    <Settings className="w-4 h-4" />
                    <span>Settings</span>
                  </button>
                  <hr className="my-2 border-gray-200" />
                  <button
                    onClick={onLogout}
                    className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2 transition"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Logout</span>
                  </button>
                </div>
              )}
              </div>
            </div>
          </div>

          {/* Mobile Navigation Menu */}
          {showMobileMenu && (
            <div className="md:hidden border-t border-gray-200 py-3 animate-fade-in">
              <nav className="flex flex-col space-y-1">
                {['Dashboard', 'Onboarding', 'AI Configuration', 'Call Management', 'Appointments', 'Documents'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => {
                      setActiveTab(tab);
                      setShowMobileMenu(false);
                    }}
                    className={`px-4 py-3 text-sm font-medium text-left transition-all duration-200 ${
                      activeTab === tab
                        ? 'bg-blue-50 text-blue-600 border-l-4 border-blue-600'
                        : 'text-gray-600 hover:bg-gray-50 border-l-4 border-transparent'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Welcome Section */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-xl p-8 mb-8 text-white animate-slide-up">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2">
                Welcome back, {fullName}! 👋
              </h1>
              <p className="text-blue-100 text-lg mb-2">
                Great to see you again. Let's make today productive!
              </p>
              <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-6 text-sm text-blue-100">
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4" />
                  <span>{formatDate(currentTime)}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="font-mono font-semibold">{formatTime(currentTime)}</span>
                </div>
              </div>
            </div>
            <div className="mt-6 md:mt-0">
              <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4 text-center">
                <p className="text-sm text-blue-100 mb-1">Your Progress</p>
                <div className="flex items-center justify-center space-x-2">
                  <TrendingUp className="w-5 h-5" />
                  <span className="text-2xl font-bold">85%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Complete Profile CTA - Show if profile incomplete */}
        {!checkingProfile && !profileComplete && (
          <div className="bg-gradient-to-r from-cyan-500 to-blue-600 rounded-2xl shadow-xl p-8 mb-8 text-white animate-slide-up">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-3">
                  <Edit className="w-6 h-6" />
                  <h3 className="text-2xl font-bold">Complete Your Business Profile</h3>
                </div>
                <p className="text-cyan-100 mb-4">
                  Tell us more about your business to unlock personalized features and get the most out of AdminEase.
                </p>
                <button
                  onClick={() => navigate('/onboarding')}
                  className="bg-white text-cyan-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition inline-flex items-center space-x-2 shadow-lg"
                >
                  <span>Complete Profile Now</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
              <div className="mt-6 md:mt-0 md:ml-6">
                <div className="w-24 h-24 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                  <Edit className="w-12 h-12" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={index}
                className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 p-6 border border-gray-100 hover:scale-105 cursor-pointer animate-slide-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`${stat.color} p-3 rounded-lg`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded">
                    {stat.trend}
                  </span>
                </div>
                <h3 className="text-gray-600 text-sm font-medium mb-1">{stat.label}</h3>
                <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Activity */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-md p-6 border border-gray-100 animate-slide-up" style={{ animationDelay: '400ms' }}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 flex items-center space-x-2">
                <FileText className="w-5 h-5 text-blue-600" />
                <span>Recent Activity</span>
              </h2>
              <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                View All
              </button>
            </div>
            <div className="space-y-4">
              {recentActivities.map((activity) => {
                const Icon = activity.icon;
                return (
                  <div
                    key={activity.id}
                    className="flex items-start space-x-4 p-4 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    <div className="bg-blue-100 p-2 rounded-lg flex-shrink-0">
                      <Icon className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900 font-medium">
                        {activity.description}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">{activity.timestamp}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100 animate-slide-up" style={{ animationDelay: '500ms' }}>
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
              <Zap className="w-5 h-5 text-purple-600" />
              <span>Quick Actions</span>
            </h2>
            <div className="space-y-3">
              {quickActions.map((action, index) => {
                const Icon = action.icon;
                return (
                  <button
                    key={index}
                    onClick={action.action}
                    className={`w-full ${action.color} text-white rounded-lg p-4 flex items-center space-x-3 transition-all duration-200 shadow-md hover:shadow-lg`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-semibold">{action.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Additional Info Card */}
            <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-100">
              <h3 className="font-semibold text-gray-900 mb-2 flex items-center space-x-2">
                <TrendingUp className="w-4 h-4 text-blue-600" />
                <span>Productivity Tip</span>
              </h3>
              <p className="text-sm text-gray-600">
                Break down large tasks into smaller, manageable chunks to maintain momentum
                and achieve your goals faster.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Stats Section */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6 animate-slide-up" style={{ animationDelay: '600ms' }}>
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold">Completion Rate</h3>
              <CheckSquare className="w-5 h-5" />
            </div>
            <p className="text-3xl font-bold mb-1">92%</p>
            <p className="text-green-100 text-sm">+5% from last week</p>
          </div>

          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold">Active Projects</h3>
              <Folder className="w-5 h-5" />
            </div>
            <p className="text-3xl font-bold mb-1">8</p>
            <p className="text-blue-100 text-sm">2 due this week</p>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold">Team Collaboration</h3>
              <Users className="w-5 h-5" />
            </div>
            <p className="text-3xl font-bold mb-1">156</p>
            <p className="text-purple-100 text-sm">interactions today</p>
          </div>
        </div>
      </main>
    </div>
  );
}
