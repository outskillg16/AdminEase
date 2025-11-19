import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Phone,
  PhoneIncoming,
  PhoneMissed,
  Clock,
  Search,
  Filter,
  X,
  Eye,
  MoreVertical,
  PhoneOutgoing,
  PhoneCall,
  Smile,
  Meh,
  Frown,
  ChevronLeft,
  ChevronRight,
  Loader2,
  User,
  Settings,
  LogOut,
  Zap,
  Menu,
  Calendar,
  Download,
  ChevronDown,
} from 'lucide-react';
import { supabase } from '../lib/supabase';

interface CallManagementProps {
  user: {
    id: string;
    email: string;
    user_metadata?: {
      full_name?: string;
    };
  };
  onLogout: () => void;
}

interface Call {
  id: string;
  caller_name?: string;
  caller_phone: string;
  call_type: 'inbound' | 'outbound' | 'callback';
  status: 'answered' | 'missed' | 'voicemail' | 'in_progress' | 'failed' | 'completed';
  start_time: string;
  end_time?: string;
  duration?: number;
  transcript?: string;
  summary?: string;
  sentiment?: 'positive' | 'neutral' | 'negative';
  sentiment_score?: number;
  intent?: string;
  keywords?: string[];
  extracted_entities?: Record<string, any>;
  notes?: string;
  action_items?: any[];
  follow_up_required: boolean;
  recording_url?: string;
  recording_duration?: number;
  created_at: string;
  updated_at: string;
}

interface CallMetrics {
  totalCalls: number;
  answeredCalls: number;
  missedCalls: number;
  averageDuration: number;
}

export default function CallManagement({ user, onLogout }: CallManagementProps) {
  const navigate = useNavigate();
  const [calls, setCalls] = useState<Call[]>([]);
  const [filteredCalls, setFilteredCalls] = useState<Call[]>([]);
  const [selectedCall, setSelectedCall] = useState<Call | null>(null);
  const [metrics, setMetrics] = useState<CallMetrics>({
    totalCalls: 0,
    answeredCalls: 0,
    missedCalls: 0,
    averageDuration: 0,
  });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [callTypeFilter, setCallTypeFilter] = useState<string>('all');
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [activeTab, setActiveTab] = useState('Call Management');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(25);
  const [businessProfileId, setBusinessProfileId] = useState<string | null>(null);

  const fullName = user.user_metadata?.full_name || user.email.split('@')[0];
  const initials = fullName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  useEffect(() => {
    loadCalls();
  }, []);

  useEffect(() => {
    filterCalls();
  }, [calls, searchQuery, statusFilter, callTypeFilter]);

  const loadCalls = async () => {
    try {
      setLoading(true);

      const { data: profile, error: profileError } = await supabase
        .from('business_profiles')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (profileError) throw profileError;
      if (!profile) {
        setLoading(false);
        return;
      }

      setBusinessProfileId(profile.id);

      const { data: callsData, error: callsError } = await supabase
        .from('calls')
        .select('*')
        .eq('user_id', user.id)
        .order('start_time', { ascending: false });

      if (callsError) throw callsError;

      setCalls(callsData || []);
      calculateMetrics(callsData || []);
    } catch (err) {
      console.error('Error loading calls:', err);
    } finally {
      setLoading(false);
    }
  };

  const calculateMetrics = (callsData: Call[]) => {
    const totalCalls = callsData.length;
    const answeredCalls = callsData.filter((c) => c.status === 'answered').length;
    const missedCalls = callsData.filter((c) => c.status === 'missed').length;
    const durations = callsData.filter((c) => c.duration).map((c) => c.duration!);
    const averageDuration = durations.length > 0
      ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length)
      : 0;

    setMetrics({
      totalCalls,
      answeredCalls,
      missedCalls,
      averageDuration,
    });
  };

  const filterCalls = () => {
    let filtered = [...calls];

    if (searchQuery.trim().length >= 2) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (call) =>
          call.caller_name?.toLowerCase().includes(query) ||
          call.caller_phone.includes(query) ||
          call.notes?.toLowerCase().includes(query)
      );
    }

    if (statusFilter.length > 0) {
      filtered = filtered.filter((call) => statusFilter.includes(call.status));
    }

    if (callTypeFilter !== 'all') {
      filtered = filtered.filter((call) => call.call_type === callTypeFilter);
    }

    setFilteredCalls(filtered);
    setCurrentPage(1);
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return '-';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      time: date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    };
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'answered':
      case 'completed':
        return 'bg-green-500';
      case 'missed':
      case 'failed':
        return 'bg-red-500';
      case 'voicemail':
        return 'bg-blue-500';
      case 'in_progress':
        return 'bg-yellow-500';
      default:
        return 'bg-slate-500';
    }
  };

  const handleNavigate = (tab: string) => {
    setActiveTab(tab);
    if (tab === 'Dashboard') navigate('/dashboard');
    if (tab === 'Onboarding') navigate('/onboarding');
    if (tab === 'AI Configuration') navigate('/ai-configuration');
    if (tab === 'Call Management') navigate('/call-management');
  };

  const paginatedCalls = filteredCalls.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const totalPages = Math.ceil(filteredCalls.length / pageSize);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-cyan-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-cyan-600 animate-spin mx-auto mb-4" />
          <p className="text-slate-600">Loading calls...</p>
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
              onClick={() => navigate('/dashboard')}
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
              {['Dashboard', 'Onboarding', 'AI Configuration', 'Call Management', 'Appointments', 'Documents'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => handleNavigate(tab)}
                  className={`px-4 py-2 text-sm font-medium transition-all duration-200 border-b-2 ${
                    activeTab === tab
                      ? 'text-cyan-600 border-cyan-600'
                      : 'text-gray-600 border-transparent hover:text-gray-900 hover:border-gray-300'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </nav>

            <div className="flex items-center space-x-2">
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
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 animate-fade-in">
                    <button className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2 transition">
                      <User className="w-4 h-4" />
                      <span>Profile</span>
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

          {showMobileMenu && (
            <div className="md:hidden border-t border-gray-200 py-3 animate-fade-in">
              <nav className="flex flex-col space-y-1">
                {['Dashboard', 'Onboarding', 'AI Configuration', 'Call Management', 'Appointments', 'Documents'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => {
                      handleNavigate(tab);
                      setShowMobileMenu(false);
                    }}
                    className={`px-4 py-3 text-sm font-medium text-left transition-all duration-200 ${
                      activeTab === tab
                        ? 'bg-cyan-50 text-cyan-600 border-l-4 border-cyan-600'
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
        {/* Page Title */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Call Management</h1>
          <p className="text-gray-600">View, filter, and manage all calls handled by your AI assistant</p>
        </div>

        {/* Summary Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricCard
            icon={Phone}
            label="Total Calls"
            value={metrics.totalCalls}
            color="bg-cyan-500"
          />
          <MetricCard
            icon={PhoneIncoming}
            label="Answered"
            value={metrics.answeredCalls}
            color="bg-green-500"
            subtitle={`${metrics.totalCalls > 0 ? Math.round((metrics.answeredCalls / metrics.totalCalls) * 100) : 0}% of total`}
          />
          <MetricCard
            icon={PhoneMissed}
            label="Missed"
            value={metrics.missedCalls}
            color="bg-red-500"
            subtitle={`${metrics.totalCalls > 0 ? Math.round((metrics.missedCalls / metrics.totalCalls) * 100) : 0}% of total`}
          />
          <MetricCard
            icon={Clock}
            label="Avg Duration"
            value={formatDuration(metrics.averageDuration)}
            color="bg-blue-500"
            valueClass="text-2xl"
          />
        </div>

        {/* Filters & Search */}
        <div className="bg-white rounded-xl shadow-md p-4 mb-6 border border-gray-100">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by name, number, or notes..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <select
                value={callTypeFilter}
                onChange={(e) => setCallTypeFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              >
                <option value="all">All Types</option>
                <option value="inbound">Inbound</option>
                <option value="outbound">Outbound</option>
                <option value="callback">Callback</option>
              </select>

              <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition flex items-center space-x-2">
                <Calendar className="w-4 h-4" />
                <span>Last 30 days</span>
              </button>

              {(searchQuery || statusFilter.length > 0 || callTypeFilter !== 'all') && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setStatusFilter([]);
                    setCallTypeFilter('all');
                  }}
                  className="px-4 py-2 text-cyan-600 hover:bg-cyan-50 rounded-lg transition flex items-center space-x-1"
                >
                  <X className="w-4 h-4" />
                  <span>Clear</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Call List Table */}
        {filteredCalls.length === 0 ? (
          <EmptyState hasFilters={searchQuery.length > 0 || statusFilter.length > 0 || callTypeFilter !== 'all'} />
        ) : (
          <>
            <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Caller
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Date & Time
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Duration
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Sentiment
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {paginatedCalls.map((call, idx) => (
                      <CallRow
                        key={call.id}
                        call={call}
                        isEven={idx % 2 === 1}
                        onViewDetails={() => setSelectedCall(call)}
                        formatDateTime={formatDateTime}
                        formatDuration={formatDuration}
                        getStatusColor={getStatusColor}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination */}
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              pageSize={pageSize}
              totalItems={filteredCalls.length}
              onPageChange={setCurrentPage}
            />
          </>
        )}
      </main>

      {/* Call Detail Modal */}
      {selectedCall && (
        <CallDetailModal
          call={selectedCall}
          onClose={() => setSelectedCall(null)}
          formatDateTime={formatDateTime}
          formatDuration={formatDuration}
          getStatusColor={getStatusColor}
        />
      )}
    </div>
  );
}

function MetricCard({
  icon: Icon,
  label,
  value,
  color,
  subtitle,
  valueClass = 'text-3xl',
}: {
  icon: any;
  label: string;
  value: number | string;
  color: string;
  subtitle?: string;
  valueClass?: string;
}) {
  return (
    <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100 hover:shadow-lg transition-shadow duration-200">
      <div className="flex items-start justify-between mb-4">
        <div className={`${color} p-3 rounded-lg`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
      <p className="text-xs uppercase font-semibold text-gray-600 mb-1">{label}</p>
      <p className={`${valueClass} font-bold text-gray-900`}>{value}</p>
      {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
    </div>
  );
}

function CallRow({
  call,
  isEven,
  onViewDetails,
  formatDateTime,
  formatDuration,
  getStatusColor,
}: {
  call: Call;
  isEven: boolean;
  onViewDetails: () => void;
  formatDateTime: (date: string) => { date: string; time: string };
  formatDuration: (seconds?: number) => string;
  getStatusColor: (status: string) => string;
}) {
  const dateTime = formatDateTime(call.start_time);

  const getCallTypeIcon = () => {
    switch (call.call_type) {
      case 'inbound':
        return <PhoneIncoming className="w-4 h-4" />;
      case 'outbound':
        return <PhoneOutgoing className="w-4 h-4" />;
      case 'callback':
        return <PhoneCall className="w-4 h-4" />;
    }
  };

  const getSentimentDisplay = () => {
    if (!call.sentiment) {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
          <span className="mr-1">?</span>
          Unknown
        </span>
      );
    }

    switch (call.sentiment) {
      case 'positive':
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
            <Smile className="w-3 h-3 mr-1" />
            Positive
          </span>
        );
      case 'neutral':
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
            <Meh className="w-3 h-3 mr-1" />
            Neutral
          </span>
        );
      case 'negative':
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
            <Frown className="w-3 h-3 mr-1" />
            Negative
          </span>
        );
    }
  };

  return (
    <tr
      className={`${isEven ? 'bg-slate-50' : 'bg-white'} hover:bg-cyan-50 transition-colors cursor-pointer group`}
      onClick={onViewDetails}
    >
      <td className="px-4 py-4">
        <div className="relative">
          <div className={`w-2 h-2 rounded-full ${getStatusColor(call.status)}`} />
        </div>
      </td>
      <td className="px-4 py-4">
        <div>
          <p className="text-sm font-medium text-gray-900">{call.caller_name || 'Unknown Caller'}</p>
          <p className="text-xs text-gray-500">{call.caller_phone}</p>
        </div>
      </td>
      <td className="px-4 py-4">
        <div>
          <p className="text-sm text-gray-900">{dateTime.date}</p>
          <p className="text-xs text-gray-500">{dateTime.time}</p>
        </div>
      </td>
      <td className="px-4 py-4">
        <p className="text-sm text-gray-900 text-right">{formatDuration(call.duration)}</p>
      </td>
      <td className="px-4 py-4">
        <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
          call.call_type === 'inbound' ? 'bg-blue-100 text-blue-700' :
          call.call_type === 'outbound' ? 'bg-cyan-100 text-cyan-700' :
          'bg-purple-100 text-purple-700'
        }`}>
          {getCallTypeIcon()}
          <span className="ml-1 capitalize">{call.call_type}</span>
        </span>
      </td>
      <td className="px-4 py-4">{getSentimentDisplay()}</td>
      <td className="px-4 py-4">
        <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onViewDetails();
            }}
            className="p-1 text-cyan-600 hover:bg-cyan-100 rounded transition"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => e.stopPropagation()}
            className="p-1 text-gray-600 hover:bg-gray-100 rounded transition"
          >
            <MoreVertical className="w-4 h-4" />
          </button>
        </div>
      </td>
    </tr>
  );
}

function Pagination({
  currentPage,
  totalPages,
  pageSize,
  totalItems,
  onPageChange,
}: {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalItems: number;
  onPageChange: (page: number) => void;
}) {
  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  return (
    <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
      <p className="text-sm text-gray-600">
        Showing {startItem}-{endItem} of {totalItems} calls
      </p>

      <div className="flex items-center space-x-2">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {[...Array(totalPages)].map((_, i) => {
          const page = i + 1;
          if (
            page === 1 ||
            page === totalPages ||
            (page >= currentPage - 1 && page <= currentPage + 1)
          ) {
            return (
              <button
                key={page}
                onClick={() => onPageChange(page)}
                className={`px-3 py-1 rounded-lg transition ${
                  page === currentPage
                    ? 'bg-cyan-600 text-white'
                    : 'border border-gray-300 hover:bg-gray-50'
                }`}
              >
                {page}
              </button>
            );
          } else if (page === currentPage - 2 || page === currentPage + 2) {
            return <span key={page} className="px-2">...</span>;
          }
          return null;
        })}

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

function EmptyState({ hasFilters }: { hasFilters: boolean }) {
  if (hasFilters) {
    return (
      <div className="bg-white rounded-xl shadow-md p-12 text-center border border-gray-100">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Search className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No calls match your filters</h3>
        <p className="text-gray-600 mb-4">Try adjusting your search or filters</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-md p-12 text-center border border-gray-100">
      <div className="w-16 h-16 bg-cyan-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <Phone className="w-8 h-8 text-cyan-600" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">No calls yet</h3>
      <p className="text-gray-600 mb-4">Calls will appear here once your AI assistant starts receiving them</p>
      <button className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition">
        View AI Configuration
      </button>
    </div>
  );
}

function CallDetailModal({
  call,
  onClose,
  formatDateTime,
  formatDuration,
  getStatusColor,
}: {
  call: Call;
  onClose: () => void;
  formatDateTime: (date: string) => { date: string; time: string };
  formatDuration: (seconds?: number) => string;
  getStatusColor: (status: string) => string;
}) {
  const dateTime = formatDateTime(call.start_time);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-slate-50 border-b border-gray-200 p-6 flex items-start justify-between sticky top-0">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <div className={`w-3 h-3 rounded-full ${getStatusColor(call.status)}`} />
              <span className="text-xs uppercase font-semibold text-gray-600">{call.status}</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900">{call.caller_name || 'Unknown Caller'}</h2>
            <p className="text-gray-600">{call.caller_phone}</p>
            <p className="text-sm text-gray-500 mt-1">
              {dateTime.date} at {dateTime.time}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-200 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {/* Call Summary */}
          <div className="bg-slate-100 rounded-lg p-4 mb-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Call Summary</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-600 mb-1">Duration</p>
                <p className="text-sm font-medium text-gray-900">{formatDuration(call.duration)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600 mb-1">Type</p>
                <p className="text-sm font-medium text-gray-900 capitalize">{call.call_type}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600 mb-1">Sentiment</p>
                <p className="text-sm font-medium text-gray-900 capitalize">{call.sentiment || 'Unknown'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600 mb-1">Follow-up Required</p>
                <p className="text-sm font-medium text-gray-900">{call.follow_up_required ? 'Yes' : 'No'}</p>
              </div>
            </div>
          </div>

          {/* Transcript */}
          {call.transcript && (
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Conversation Transcript</h3>
              <div className="bg-white border border-gray-200 rounded-lg p-4 max-h-60 overflow-y-auto">
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{call.transcript}</p>
              </div>
            </div>
          )}

          {/* Summary */}
          {call.summary && (
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">AI Summary</h3>
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <p className="text-sm text-gray-700">{call.summary}</p>
              </div>
            </div>
          )}

          {/* Notes */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Notes</h3>
            <textarea
              defaultValue={call.notes || ''}
              placeholder="Add notes about this call..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              rows={4}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="bg-white border-t border-gray-200 p-4 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
          >
            Close
          </button>
          <button className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition flex items-center space-x-2">
            <Download className="w-4 h-4" />
            <span>Export Transcript</span>
          </button>
        </div>
      </div>
    </div>
  );
}
