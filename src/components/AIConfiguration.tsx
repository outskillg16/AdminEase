import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Save,
  RotateCcw,
  ChevronDown,
  ChevronUp,
  Search,
  Plus,
  X,
  CheckCircle,
  FileText,
  Zap,
  User,
  Settings,
  LogOut,
  HelpCircle,
  Menu,
  Loader2,
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
  assistantName: string;
  systemPrompt: string;
  temperature: number;
  maxTokens: number;
  greetingMessage: string;
  contextWindow: number;
  responseStyle: 'professional' | 'casual' | 'concise' | 'detailed';
  enableFollowUpQuestions: boolean;
  includeTimestamps: boolean;
  topP: number;
  frequencyPenalty: number;
  presencePenalty: number;
  enableFunctionCalling: boolean;
  conversationMemory: boolean;
}

interface EmbeddedDocument {
  id: string;
  documentId: string;
  fileName: string;
  chunkCount: number;
  embeddedAt: string;
}

const defaultConfig: AIConfig = {
  assistantName: 'AI Assistant',
  systemPrompt: 'You are a helpful AI assistant.',
  temperature: 0.7,
  maxTokens: 500,
  greetingMessage: 'Hello! How can I help you today?',
  contextWindow: 10,
  responseStyle: 'professional',
  enableFollowUpQuestions: true,
  includeTimestamps: false,
  topP: 1.0,
  frequencyPenalty: 0.0,
  presencePenalty: 0.0,
  enableFunctionCalling: false,
  conversationMemory: false,
};

export default function AIConfigurationPage({ user, onLogout }: AIConfigurationPageProps) {
  const navigate = useNavigate();
  const [config, setConfig] = useState<AIConfig>(defaultConfig);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [activeTab, setActiveTab] = useState('AI Configuration');
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [embeddedDocuments, setEmbeddedDocuments] = useState<EmbeddedDocument[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [businessProfileId, setBusinessProfileId] = useState<string | null>(null);

  const fullName = user.user_metadata?.full_name || user.email.split('@')[0];
  const initials = fullName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  useEffect(() => {
    loadConfiguration();
  }, []);

  const loadConfiguration = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: profile, error: profileError } = await supabase
        .from('business_profiles')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (profileError) throw profileError;

      if (!profile) {
        setError('Please complete your business profile first');
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
          assistantName: configData.assistant_name,
          systemPrompt: configData.system_prompt,
          temperature: configData.temperature,
          maxTokens: configData.max_tokens,
          greetingMessage: configData.greeting_message,
          contextWindow: configData.context_window,
          responseStyle: configData.response_style,
          enableFollowUpQuestions: configData.enable_follow_up_questions,
          includeTimestamps: configData.include_timestamps,
          topP: configData.top_p,
          frequencyPenalty: configData.frequency_penalty,
          presencePenalty: configData.presence_penalty,
          enableFunctionCalling: configData.enable_function_calling,
          conversationMemory: configData.conversation_memory,
        });

        loadEmbeddedDocuments(configData.id);
      }
    } catch (err: any) {
      console.error('Error loading configuration:', err);
      setError(err.message || 'Failed to load configuration');
    } finally {
      setLoading(false);
    }
  };

  const loadEmbeddedDocuments = async (configId: string) => {
    try {
      const { data, error } = await supabase
        .from('document_embeddings')
        .select(`
          id,
          document_id,
          chunk_index,
          created_at,
          business_documents (
            file_name
          )
        `)
        .eq('ai_config_id', configId);

      if (error) throw error;

      const docMap = new Map<string, EmbeddedDocument>();
      data?.forEach((item: any) => {
        const docId = item.document_id;
        if (docMap.has(docId)) {
          const doc = docMap.get(docId)!;
          doc.chunkCount++;
        } else {
          docMap.set(docId, {
            id: item.id,
            documentId: docId,
            fileName: item.business_documents?.file_name || 'Unknown',
            chunkCount: 1,
            embeddedAt: item.created_at,
          });
        }
      });

      setEmbeddedDocuments(Array.from(docMap.values()));
    } catch (err) {
      console.error('Error loading embedded documents:', err);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      setSuccessMessage(null);

      if (!businessProfileId) {
        throw new Error('Business profile not found');
      }

      const configData = {
        user_id: user.id,
        business_profile_id: businessProfileId,
        assistant_name: config.assistantName,
        system_prompt: config.systemPrompt,
        temperature: config.temperature,
        max_tokens: config.maxTokens,
        greeting_message: config.greetingMessage,
        context_window: config.contextWindow,
        response_style: config.responseStyle,
        enable_follow_up_questions: config.enableFollowUpQuestions,
        include_timestamps: config.includeTimestamps,
        top_p: config.topP,
        frequency_penalty: config.frequencyPenalty,
        presence_penalty: config.presencePenalty,
        enable_function_calling: config.enableFunctionCalling,
        conversation_memory: config.conversationMemory,
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

      setSuccessMessage('Configuration saved successfully!');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      console.error('Error saving configuration:', err);
      setError(err.message || 'Failed to save configuration');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    if (confirm('Reset all settings to default values?')) {
      setConfig(defaultConfig);
    }
  };

  const handleNavigate = (tab: string) => {
    setActiveTab(tab);
    if (tab === 'Dashboard') navigate('/dashboard');
    if (tab === 'Onboarding') navigate('/onboarding');
    if (tab === 'AI Configuration') navigate('/ai-configuration');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-cyan-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-cyan-600 animate-spin mx-auto mb-4" />
          <p className="text-slate-600">Loading configuration...</p>
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
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-cyan-600 to-blue-600 p-2 rounded-lg">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
                AdminEase
              </span>
            </div>

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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">AI Configuration</h1>
          <p className="text-gray-600">Customize your AI assistant's behavior, knowledge base, and conversation settings</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-3">
            <X className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm text-red-800">{error}</p>
            </div>
            <button onClick={() => setError(null)} className="text-red-600 hover:text-red-800">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Success Message */}
        {successMessage && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-start space-x-3">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm text-green-800">{successMessage}</p>
            </div>
            <button onClick={() => setSuccessMessage(null)} className="text-green-600 hover:text-green-800">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Configuration Area */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic AI Settings */}
            <BasicSettings config={config} setConfig={setConfig} />

            {/* Conversation Settings */}
            <ConversationSettings config={config} setConfig={setConfig} />

            {/* Knowledge Base */}
            <KnowledgeBase
              embeddedDocuments={embeddedDocuments}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
            />

            {/* Advanced Settings */}
            <AdvancedSettings
              config={config}
              setConfig={setConfig}
              showAdvanced={showAdvanced}
              setShowAdvanced={setShowAdvanced}
            />

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 bg-cyan-600 hover:bg-cyan-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    <span>Save Configuration</span>
                  </>
                )}
              </button>
              <button
                onClick={handleReset}
                className="sm:w-auto bg-white border border-slate-300 text-slate-700 font-semibold py-3 px-6 rounded-lg hover:bg-slate-50 transition-colors duration-200 flex items-center justify-center space-x-2"
              >
                <RotateCcw className="w-5 h-5" />
                <span>Reset to Defaults</span>
              </button>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <HelpSidebar />
          </div>
        </div>
      </main>
    </div>
  );
}

function BasicSettings({ config, setConfig }: { config: AIConfig; setConfig: (config: AIConfig) => void }) {
  return (
    <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic AI Settings</h2>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            AI Assistant Name
          </label>
          <input
            type="text"
            value={config.assistantName}
            onChange={(e) => setConfig({ ...config, assistantName: e.target.value })}
            maxLength={50}
            placeholder="My Business Assistant"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
          />
          <p className="text-xs text-gray-500 mt-1">{config.assistantName.length}/50 characters</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Greeting Message
          </label>
          <textarea
            value={config.systemPrompt}
            onChange={(e) => setConfig({ ...config, systemPrompt: e.target.value })}
            maxLength={2000}
            rows={6}
            placeholder="Define how the AI should behave..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent font-mono text-sm"
          />
          <p className="text-xs text-gray-500 mt-1">{config.systemPrompt.length}/2000 characters</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Temperature: {config.temperature.toFixed(1)}
          </label>
          <input
            type="range"
            min="0"
            max="2"
            step="0.1"
            value={config.temperature}
            onChange={(e) => setConfig({ ...config, temperature: parseFloat(e.target.value) })}
            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer slider-cyan"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>Conservative (0.0)</span>
            <span>Balanced (0.7)</span>
            <span>Creative (2.0)</span>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Max Response Tokens
          </label>
          <input
            type="number"
            min="100"
            max="4000"
            step="100"
            value={config.maxTokens}
            onChange={(e) => setConfig({ ...config, maxTokens: parseInt(e.target.value) || 100 })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
          />
          <p className="text-xs text-gray-500 mt-1">Controls the maximum length of AI responses</p>
        </div>
      </div>
    </div>
  );
}

function ConversationSettings({ config, setConfig }: { config: AIConfig; setConfig: (config: AIConfig) => void }) {
  const styles: Array<'professional' | 'casual' | 'concise' | 'detailed'> = ['professional', 'casual', 'concise', 'detailed'];

  return (
    <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Conversation Settings</h2>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Greeting Message
          </label>
          <input
            type="text"
            value={config.greetingMessage}
            onChange={(e) => setConfig({ ...config, greetingMessage: e.target.value })}
            maxLength={200}
            placeholder="Hello! How can I help you today?"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Context Window
          </label>
          <select
            value={config.contextWindow}
            onChange={(e) => setConfig({ ...config, contextWindow: parseInt(e.target.value) })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
          >
            <option value={5}>Last 5 messages</option>
            <option value={10}>Last 10 messages</option>
            <option value={15}>Last 15 messages</option>
            <option value={20}>Last 20 messages</option>
          </select>
          <p className="text-xs text-gray-500 mt-1">How many previous messages the AI remembers</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Response Style
          </label>
          <div className="grid grid-cols-2 gap-2">
            {styles.map((style) => (
              <button
                key={style}
                onClick={() => setConfig({ ...config, responseStyle: style })}
                className={`px-4 py-2 rounded-lg border-2 transition-all duration-200 ${
                  config.responseStyle === style
                    ? 'border-cyan-600 bg-cyan-50 text-cyan-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <span className="capitalize font-medium">{style}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <label className="text-sm font-medium text-gray-700">Enable Follow-up Questions</label>
            <p className="text-xs text-gray-500">AI can ask clarifying questions</p>
          </div>
          <button
            onClick={() => setConfig({ ...config, enableFollowUpQuestions: !config.enableFollowUpQuestions })}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              config.enableFollowUpQuestions ? 'bg-cyan-600' : 'bg-slate-200'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                config.enableFollowUpQuestions ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <label className="text-sm font-medium text-gray-700">Include Timestamps</label>
            <p className="text-xs text-gray-500">Add temporal awareness to conversations</p>
          </div>
          <button
            onClick={() => setConfig({ ...config, includeTimestamps: !config.includeTimestamps })}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              config.includeTimestamps ? 'bg-cyan-600' : 'bg-slate-200'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                config.includeTimestamps ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>
    </div>
  );
}

function KnowledgeBase({
  embeddedDocuments,
  searchQuery,
  setSearchQuery,
}: {
  embeddedDocuments: EmbeddedDocument[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}) {
  return (
    <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Knowledge Base Configuration</h2>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Search Documents
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search documents..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">Search your documents to add to AI context (minimum 3 characters)</p>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-gray-700">
              Embedded Documents
            </label>
            <span className="text-xs text-gray-500">{embeddedDocuments.length}/50 documents</span>
          </div>

          {embeddedDocuments.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <FileText className="w-12 h-12 mx-auto mb-2 text-gray-300" />
              <p className="text-sm">No documents embedded yet</p>
              <p className="text-xs">Search and add documents to enable AI knowledge</p>
            </div>
          ) : (
            <div className="space-y-2">
              {embeddedDocuments.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{doc.fileName}</p>
                      <p className="text-xs text-gray-500">{doc.chunkCount} chunks</p>
                    </div>
                  </div>
                  <button className="text-red-600 hover:text-red-700 transition">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function AdvancedSettings({
  config,
  setConfig,
  showAdvanced,
  setShowAdvanced,
}: {
  config: AIConfig;
  setConfig: (config: AIConfig) => void;
  showAdvanced: boolean;
  setShowAdvanced: (show: boolean) => void;
}) {
  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-100">
      <button
        onClick={() => setShowAdvanced(!showAdvanced)}
        className="w-full p-6 flex items-center justify-between hover:bg-gray-50 transition-colors duration-200"
      >
        <h2 className="text-lg font-semibold text-gray-900">Advanced Settings</h2>
        {showAdvanced ? (
          <ChevronUp className="w-5 h-5 text-gray-500" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-500" />
        )}
      </button>

      {showAdvanced && (
        <div className="px-6 pb-6 space-y-4 border-t border-gray-100 pt-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Top-P (Nucleus Sampling): {config.topP.toFixed(2)}
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={config.topP}
              onChange={(e) => setConfig({ ...config, topP: parseFloat(e.target.value) })}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer slider-cyan"
            />
            <p className="text-xs text-gray-500 mt-1">Controls diversity via nucleus sampling</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Frequency Penalty: {config.frequencyPenalty.toFixed(1)}
            </label>
            <input
              type="range"
              min="-2"
              max="2"
              step="0.1"
              value={config.frequencyPenalty}
              onChange={(e) => setConfig({ ...config, frequencyPenalty: parseFloat(e.target.value) })}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer slider-cyan"
            />
            <p className="text-xs text-gray-500 mt-1">Reduces repetition of frequent tokens</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Presence Penalty: {config.presencePenalty.toFixed(1)}
            </label>
            <input
              type="range"
              min="-2"
              max="2"
              step="0.1"
              value={config.presencePenalty}
              onChange={(e) => setConfig({ ...config, presencePenalty: parseFloat(e.target.value) })}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer slider-cyan"
            />
            <p className="text-xs text-gray-500 mt-1">Encourages talking about new topics</p>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700">Enable Function Calling</label>
              <p className="text-xs text-gray-500">Allow AI to use external functions</p>
            </div>
            <button
              onClick={() => setConfig({ ...config, enableFunctionCalling: !config.enableFunctionCalling })}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                config.enableFunctionCalling ? 'bg-cyan-600' : 'bg-slate-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  config.enableFunctionCalling ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700">Conversation Memory</label>
              <p className="text-xs text-gray-500">Persist conversations across sessions</p>
            </div>
            <button
              onClick={() => setConfig({ ...config, conversationMemory: !config.conversationMemory })}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                config.conversationMemory ? 'bg-cyan-600' : 'bg-slate-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  config.conversationMemory ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function HelpSidebar() {
  return (
    <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100 sticky top-24">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
        <HelpCircle className="w-5 h-5 text-cyan-600" />
        <span>Quick Help</span>
      </h3>

      <div className="space-y-4">
        <div>
          <h4 className="text-sm font-semibold text-gray-900 mb-1">Temperature</h4>
          <p className="text-xs text-gray-600">
            Lower values (0.0-0.5) make responses more focused and deterministic. Higher values (1.0-2.0) increase creativity and variety.
          </p>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-gray-900 mb-1">System Prompt</h4>
          <p className="text-xs text-gray-600">
            Define your AI's role, personality, and guidelines. Be specific about how it should respond to customers.
          </p>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-gray-900 mb-1">Context Window</h4>
          <p className="text-xs text-gray-600">
            Larger windows remember more conversation history but may slow responses. Start with 10 messages.
          </p>
        </div>

        <div className="pt-4 border-t border-gray-200">
          <a
            href="#"
            className="text-sm text-cyan-600 hover:text-cyan-700 font-medium flex items-center space-x-1"
          >
            <span>View full documentation</span>
            <ChevronDown className="w-4 h-4 rotate-[-90deg]" />
          </a>
        </div>
      </div>
    </div>
  );
}
