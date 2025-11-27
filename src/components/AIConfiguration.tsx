import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Zap,
  User,
  Settings,
  LogOut,
  Menu,
  X,
  Loader2,
  Bot,
  Edit,
  Mic,
  Clock,
} from 'lucide-react';
import { supabase } from '../lib/supabase';

interface AIConfigurationPageProps {
  user: {
    id: string;
    email: string;
    user_metadata?: {
      full_name?: string;
    };
  };
  onLogout: () => void;
}

interface AIConfig {
  id?: string;
  agentName: string;
  voiceSelection: string;
  greetingMessage: string;
  businessHoursWeekdayStart: string;
  businessHoursWeekdayEnd: string;
  businessHoursWeekendStatus: string;
}

const defaultConfig: AIConfig = {
  agentName: 'Riya',
  voiceSelection: 'female-friendly',
  greetingMessage: 'Thank you for calling "Mind Logyx". I am Riya, how can I help you?',
  businessHoursWeekdayStart: '08:00 AM',
  businessHoursWeekdayEnd: '05:00 PM',
  businessHoursWeekendStatus: 'Closed',
};

export default function AIConfigurationPage({ user, onLogout }: AIConfigurationPageProps) {
  const navigate = useNavigate();
  const [config, setConfig] = useState<AIConfig>(defaultConfig);
  const [loading, setLoading] = useState(true);
  const [isEditMode, setIsEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [activeTab, setActiveTab] = useState('AI Configuration');
  const [businessProfileId, setBusinessProfileId] = useState<string | null>(null);

  const fullName = user.user_metadata?.full_name || user.email.split('@')[0];
  const initials = fullName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  useEffect(() => {
    document.title = 'AI Configuration - AdminEase';
    loadConfiguration();
  }, []);

  const loadConfiguration = async () => {
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

      const { data: configData, error: configError } = await supabase
        .from('ai_configurations')
        .select('*')
        .eq('business_profile_id', profile.id)
        .maybeSingle();

      if (configError && configError.code !== 'PGRST116') throw configError;

      if (configData) {
        setConfig({
          id: configData.id,
          agentName: configData.agent_name || defaultConfig.agentName,
          voiceSelection: configData.voice_selection || defaultConfig.voiceSelection,
          greetingMessage: configData.greeting_message || defaultConfig.greetingMessage,
          businessHoursWeekdayStart: configData.business_hours_weekday_start || defaultConfig.businessHoursWeekdayStart,
          businessHoursWeekdayEnd: configData.business_hours_weekday_end || defaultConfig.businessHoursWeekdayEnd,
          businessHoursWeekendStatus: configData.business_hours_weekend_status || defaultConfig.businessHoursWeekendStatus,
        });
      }
    } catch (err: any) {
      console.error('Error loading configuration:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      if (!businessProfileId) {
        throw new Error('Business profile not found');
      }

      const configData = {
        user_id: user.id,
        business_profile_id: businessProfileId,
        agent_name: config.agentName,
        voice_selection: config.voiceSelection,
        greeting_message: config.greetingMessage,
        business_hours_weekday_start: config.businessHoursWeekdayStart,
        business_hours_weekday_end: config.businessHoursWeekdayEnd,
        business_hours_weekend_status: config.businessHoursWeekendStatus,
      };

      if (config.id) {
        const { error: updateError } = await supabase
          .from('ai_configurations')
          .update(configData)
          .eq('id', config.id);

        if (updateError) throw updateError;
      } else {
        const { data: newConfig, error: insertError } = await supabase
          .from('ai_configurations')
          .insert(configData)
          .select()
          .single();

        if (insertError) throw insertError;
        setConfig({ ...config, id: newConfig.id });
      }

      setIsEditMode(false);
    } catch (err: any) {
      console.error('Error saving configuration:', err);
      alert('Failed to save configuration');
    } finally {
      setSaving(false);
    }
  };

  const handleNavigate = (tab: string) => {
    setActiveTab(tab);
    if (tab === 'Dashboard') navigate('/dashboard');
    if (tab === 'Onboarding') navigate('/onboarding');
    if (tab === 'AI Configuration') navigate('/ai-configuration');
    if (tab === 'AI Assistant') navigate('/ai-assistant');
    if (tab === 'Call Management') navigate('/call-management');
    if (tab === 'Appointments') navigate('/appointments');
    if (tab === 'Documents') navigate('/documents');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-cyan-600 animate-spin mx-auto mb-4" />
          <p className="text-slate-600">Loading configuration...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
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
              {['Dashboard', 'Onboarding', 'AI Configuration', 'AI Assistant', 'Call Management', 'Appointments', 'Documents'].map((tab) => (
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
                {['Dashboard', 'Onboarding', 'AI Configuration', 'AI Assistant', 'Call Management', 'Appointments', 'Documents'].map((tab) => (
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
        {/* Page Header */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-cyan-100 rounded-lg flex items-center justify-center">
              <Bot className="w-6 h-6 text-cyan-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Configure Your AI Agent</h1>
              <p className="text-sm text-gray-600">Customize your AI assistant's voice, personality, and availability</p>
            </div>
          </div>
          {!isEditMode && (
            <button
              onClick={() => setIsEditMode(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg transition font-medium"
            >
              <Edit className="w-4 h-4" />
              <span>Edit</span>
            </button>
          )}
        </div>

        {/* Configuration Form */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-6">
          {/* AI Agent Name */}
          <div>
            <label htmlFor="agentName" className="block text-sm font-semibold text-gray-900 mb-2">
              AI Agent Name
            </label>
            <input
              type="text"
              id="agentName"
              value={config.agentName}
              onChange={(e) => setConfig({ ...config, agentName: e.target.value })}
              disabled={!isEditMode}
              className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition disabled:bg-gray-50 disabled:text-gray-500"
              placeholder="Enter AI agent name"
            />
          </div>

          {/* Voice Selection */}
          <div>
            <div className="flex items-center space-x-2 mb-3">
              <Mic className="w-5 h-5 text-gray-700" />
              <label className="block text-sm font-semibold text-gray-900">
                Voice Selection
              </label>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { value: 'female-professional', label: 'Female (Professional)' },
                { value: 'female-friendly', label: 'Female (Friendly)' },
                { value: 'male-professional', label: 'Male (Professional)' },
                { value: 'male-casual', label: 'Male (Casual)' },
              ].map((voice) => (
                <button
                  key={voice.value}
                  onClick={() => isEditMode && setConfig({ ...config, voiceSelection: voice.value })}
                  disabled={!isEditMode}
                  className={`flex items-center space-x-3 px-4 py-3 border rounded-lg transition ${
                    config.voiceSelection === voice.value
                      ? 'border-cyan-600 bg-cyan-50'
                      : 'border-gray-300 bg-white hover:border-gray-400'
                  } ${!isEditMode ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}
                >
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      config.voiceSelection === voice.value
                        ? 'border-cyan-600'
                        : 'border-gray-300'
                    }`}
                  >
                    {config.voiceSelection === voice.value && (
                      <div className="w-3 h-3 bg-cyan-600 rounded-full"></div>
                    )}
                  </div>
                  <span className={`text-sm ${config.voiceSelection === voice.value ? 'text-cyan-900 font-medium' : 'text-gray-700'}`}>
                    {voice.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Greeting Message */}
          <div>
            <label htmlFor="greetingMessage" className="block text-sm font-semibold text-gray-900 mb-2">
              Greeting Message
            </label>
            <textarea
              id="greetingMessage"
              value={config.greetingMessage}
              onChange={(e) => setConfig({ ...config, greetingMessage: e.target.value })}
              disabled={!isEditMode}
              rows={4}
              className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition disabled:bg-gray-50 disabled:text-gray-500 resize-none"
              placeholder="Enter greeting message"
            />
          </div>

          {/* Business Hours */}
          <div>
            <div className="flex items-center space-x-2 mb-3">
              <Clock className="w-5 h-5 text-gray-700" />
              <label className="block text-sm font-semibold text-gray-900">
                Business Hours
              </label>
            </div>

            <div className="space-y-4">
              {/* Weekday Hours */}
              <div className="flex items-center space-x-4">
                <label className="text-sm text-gray-700 w-24 flex-shrink-0">Mon-Fri:</label>
                <input
                  type="text"
                  value={config.businessHoursWeekdayStart}
                  onChange={(e) => setConfig({ ...config, businessHoursWeekdayStart: e.target.value })}
                  disabled={!isEditMode}
                  className="flex-1 px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition disabled:bg-gray-50 disabled:text-gray-500"
                  placeholder="08:00 AM"
                />
                <span className="text-gray-600">to</span>
                <input
                  type="text"
                  value={config.businessHoursWeekdayEnd}
                  onChange={(e) => setConfig({ ...config, businessHoursWeekdayEnd: e.target.value })}
                  disabled={!isEditMode}
                  className="flex-1 px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition disabled:bg-gray-50 disabled:text-gray-500"
                  placeholder="05:00 PM"
                />
              </div>

              {/* Weekend Status */}
              <div className="flex items-center space-x-4">
                <label className="text-sm text-gray-700 w-24 flex-shrink-0">Weekends:</label>
                <select
                  value={config.businessHoursWeekendStatus}
                  onChange={(e) => setConfig({ ...config, businessHoursWeekendStatus: e.target.value })}
                  disabled={!isEditMode}
                  className="flex-1 px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition disabled:bg-gray-50 disabled:text-gray-500"
                >
                  <option value="Closed">Closed</option>
                  <option value="Open">Open</option>
                  <option value="By Appointment">By Appointment</option>
                </select>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          {isEditMode && (
            <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
              <button
                onClick={() => {
                  setIsEditMode(false);
                  loadConfiguration();
                }}
                className="px-6 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-6 py-2.5 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg transition font-medium flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <span>Save Changes</span>
                )}
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
