import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar,
  CheckCircle,
  FileText,
  Clock,
  Search,
  Plus,
  X,
  Edit,
  XCircle,
  AlertCircle,
  Video,
  MapPin,
  Phone,
  Download,
  User,
  Settings,
  LogOut,
  Zap,
  Menu,
  Loader2,
  PawPrint,
  Mail,
  Home,
  UserPlus,
  Bot,
  Users,
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { validators, filters } from '../utils/validation';

interface AppointmentsProps {
  user: {
    id: string;
    email: string;
    user_metadata?: {
      full_name?: string;
    };
  };
  onLogout: () => void;
}

interface Appointment {
  id: string;
  appointment_id: string;
  first_name: string;
  last_name: string;
  customer_name: string;
  customer_email?: string;
  customer_phone?: string;
  service_type: 'consultation' | 'review' | 'demo' | 'other';
  appointment_date: string;
  appointment_time: string;
  duration_minutes: number;
  status: 'scheduled' | 'completed' | 'rescheduled' | 'canceled' | 'no_show';
  location_type: 'virtual' | 'in_person' | 'phone';
  location_details?: string;
  cancellation_reason?: string;
  created_at: string;
  updated_at: string;
}

interface AppointmentNote {
  id: string;
  content: string;
  created_at: string;
}

interface Stats {
  scheduled: number;
  completed: number;
  completionRate: number;
  avgDuration: number;
}

export default function Appointments({ user, onLogout }: AppointmentsProps) {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [filteredAppointments, setFilteredAppointments] = useState<Appointment[]>([]);
  const [stats, setStats] = useState<Stats>({ scheduled: 0, completed: 0, completionRate: 0, avgDuration: 0 });
  const [loading, setLoading] = useState(true);
  const [viewFilter, setViewFilter] = useState<'upcoming' | 'past' | 'all'>('upcoming');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [serviceFilter, setServiceFilter] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [appointmentNotes, setAppointmentNotes] = useState<AppointmentNote[]>([]);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [activeTab, setActiveTab] = useState('Appointments');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const fullName = user.user_metadata?.full_name || user.email.split('@')[0];
  const initials = fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  useEffect(() => {
    document.title = 'Appointments - AdminEase';
    loadAppointments();
  }, []);

  useEffect(() => {
    filterAppointments();
  }, [appointments, viewFilter, searchQuery, statusFilter, serviceFilter]);

  const loadAppointments = async () => {
    try {
      setLoading(true);
      const { data, error: fetchError } = await supabase
        .from('appointments')
        .select('*')
        .eq('user_id', user.id)
        .order('appointment_date', { ascending: false });

      if (fetchError) throw fetchError;
      setAppointments(data || []);
      calculateStats(data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (data: Appointment[]) => {
    const scheduled = data.filter(a => a.status === 'scheduled').length;
    const completed = data.filter(a => a.status === 'completed').length;
    const total = data.length;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
    const completedAppointments = data.filter(a => a.status === 'completed');
    const avgDuration = completedAppointments.length > 0
      ? Math.round(completedAppointments.reduce((sum, a) => sum + a.duration_minutes, 0) / completedAppointments.length)
      : 0;

    setStats({ scheduled, completed, completionRate, avgDuration });
  };

  const filterAppointments = () => {
    let filtered = [...appointments];
    const now = new Date();

    if (viewFilter === 'upcoming') {
      filtered = filtered.filter(a => new Date(a.appointment_date) >= now);
      filtered.sort((a, b) => new Date(a.appointment_date).getTime() - new Date(b.appointment_date).getTime());
    } else if (viewFilter === 'past') {
      filtered = filtered.filter(a => new Date(a.appointment_date) < now);
      filtered.sort((a, b) => new Date(b.appointment_date).getTime() - new Date(a.appointment_date).getTime());
    }

    if (searchQuery.length >= 2) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(a =>
        a.customer_name.toLowerCase().includes(query) ||
        a.customer_email?.toLowerCase().includes(query) ||
        a.customer_phone?.includes(query) ||
        a.appointment_id.toLowerCase().includes(query)
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(a => a.status === statusFilter);
    }

    if (serviceFilter !== 'all') {
      filtered = filtered.filter(a => a.service_type === serviceFilter);
    }

    setFilteredAppointments(filtered);
  };

  const handleNavigate = (tab: string) => {
    setActiveTab(tab);
    if (tab === 'Home') navigate('/');
    if (tab === 'Onboarding') navigate('/onboarding');
    if (tab === 'AI Configuration') navigate('/ai-configuration');
    if (tab === 'AI Assistant') navigate('/ai-assistant');
    if (tab === 'Call Management') navigate('/call-management');
    if (tab === 'Appointments') navigate('/appointments');
    if (tab === 'Documents') navigate('/documents');
    if (tab === 'Customers') navigate('/customers');
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      time: date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      full: date.toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
    };
  };

  const getStatusDisplay = (status: string) => {
    const displays = {
      scheduled: { icon: Clock, color: 'text-blue-600', label: 'Scheduled' },
      completed: { icon: CheckCircle, color: 'text-green-600', label: 'Completed' },
      canceled: { icon: XCircle, color: 'text-red-600', label: 'Canceled' },
      no_show: { icon: AlertCircle, color: 'text-orange-600', label: 'No Show' },
      rescheduled: { icon: Calendar, color: 'text-purple-600', label: 'Rescheduled' },
    };
    return displays[status as keyof typeof displays] || displays.scheduled;
  };

  const getLocationIcon = (type: string) => {
    if (type === 'virtual') return Video;
    if (type === 'in_person') return MapPin;
    return Phone;
  };

  const getTabIcon = (tab: string) => {
    const iconProps = { className: "w-4 h-4" };
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-cyan-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-cyan-600 animate-spin mx-auto mb-4" />
          <p className="text-slate-600">Loading appointments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-cyan-50 to-slate-100">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <button
              onClick={() => navigate('/')}
              className="flex items-center space-x-3 hover:opacity-80 transition-opacity"
            >
              <div className="bg-gradient-to-r from-cyan-600 to-blue-600 p-2 rounded-lg">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
                AdminEase
              </span>
            </button>

            <nav className="hidden md:flex items-center space-x-1">
              {['Home', 'Onboarding', 'AI Configuration', 'AI Assistant', 'Call Management', 'Appointments', 'Documents', 'Customers'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => handleNavigate(tab)}
                  title={tab}
                  className={`px-4 py-2 text-sm font-medium transition-all duration-200 border-b-2 flex items-center gap-2 group relative ${
                    activeTab === tab
                      ? 'text-cyan-600 border-cyan-600'
                      : 'text-gray-600 border-transparent hover:text-gray-900 hover:border-gray-300'
                  }`}
                >
                  {getTabIcon(tab)}
                  <span>{tab}</span>
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1.5 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-lg">
                    {tab}
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-900"></div>
                  </div>
                </button>
              ))}
            </nav>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition"
              >
                {showMobileMenu ? <X className="w-6 h-6 text-gray-600" /> : <Menu className="w-6 h-6 text-gray-600" />}
              </button>

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
                    <div className="w-10 h-10 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-semibold text-sm">{initials}</span>
                    </div>
                  </div>
                </button>

                {showProfileMenu && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2">
                    <button className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2">
                      <User className="w-4 h-4" />
                      <span>Profile</span>
                    </button>
                    <button className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2">
                      <Settings className="w-4 h-4" />
                      <span>Settings</span>
                    </button>
                    <hr className="my-2 border-gray-200" />
                    <button
                      onClick={onLogout}
                      className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Logout</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {showMobileMenu && (
            <div className="md:hidden border-t border-gray-200 py-3">
              <nav className="flex flex-col space-y-1">
                {['Home', 'Onboarding', 'AI Configuration', 'AI Assistant', 'Call Management', 'Appointments', 'Documents', 'Customers'].map((tab) => (
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
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Appointment Management</h1>
            <p className="text-gray-600">Schedule, manage, and track customer appointments</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-cyan-600 hover:bg-cyan-700 text-white font-semibold py-3 px-6 rounded-lg transition flex items-center space-x-2"
          >
            <Plus className="w-5 h-5" />
            <span>New Appointment</span>
          </button>
        </div>

        {/* Error/Success Messages */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center justify-between">
            <p className="text-sm text-red-800">{error}</p>
            <button onClick={() => setError(null)}><X className="w-4 h-4 text-red-600" /></button>
          </div>
        )}
        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center justify-between">
            <p className="text-sm text-green-800">{success}</p>
            <button onClick={() => setSuccess(null)}><X className="w-4 h-4 text-green-600" /></button>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard icon={Calendar} label="Scheduled" value={stats.scheduled} color="bg-blue-50 text-blue-600" />
          <StatsCard icon={CheckCircle} label="Completed" value={stats.completed} color="bg-green-50 text-green-600" />
          <StatsCard icon={FileText} label="Completion Rate" value={`${stats.completionRate}%`} color="bg-purple-50 text-purple-600" />
          <StatsCard icon={Clock} label="Avg Duration" value={`${stats.avgDuration} min`} color="bg-orange-50 text-orange-600" />
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-md p-4 mb-6 border border-gray-100">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex gap-2">
              {(['upcoming', 'past', 'all'] as const).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setViewFilter(filter)}
                  className={`px-4 py-2 rounded-lg font-medium transition ${
                    viewFilter === filter
                      ? 'bg-cyan-600 text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {filter.charAt(0).toUpperCase() + filter.slice(1)}
                </button>
              ))}
            </div>

            <div className="flex-1 flex flex-col sm:flex-row gap-2">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by name, email, phone, or ID..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
              >
                <option value="all">All Statuses</option>
                <option value="scheduled">Scheduled</option>
                <option value="completed">Completed</option>
                <option value="canceled">Canceled</option>
                <option value="no_show">No Show</option>
                <option value="rescheduled">Rescheduled</option>
              </select>

              <select
                value={serviceFilter}
                onChange={(e) => setServiceFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
              >
                <option value="all">All Services</option>
                <option value="consultation">Consultation</option>
                <option value="review">Review</option>
                <option value="demo">Demo</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
        </div>

        {/* Appointments Table */}
        {filteredAppointments.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">ID</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Customer</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Service</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Date & Time</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Duration</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Location</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredAppointments.map((apt) => (
                    <AppointmentRow
                      key={apt.id}
                      appointment={apt}
                      formatDateTime={formatDateTime}
                      getStatusDisplay={getStatusDisplay}
                      getLocationIcon={getLocationIcon}
                      onView={() => {
                        setSelectedAppointment(apt);
                        setShowDetailsModal(true);
                      }}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* Modals */}
      {showCreateModal && (
        <CreateAppointmentModal
          user={user}
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            loadAppointments();
            setSuccess('Appointment created successfully!');
            setTimeout(() => setSuccess(null), 3000);
          }}
          setError={setError}
        />
      )}

      {showDetailsModal && selectedAppointment && (
        <DetailsModal
          appointment={selectedAppointment}
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedAppointment(null);
          }}
          onReschedule={() => {
            setShowDetailsModal(false);
            setShowRescheduleModal(true);
          }}
          onCancel={() => {
            setShowDetailsModal(false);
            setShowCancelModal(true);
          }}
          formatDateTime={formatDateTime}
          getStatusDisplay={getStatusDisplay}
          getLocationIcon={getLocationIcon}
          appointmentNotes={appointmentNotes}
          setAppointmentNotes={setAppointmentNotes}
          user={user}
        />
      )}

      {showRescheduleModal && selectedAppointment && (
        <RescheduleModal
          appointment={selectedAppointment}
          onClose={() => {
            setShowRescheduleModal(false);
            setSelectedAppointment(null);
          }}
          onSuccess={() => {
            setShowRescheduleModal(false);
            setSelectedAppointment(null);
            loadAppointments();
            setSuccess('Appointment rescheduled successfully!');
            setTimeout(() => setSuccess(null), 3000);
          }}
          setError={setError}
        />
      )}

      {showCancelModal && selectedAppointment && (
        <CancelModal
          appointment={selectedAppointment}
          onClose={() => {
            setShowCancelModal(false);
            setSelectedAppointment(null);
          }}
          onSuccess={() => {
            setShowCancelModal(false);
            setSelectedAppointment(null);
            loadAppointments();
            setSuccess('Appointment canceled successfully!');
            setTimeout(() => setSuccess(null), 3000);
          }}
          setError={setError}
        />
      )}
    </div>
  );
}

function StatsCard({ icon: Icon, label, value, color }: { icon: any; label: string; value: string | number; color: string }) {
  return (
    <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
      <div className={`${color} w-12 h-12 rounded-lg flex items-center justify-center mb-4`}>
        <Icon className="w-6 h-6" />
      </div>
      <p className="text-2xl font-bold text-gray-900 mb-1">{value}</p>
      <p className="text-sm text-gray-600">{label}</p>
    </div>
  );
}

function AppointmentRow({
  appointment,
  formatDateTime,
  getStatusDisplay,
  getLocationIcon,
  onView,
}: {
  appointment: Appointment;
  formatDateTime: (date: string) => { date: string; time: string };
  getStatusDisplay: (status: string) => { icon: any; color: string; label: string };
  getLocationIcon: (type: string) => any;
  onView: () => void;
}) {
  const dateTime = formatDateTime(appointment.appointment_date);
  const statusDisplay = getStatusDisplay(appointment.status);
  const LocationIcon = getLocationIcon(appointment.location_type);

  return (
    <tr className="hover:bg-slate-50 transition cursor-pointer" onClick={onView}>
      <td className="px-4 py-4 font-mono text-sm text-gray-900">{appointment.appointment_id}</td>
      <td className="px-4 py-4">
        <p className="text-sm font-medium text-gray-900">{appointment.customer_name}</p>
        <p className="text-xs text-gray-500">{appointment.customer_email || 'N/A'}</p>
      </td>
      <td className="px-4 py-4 capitalize text-sm text-gray-900">{appointment.service_type}</td>
      <td className="px-4 py-4">
        <p className="text-sm text-gray-900">{dateTime.date}</p>
        <p className="text-xs text-gray-500">{dateTime.time}</p>
      </td>
      <td className="px-4 py-4 text-sm text-gray-900 text-right">{appointment.duration_minutes} min</td>
      <td className="px-4 py-4">
        <div className="flex items-center space-x-1 text-sm text-gray-700">
          <LocationIcon className="w-4 h-4" />
          <span className="capitalize">{appointment.location_type.replace('_', ' ')}</span>
        </div>
      </td>
      <td className="px-4 py-4">
        <div className={`flex items-center space-x-1 ${statusDisplay.color}`}>
          <statusDisplay.icon className="w-4 h-4" />
          <span className="text-sm font-medium capitalize">{statusDisplay.label}</span>
        </div>
      </td>
      <td className="px-4 py-4">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onView();
          }}
          className="p-2 text-cyan-600 hover:bg-cyan-50 rounded-lg transition"
        >
          <FileText className="w-4 h-4" />
        </button>
      </td>
    </tr>
  );
}

function EmptyState() {
  return (
    <div className="bg-white rounded-xl shadow-md p-12 text-center border border-gray-100">
      <div className="w-16 h-16 bg-cyan-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <Calendar className="w-8 h-8 text-cyan-600" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">No appointments found</h3>
      <p className="text-gray-600">Create your first appointment to get started</p>
    </div>
  );
}

// Enhanced CreateAppointmentModal with Pet Details Integration
export function CreateAppointmentModal({ user, onClose, onSuccess, setError }: any) {
  // Form data state
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    customerEmail: '',
    customerPhone: '',
    serviceTypes: [] as string[],
    appointmentDate: '',
    appointmentTime: '',
    durationMinutes: 60,
    locationType: 'virtual',
    locationDetails: '',
  });

  // Customer lookup state
  const [customerLookupStatus, setCustomerLookupStatus] = useState<'idle' | 'loading' | 'found' | 'multiple' | 'not-found' | 'error'>('idle');
  const [existingCustomer, setExistingCustomer] = useState<any>(null);
  const [customerMatches, setCustomerMatches] = useState<any[]>([]);
  const [customerPets, setCustomerPets] = useState<any[]>([]);
  const [selectedPetId, setSelectedPetId] = useState<string>('');

  // New customer/pet state
  const [isNewCustomer, setIsNewCustomer] = useState(false);
  const [showNewPetSection, setShowNewPetSection] = useState(false);
  const [numberOfPets, setNumberOfPets] = useState(1);
  const [newPets, setNewPets] = useState<Array<{ pet_type: string; pet_name: string }>>([{ pet_type: '', pet_name: '' }]);

  // Other state
  const [saving, setSaving] = useState(false);
  const [availableServices, setAvailableServices] = useState<string[]>([]);

  // Validation errors state
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Load services offered on mount
  useEffect(() => {
    loadServicesOffered();

    const subscription = supabase
      .channel('business_profiles_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'business_profiles',
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          loadServicesOffered();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user.id]);

  // Customer lookup when both names are filled
  useEffect(() => {
    const timer = setTimeout(() => {
      if (formData.firstName.trim() && formData.lastName.trim()) {
        lookupCustomer(formData.firstName.trim(), formData.lastName.trim());
      }
    }, 500); // Debounce for 500ms

    return () => clearTimeout(timer);
  }, [formData.firstName, formData.lastName]);

  const loadServicesOffered = async () => {
    try {
      const { data, error } = await supabase
        .from('business_profiles')
        .select('services_offered')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;

      if (data?.services_offered && Array.isArray(data.services_offered)) {
        setAvailableServices(data.services_offered);
      }
    } catch (err) {
      console.error('Error loading services:', err);
    }
  };

  // Customer lookup function
  const lookupCustomer = async (firstName: string, lastName: string) => {
    if (!firstName || !lastName) return;

    setCustomerLookupStatus('loading');

    try {
      const { data: customers, error } = await supabase
        .from('customers')
        .select('*')
        .ilike('first_name', firstName)
        .ilike('last_name', lastName)
        .eq('user_id', user.id);

      if (error) throw error;

      if (customers && customers.length > 0) {
        if (customers.length === 1) {
          // Single customer match
          setExistingCustomer(customers[0]);
          setFormData(prev => ({
            ...prev,
            customerEmail: customers[0].email || '',
            customerPhone: customers[0].phone || ''
          }));
          await fetchCustomerPets(customers[0].id);
          setCustomerLookupStatus('found');
          setIsNewCustomer(false);
        } else {
          // Multiple matches
          setCustomerMatches(customers);
          setCustomerLookupStatus('multiple');
        }
      } else {
        // No customer found - new customer mode
        setCustomerLookupStatus('not-found');
        setIsNewCustomer(true);
        setExistingCustomer(null);
        setCustomerPets([]);
        setShowNewPetSection(true);
      }
    } catch (error) {
      console.error('Customer lookup error:', error);
      setCustomerLookupStatus('error');
    }
  };

  // Fetch customer's pets
  const fetchCustomerPets = async (customerId: string) => {
    try {
      const { data: pets, error } = await supabase
        .from('pets')
        .select('*')
        .eq('customer_id', customerId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      setCustomerPets(pets || []);

      // Auto-select if only one pet
      if (pets && pets.length === 1) {
        setSelectedPetId(pets[0].id);
        setShowNewPetSection(false);
      } else if (!pets || pets.length === 0) {
        // Customer exists but has no pets
        setShowNewPetSection(true);
      } else {
        setShowNewPetSection(false);
      }
    } catch (error) {
      console.error('Error fetching pets:', error);
      setCustomerPets([]);
    }
  };

  // Handle customer selection from multiple matches
  const handleSelectCustomer = async (customer: any) => {
    setExistingCustomer(customer);
    setFormData(prev => ({
      ...prev,
      customerEmail: customer.email || '',
      customerPhone: customer.phone || ''
    }));
    await fetchCustomerPets(customer.id);
    setCustomerLookupStatus('found');
    setIsNewCustomer(false);
    setCustomerMatches([]);
  };

  // Handle number of pets change
  const handleNumberOfPetsChange = (value: number) => {
    const numPets = Math.max(1, Math.min(10, value));
    setNumberOfPets(numPets);

    const currentPets = [...newPets];
    if (numPets > currentPets.length) {
      // Add more pet entries
      const petsToAdd = numPets - currentPets.length;
      for (let i = 0; i < petsToAdd; i++) {
        currentPets.push({ pet_type: '', pet_name: '' });
      }
    } else if (numPets < currentPets.length) {
      // Remove excess pet entries
      currentPets.splice(numPets);
    }

    setNewPets(currentPets);
  };

  // Update individual pet data
  const updatePetData = (index: number, field: 'pet_type' | 'pet_name', value: string) => {
    const updatedPets = [...newPets];
    updatedPets[index][field] = value;
    setNewPets(updatedPets);
  };

  const handleServiceToggle = (service: string) => {
    setFormData(prev => ({
      ...prev,
      serviceTypes: prev.serviceTypes.includes(service)
        ? prev.serviceTypes.filter(s => s !== service)
        : [...prev.serviceTypes, service]
    }));
  };

  // Validation helper functions
  const validateField = (field: string, value: any): string | null => {
    switch (field) {
      case 'firstName':
      case 'lastName':
        const nameResult = validators.name(value, field === 'firstName' ? 'First Name' : 'Last Name');
        return nameResult.isValid ? null : nameResult.error || 'Invalid name';

      case 'customerEmail':
        if (isNewCustomer || value) {
          const emailResult = validators.email(value);
          return emailResult.isValid ? null : emailResult.error || 'Invalid email';
        }
        return null;

      case 'customerPhone':
        if (isNewCustomer || value) {
          const phoneResult = validators.phone(value);
          return phoneResult.isValid ? null : phoneResult.error || 'Invalid phone';
        }
        return null;

      case 'appointmentDate':
        const dateResult = validators.date(value, 'Appointment Date');
        return dateResult.isValid ? null : dateResult.error || 'Invalid date';

      case 'appointmentTime':
        const timeResult = validators.time(value);
        return timeResult.isValid ? null : timeResult.error || 'Invalid time';

      case 'durationMinutes':
        const durationResult = validators.number(value, 15, 480, 'Duration');
        return durationResult.isValid ? null : durationResult.error || 'Invalid duration';

      default:
        return null;
    }
  };

  const handleFieldChange = (field: string, value: any) => {
    // Apply filters based on field type
    let filteredValue = value;

    if (field === 'customerPhone') {
      filteredValue = filters.phone(value);
    } else if (field === 'customerEmail') {
      filteredValue = filters.email(value);
    } else if (field === 'firstName' || field === 'lastName') {
      filteredValue = filters.sanitize(value);
    }

    // Update form data
    setFormData(prev => ({ ...prev, [field]: filteredValue }));

    // Clear validation error for this field
    if (validationErrors[field]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validatePetName = (name: string, index: number): string | null => {
    const result = validators.petName(name);
    return result.isValid ? null : result.error || 'Invalid pet name';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Clear previous errors
    setValidationErrors({});
    const errors: Record<string, string> = {};

    // Validate all fields
    const firstNameError = validateField('firstName', formData.firstName);
    if (firstNameError) errors.firstName = firstNameError;

    const lastNameError = validateField('lastName', formData.lastName);
    if (lastNameError) errors.lastName = lastNameError;

    const emailError = validateField('customerEmail', formData.customerEmail);
    if (emailError) errors.customerEmail = emailError;

    const phoneError = validateField('customerPhone', formData.customerPhone);
    if (phoneError) errors.customerPhone = phoneError;

    const dateError = validateField('appointmentDate', formData.appointmentDate);
    if (dateError) errors.appointmentDate = dateError;

    const timeError = validateField('appointmentTime', formData.appointmentTime);
    if (timeError) errors.appointmentTime = timeError;

    // Validate future date/time
    if (formData.appointmentDate && formData.appointmentTime) {
      const futureValidation = validators.futureDate(formData.appointmentDate, formData.appointmentTime);
      if (!futureValidation.isValid) {
        errors.appointmentDate = futureValidation.error || 'Date must be in the future';
      }
    }

    const durationError = validateField('durationMinutes', formData.durationMinutes);
    if (durationError) errors.durationMinutes = durationError;

    // Validate service selection
    if (formData.serviceTypes.length === 0) {
      errors.serviceTypes = 'Please select at least one service type';
    }

    // Validate pet selection for existing customers
    if (!isNewCustomer && !showNewPetSection && !selectedPetId) {
      errors.petSelection = 'Please select a pet for this appointment';
    }

    // Validate new pet data
    if ((isNewCustomer || showNewPetSection) && newPets.length > 0) {
      for (let i = 0; i < newPets.length; i++) {
        if (!newPets[i].pet_type) {
          errors[`petType${i}`] = `Pet ${i + 1} type is required`;
        }
        if (!newPets[i].pet_name) {
          errors[`petName${i}`] = `Pet ${i + 1} name is required`;
        } else {
          const petNameError = validatePetName(newPets[i].pet_name, i);
          if (petNameError) {
            errors[`petName${i}`] = petNameError;
          }
        }
      }
    }

    // If there are validation errors, display them and stop
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      setError(Object.values(errors)[0]); // Show first error
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const appointmentDateTime = new Date(`${formData.appointmentDate}T${formData.appointmentTime}`);

      if (appointmentDateTime < new Date()) {
        throw new Error('Appointment date must be in the future');
      }

      let finalCustomerId = existingCustomer?.id;
      let finalPetId = selectedPetId;
      const customerFirstName = formData.firstName;
      const customerLastName = formData.lastName;
      const customerEmail = formData.customerEmail;
      const customerPhone = formData.customerPhone;

      // SCENARIO A: New Customer - Create customer and pets first
      if (isNewCustomer) {
        // Check for duplicate email
        const { data: existingByEmail } = await supabase
          .from('customers')
          .select('id')
          .eq('email', formData.customerEmail)
          .eq('user_id', user.id)
          .maybeSingle();

        if (existingByEmail) {
          throw new Error('A customer with this email already exists');
        }

        // Prepare auto-populated fields
        const fullName = `${formData.firstName} ${formData.lastName}`.trim();
        const locationAddress = formData.locationDetails?.trim() || null;

        // Insert new customer with auto-populated point_of_contact and address
        const { data: newCustomer, error: customerError } = await supabase
          .from('customers')
          .insert({
            user_id: user.id,
            first_name: formData.firstName,
            last_name: formData.lastName,
            email: formData.customerEmail,
            phone: formData.customerPhone,
            point_of_contact: fullName,
            address: locationAddress,
          })
          .select()
          .single();

        if (customerError) throw customerError;
        finalCustomerId = newCustomer.id;

        // Insert all pets for this new customer
        const petsToInsert = newPets.map(pet => ({
          customer_id: finalCustomerId,
          pet_type: pet.pet_type,
          pet_name: pet.pet_name
        }));

        const { data: insertedPets, error: petsError } = await supabase
          .from('pets')
          .insert(petsToInsert)
          .select();

        if (petsError) throw petsError;

        // Use first pet for this appointment
        finalPetId = insertedPets[0].id;
      }
      // SCENARIO B: Existing customer adding new pet
      else if (existingCustomer && showNewPetSection && newPets.length > 0) {
        const petsToInsert = newPets.map(pet => ({
          customer_id: existingCustomer.id,
          pet_type: pet.pet_type,
          pet_name: pet.pet_name
        }));

        const { data: insertedPets, error: petsError } = await supabase
          .from('pets')
          .insert(petsToInsert)
          .select();

        if (petsError) throw petsError;
        finalPetId = insertedPets[0].id;
      }

      // Validate pet selection
      if (!finalPetId) {
        throw new Error('Please select a pet for this appointment');
      }

      // Generate appointment ID
      const appointmentId = `APT-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

      // Get business profile
      const { data: profile } = await supabase
        .from('business_profiles')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      // Create appointment with BOTH normalized (IDs) and denormalized (text) data
      const { error: insertError } = await supabase
        .from('appointments')
        .insert({
          // User and business references
          user_id: user.id,
          business_profile_id: profile?.id,
          appointment_id: appointmentId,

          // Foreign key references (NEW - normalized for relational queries)
          customer_id: finalCustomerId,
          pet_id: finalPetId,

          // Denormalized customer data (EXISTING - for backward compatibility & performance)
          customer_name: `${customerFirstName} ${customerLastName}`,
          first_name: customerFirstName,
          last_name: customerLastName,
          customer_email: customerEmail || null,
          customer_phone: customerPhone || null,

          // Appointment details
          service_type: formData.serviceTypes.join(', '),
          appointment_date: appointmentDateTime.toISOString(),
          appointment_time: formData.appointmentTime,
          duration_minutes: formData.durationMinutes,
          status: 'scheduled',
          location_type: formData.locationType,
          location_details: formData.locationDetails || null,
          reminder_sent: false,
        });

      if (insertError) throw insertError;

      // Success message
      const successMessage = isNewCustomer
        ? 'Customer, pets, and appointment created successfully!'
        : 'Appointment created successfully!';

      onSuccess();
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">New Appointment</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                First Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.firstName}
                onChange={(e) => handleFieldChange('firstName', e.target.value)}
                onBlur={(e) => {
                  const error = validateField('firstName', e.target.value);
                  if (error) setValidationErrors(prev => ({ ...prev, firstName: error }));
                }}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-cyan-500 ${
                  validationErrors.firstName ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="John"
              />
              {validationErrors.firstName && (
                <p className="text-red-500 text-xs mt-1">{validationErrors.firstName}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Last Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.lastName}
                onChange={(e) => handleFieldChange('lastName', e.target.value)}
                onBlur={(e) => {
                  const error = validateField('lastName', e.target.value);
                  if (error) setValidationErrors(prev => ({ ...prev, lastName: error }));
                }}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-cyan-500 ${
                  validationErrors.lastName ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Doe"
              />
              {validationErrors.lastName && (
                <p className="text-red-500 text-xs mt-1">{validationErrors.lastName}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Customer Email {isNewCustomer && <span className="text-red-500">*</span>}
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  required={isNewCustomer}
                  value={formData.customerEmail}
                  onChange={(e) => handleFieldChange('customerEmail', e.target.value)}
                  onBlur={(e) => {
                    const error = validateField('customerEmail', e.target.value);
                    if (error) setValidationErrors(prev => ({ ...prev, customerEmail: error }));
                  }}
                  className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-cyan-500 ${
                    validationErrors.customerEmail ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="john@example.com"
                />
              </div>
              {validationErrors.customerEmail && (
                <p className="text-red-500 text-xs mt-1">{validationErrors.customerEmail}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Customer Phone {isNewCustomer && <span className="text-red-500">*</span>}
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="tel"
                  required={isNewCustomer}
                  value={formData.customerPhone}
                  onChange={(e) => handleFieldChange('customerPhone', e.target.value)}
                  onBlur={(e) => {
                    const error = validateField('customerPhone', e.target.value);
                    if (error) setValidationErrors(prev => ({ ...prev, customerPhone: error }));
                  }}
                  className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-cyan-500 ${
                    validationErrors.customerPhone ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="+1 (555) 123-4567"
                  maxLength={15}
                />
              </div>
              {validationErrors.customerPhone && (
                <p className="text-red-500 text-xs mt-1">{validationErrors.customerPhone}</p>
              )}
            </div>
          </div>

          {/* Customer Lookup Status Indicator */}
          {customerLookupStatus !== 'idle' && (
            <div className="mb-4">
              {customerLookupStatus === 'loading' && (
                <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Looking up customer...
                </div>
              )}

              {customerLookupStatus === 'found' && (
                <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 p-3 rounded-lg border border-green-200">
                  <CheckCircle className="w-4 h-4" />
                  Customer found
                </div>
              )}

              {customerLookupStatus === 'not-found' && (
                <div className="flex items-center gap-2 text-sm text-blue-700 bg-blue-50 p-3 rounded-lg border border-blue-200">
                  <AlertCircle className="w-4 h-4" />
                  New customer
                </div>
              )}

              {customerLookupStatus === 'error' && (
                <div className="flex items-center gap-2 text-sm text-red-700 bg-red-50 p-3 rounded-lg border border-red-200">
                  <XCircle className="w-4 h-4" />
                  Error looking up customer
                </div>
              )}
            </div>
          )}

          {/* Multiple Customer Matches Selection */}
          {customerLookupStatus === 'multiple' && customerMatches.length > 0 && (
            <div className="mb-6 p-4 border-2 border-cyan-300 bg-cyan-50 rounded-lg">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Multiple customers found - Select one:</h3>
              <div className="space-y-2">
                {customerMatches.map((customer) => (
                  <button
                    key={customer.id}
                    type="button"
                    onClick={() => handleSelectCustomer(customer)}
                    className="w-full text-left p-3 bg-white border border-gray-300 rounded-lg hover:border-cyan-500 hover:bg-cyan-50 transition"
                  >
                    <p className="font-medium text-gray-900">{customer.first_name} {customer.last_name}</p>
                    <p className="text-sm text-gray-600">{customer.email} • {customer.phone}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Pet Details Section - For Existing Customers with Pets */}
          {customerLookupStatus === 'found' && customerPets.length > 0 && !showNewPetSection && (
            <div className="mb-6 p-4 border border-gray-200 rounded-lg bg-gray-50">
              <div className="flex items-center gap-2 mb-3">
                <PawPrint className="w-5 h-5 text-cyan-600" />
                <h3 className="text-sm font-semibold text-gray-700">Pet Details</h3>
              </div>

              <div className="mb-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Select Pet for Appointment <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedPetId}
                  onChange={(e) => setSelectedPetId(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 bg-white"
                  required
                >
                  <option value="">Select a pet</option>
                  {customerPets.map((pet) => (
                    <option key={pet.id} value={pet.id}>
                      {pet.pet_name} ({pet.pet_type})
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="button"
                onClick={() => setShowNewPetSection(true)}
                className="text-sm text-cyan-600 hover:text-cyan-700 underline"
              >
                + Add a new pet for this customer
              </button>
            </div>
          )}

          {/* No Pets Message - For Existing Customers without Pets */}
          {customerLookupStatus === 'found' && customerPets.length === 0 && !showNewPetSection && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                No pets found for this customer. Please add pet details below.
              </p>
            </div>
          )}

          {/* Add Pet Details Section - For New Customers or Adding New Pets */}
          {(isNewCustomer || showNewPetSection) && (
            <div className="mb-6 p-4 border border-gray-200 rounded-lg bg-slate-50">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <PawPrint className="w-5 h-5 text-cyan-600" />
                  <h3 className="text-sm font-semibold text-gray-700">Add Pet Details</h3>
                </div>
                {!isNewCustomer && showNewPetSection && (
                  <button
                    type="button"
                    onClick={() => setShowNewPetSection(false)}
                    className="text-sm text-gray-600 hover:text-gray-800"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Number of Pets <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={numberOfPets}
                  onChange={(e) => handleNumberOfPetsChange(parseInt(e.target.value) || 1)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 bg-white"
                  required
                />
              </div>

              <div className="space-y-3">
                {newPets.map((pet, index) => (
                  <div key={index} className="p-3 bg-white border border-gray-200 rounded-lg">
                    <h4 className="text-sm font-medium text-gray-600 mb-2">Pet {index + 1}</h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Pet Type <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={pet.pet_type}
                          onChange={(e) => updatePetData(index, 'pet_type', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 bg-white"
                          required
                        >
                          <option value="">Select pet type</option>
                          <option value="Dog">Dog</option>
                          <option value="Cat">Cat</option>
                          <option value="Bird">Bird</option>
                          <option value="Rabbit">Rabbit</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Pet Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={pet.pet_name}
                          onChange={(e) => updatePetData(index, 'pet_name', e.target.value)}
                          placeholder="Pet name"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
                          required
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Service Type <span className="text-red-500">*</span>
              </label>
              {availableServices.length === 0 ? (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm text-yellow-800">
                  No services configured. Please add services in your business profile first.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {availableServices.map((service) => (
                    <label
                      key={service}
                      className={`flex items-center space-x-2 px-4 py-3 border-2 rounded-lg cursor-pointer transition ${
                        formData.serviceTypes.includes(service)
                          ? 'border-cyan-500 bg-cyan-50'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={formData.serviceTypes.includes(service)}
                        onChange={() => handleServiceToggle(service)}
                        className="w-4 h-4 text-cyan-600 border-gray-300 rounded focus:ring-cyan-500"
                      />
                      <span className="text-sm font-medium text-gray-900">{service}</span>
                    </label>
                  ))}
                </div>
              )}
              {formData.serviceTypes.length > 0 && (
                <p className="mt-2 text-sm text-gray-600">
                  Selected: {formData.serviceTypes.join(', ')}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                required
                value={formData.appointmentDate}
                onChange={(e) => handleFieldChange('appointmentDate', e.target.value)}
                onBlur={(e) => {
                  const error = validateField('appointmentDate', e.target.value);
                  if (error) setValidationErrors(prev => ({ ...prev, appointmentDate: error }));
                }}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-cyan-500 ${
                  validationErrors.appointmentDate ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {validationErrors.appointmentDate && (
                <p className="text-red-500 text-xs mt-1">{validationErrors.appointmentDate}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Time <span className="text-red-500">*</span>
              </label>
              <input
                type="time"
                required
                value={formData.appointmentTime}
                onChange={(e) => handleFieldChange('appointmentTime', e.target.value)}
                onBlur={(e) => {
                  const error = validateField('appointmentTime', e.target.value);
                  if (error) setValidationErrors(prev => ({ ...prev, appointmentTime: error }));
                }}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-cyan-500 ${
                  validationErrors.appointmentTime ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {validationErrors.appointmentTime && (
                <p className="text-red-500 text-xs mt-1">{validationErrors.appointmentTime}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Duration (minutes)</label>
              <input
                type="number"
                min="15"
                max="480"
                step="15"
                value={formData.durationMinutes}
                onChange={(e) => handleFieldChange('durationMinutes', parseInt(e.target.value) || 60)}
                onBlur={(e) => {
                  const error = validateField('durationMinutes', e.target.value);
                  if (error) setValidationErrors(prev => ({ ...prev, durationMinutes: error }));
                }}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-cyan-500 ${
                  validationErrors.durationMinutes ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {validationErrors.durationMinutes && (
                <p className="text-red-500 text-xs mt-1">{validationErrors.durationMinutes}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Location Type</label>
              <select
                value={formData.locationType}
                onChange={(e) => setFormData({ ...formData, locationType: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
              >
                <option value="virtual">Virtual</option>
                <option value="in_person">In Person</option>
                <option value="phone">Phone</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Location Details</label>
              <input
                type="text"
                value={formData.locationDetails}
                onChange={(e) => setFormData({ ...formData, locationDetails: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
                placeholder="Meeting link, address, or phone number"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 disabled:opacity-50"
            >
              {saving ? 'Creating...' : 'Create Appointment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function DetailsModal({ appointment, onClose, onReschedule, onCancel, formatDateTime, getStatusDisplay, getLocationIcon, appointmentNotes, setAppointmentNotes, user }: any) {
  const [newNote, setNewNote] = useState('');
  const [addingNote, setAddingNote] = useState(false);

  useEffect(() => {
    loadNotes();
  }, [appointment.id]);

  const loadNotes = async () => {
    const { data } = await supabase
      .from('appointment_notes')
      .select('*')
      .eq('appointment_id', appointment.id)
      .order('created_at', { ascending: false });

    setAppointmentNotes(data || []);
  };

  const handleAddNote = async () => {
    if (!newNote.trim()) return;

    setAddingNote(true);
    try {
      await supabase.from('appointment_notes').insert({
        appointment_id: appointment.id,
        user_id: user.id,
        content: newNote.trim(),
      });

      setNewNote('');
      loadNotes();
    } catch (err) {
      console.error('Error adding note:', err);
    } finally {
      setAddingNote(false);
    }
  };

  const dateTime = formatDateTime(appointment.appointment_date);
  const statusDisplay = getStatusDisplay(appointment.status);
  const LocationIcon = getLocationIcon(appointment.location_type);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden">
        <div className="bg-slate-50 border-b border-gray-200 p-6 flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Appointment Details</h2>
            <p className="text-sm font-mono text-gray-600">{appointment.appointment_id}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <p className="text-sm text-gray-600 mb-1">Status</p>
              <div className={`flex items-center space-x-2 ${statusDisplay.color}`}>
                <statusDisplay.icon className="w-5 h-5" />
                <span className="font-medium">{statusDisplay.label}</span>
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Service Type</p>
              <p className="font-medium text-gray-900 capitalize">{appointment.service_type}</p>
            </div>
          </div>

          {/* Customer Info */}
          <div className="border-t border-gray-200 pt-4 mb-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Customer Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Name</p>
                <p className="font-medium text-gray-900">{appointment.customer_name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="font-medium text-gray-900">{appointment.customer_email || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Phone</p>
                <p className="font-medium text-gray-900">{appointment.customer_phone || 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* Appointment Details */}
          <div className="border-t border-gray-200 pt-4 mb-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Appointment Details</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Date & Time</p>
                <p className="font-medium text-gray-900">{dateTime.full}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Duration</p>
                <p className="font-medium text-gray-900">{appointment.duration_minutes} minutes</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Location Type</p>
                <div className="flex items-center space-x-1">
                  <LocationIcon className="w-4 h-4" />
                  <span className="font-medium text-gray-900 capitalize">{appointment.location_type.replace('_', ' ')}</span>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-600">Location Details</p>
                <p className="font-medium text-gray-900">{appointment.location_details || 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* Cancellation Reason */}
          {appointment.cancellation_reason && (
            <div className="border-t border-gray-200 pt-4 mb-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-2">Cancellation Reason</h3>
              <div className="bg-red-50 rounded-lg p-3">
                <p className="text-sm text-slate-700">{appointment.cancellation_reason}</p>
              </div>
            </div>
          )}

          {/* Notes */}
          <div className="border-t border-gray-200 pt-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Notes</h3>
            <div className="space-y-2 mb-4">
              {appointmentNotes.length === 0 ? (
                <p className="text-sm text-gray-500">No notes yet</p>
              ) : (
                appointmentNotes.map((note: AppointmentNote) => (
                  <div key={note.id} className="bg-slate-50 rounded-lg p-3">
                    <p className="text-sm text-slate-700">{note.content}</p>
                    <p className="text-xs text-slate-500 mt-1">
                      {new Date(note.created_at).toLocaleString()}
                    </p>
                  </div>
                ))
              )}
            </div>

            <textarea
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              maxLength={2000}
              rows={3}
              placeholder="Add a note (max 2000 characters)..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 mb-2"
            />
            <button
              onClick={handleAddNote}
              disabled={!newNote.trim() || addingNote}
              className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {addingNote ? 'Adding...' : 'Add Note'}
            </button>
          </div>
        </div>

        <div className="border-t border-gray-200 p-4 flex justify-between">
          <div className="flex space-x-2">
            {appointment.status === 'scheduled' && (
              <>
                <button
                  onClick={onReschedule}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
                >
                  <Edit className="w-4 h-4" />
                  <span>Reschedule</span>
                </button>
                <button
                  onClick={onCancel}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center space-x-2"
                >
                  <XCircle className="w-4 h-4" />
                  <span>Cancel</span>
                </button>
              </>
            )}
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

function RescheduleModal({ appointment, onClose, onSuccess, setError }: any) {
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const newDateTime = new Date(`${newDate}T${newTime}`);
      if (newDateTime < new Date()) {
        throw new Error('New appointment time must be in the future');
      }

      const { error: updateError } = await supabase
        .from('appointments')
        .update({
          appointment_date: newDateTime.toISOString(),
          appointment_time: newTime,
          status: 'rescheduled',
        })
        .eq('id', appointment.id);

      if (updateError) throw updateError;
      onSuccess();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900">Reschedule Appointment</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">New Date</label>
              <input
                type="date"
                required
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">New Time</label>
              <input
                type="time"
                required
                value={newTime}
                onChange={(e) => setNewTime(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 disabled:opacity-50"
            >
              {saving ? 'Rescheduling...' : 'Confirm Reschedule'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function CancelModal({ appointment, onClose, onSuccess, setError }: any) {
  const [reason, setReason] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason) {
      setError('Please select a cancellation reason');
      return;
    }

    setSaving(true);
    try {
      const { error: updateError } = await supabase
        .from('appointments')
        .update({
          status: 'canceled',
          cancellation_reason: reason,
        })
        .eq('id', appointment.id);

      if (updateError) throw updateError;
      onSuccess();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900">Cancel Appointment</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <p className="text-sm text-gray-600 mb-4">
            Are you sure you want to cancel this appointment? This action cannot be undone.
          </p>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Cancellation Reason <span className="text-red-500">*</span>
            </label>
            <select
              required
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
            >
              <option value="">Select a reason</option>
              <option value="Customer Request">Customer Request</option>
              <option value="Scheduling Conflict">Scheduling Conflict</option>
              <option value="No Show">No Show</option>
              <option value="Emergency">Emergency</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Go Back
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
            >
              {saving ? 'Canceling...' : 'Confirm Cancellation'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
