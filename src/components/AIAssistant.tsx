import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bot,
  User,
  Settings,
  LogOut,
  Menu,
  X,
  Volume2,
  VolumeX,
  Zap,
  Trash2,
  Home,
  Calendar,
  FileText,
  UserPlus,
  Phone,
  Users,
} from 'lucide-react';
import MessageList, { Message } from './ai-assistant/MessageList';
import InputControls from './ai-assistant/InputControls';
import { useVoiceRecognition } from '../hooks/useVoiceRecognition';
import { useSpeechSynthesis } from '../hooks/useSpeechSynthesis';
import { classifyIntent, sendToN8nWebhook } from '../services/WebhookService';

interface AIAssistantProps {
  user: {
    id: string;
    email: string;
    user_metadata?: {
      full_name?: string;
    };
  };
  onLogout: () => void;
}

function generateMessageId(): string {
  return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export default function AIAssistant({ user, onLogout }: AIAssistantProps) {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [activeTab, setActiveTab] = useState('AI Assistant');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { isListening, transcript, startListening, stopListening, resetTranscript, isSupported: voiceSupported } = useVoiceRecognition();
  const { speak, cancel: cancelSpeech, isSpeaking } = useSpeechSynthesis();

  const fullName = user.user_metadata?.full_name || user.email.split('@')[0];
  const initials = fullName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  useEffect(() => {
    document.title = 'AI Assistant - AdminEase';
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (!isListening && transcript.trim()) {
      handleSendMessage(transcript.trim());
      resetTranscript();
    }
  }, [isListening, transcript]);

  const handleNavigate = (tab: string) => {
    setActiveTab(tab);
    if (tab === 'Dashboard') navigate('/dashboard');
    if (tab === 'Onboarding') navigate('/onboarding');
    if (tab === 'AI Configuration') navigate('/ai-configuration');
    if (tab === 'Call Management') navigate('/call-management');
    if (tab === 'Appointments') navigate('/appointments');
    if (tab === 'Documents') navigate('/documents');
    if (tab === 'Customers') navigate('/customers');
    if (tab === 'AI Assistant') navigate('/ai-assistant');
  };

  const addMessage = (message: Message) => {
    setMessages((prev) => [...prev, message]);
  };

  const removeMessage = (id: string) => {
    setMessages((prev) => prev.filter((msg) => msg.id !== id));
  };

  const handleClearChat = () => {
    if (messages.length > 0) {
      if (window.confirm('Are you sure you want to clear all messages?')) {
        setMessages([]);
      }
    }
  };

  const formatSuccessResponse = (response: any): string => {
    if (response.data?.appointments) {
      const appointments = response.data.appointments;
      if (Array.isArray(appointments) && appointments.length > 0) {
        let formatted = `You have ${appointments.length} appointment${appointments.length > 1 ? 's' : ''}:\n\n`;
        appointments.forEach((apt: any, index: number) => {
          formatted += `${index + 1}. ${apt.time || apt.date} - ${apt.customer || apt.name} - ${apt.service || apt.type}\n`;
        });
        return formatted;
      }
      return 'You have no appointments scheduled.';
    }
    if (response.data?.confirmation) {
      return response.data.confirmation;
    }
    return response.message;
  };

  const handleSendMessage = async (userInput: string) => {
    if (!userInput.trim() || isProcessing) return;

    addMessage({
      id: generateMessageId(),
      role: 'user',
      content: userInput,
      timestamp: new Date()
    });

    setIsProcessing(true);
    const loadingId = 'loading_' + Date.now();
    addMessage({
      id: loadingId,
      role: 'system',
      content: 'Processing your request...',
      timestamp: new Date()
    });

    try {
      const intent = classifyIntent(userInput);

      const webhookResponse = await sendToN8nWebhook(intent, userInput);
      removeMessage(loadingId);

      if (webhookResponse.success) {
        const response = formatSuccessResponse(webhookResponse);
        addMessage({
          id: generateMessageId(),
          role: 'assistant',
          content: response,
          timestamp: new Date(),
          data: webhookResponse.data
        });
        if (voiceEnabled) speak(response);
      } else {
        const errorResponse = `I encountered an issue: ${webhookResponse.message}. Please try again or rephrase your request.`;
        addMessage({
          id: generateMessageId(),
          role: 'assistant',
          content: errorResponse,
          timestamp: new Date()
        });
        if (voiceEnabled) speak(errorResponse);
      }
    } catch (error) {
      removeMessage(loadingId);
      const errorMessage = "I'm sorry, I encountered an error processing your request. Please try again.";
      addMessage({
        id: generateMessageId(),
        role: 'assistant',
        content: errorMessage,
        timestamp: new Date()
      });
      if (voiceEnabled) speak(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleVoiceInput = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const toggleVoice = () => {
    if (voiceEnabled) {
      cancelSpeech();
    }
    setVoiceEnabled(!voiceEnabled);
  };

  const getTabIcon = (tab: string) => {
    const iconProps = { className: "w-5 h-5" };
    switch (tab) {
      case 'Home':
      case 'Dashboard':
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

  const menuTabs = ['Dashboard', 'Onboarding', 'AI Configuration', 'AI Assistant', 'Call Management', 'Appointments', 'Documents', 'Customers'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button
              onClick={() => navigate('/home')}
              className="flex items-center space-x-3 hover:opacity-80 transition-opacity"
            >
              <div className="w-10 h-10 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-lg flex items-center justify-center">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900 hidden sm:block">AdminEase</span>
            </button>

            <div className="flex items-center space-x-1">
              <nav className="hidden md:flex space-x-1">
                {menuTabs.map((tab) => (
                  <button
                    key={tab}
                    onClick={() => handleNavigate(tab)}
                    className={`p-2.5 rounded-lg transition-all group relative ${
                      activeTab === tab
                        ? 'bg-cyan-600 text-white'
                        : 'text-gray-700 hover:bg-gray-100'
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
              <button
                onClick={toggleVoice}
                className={`p-2 rounded-lg transition ${
                  voiceEnabled ? 'bg-cyan-100 text-cyan-600' : 'text-gray-600 hover:bg-gray-100'
                }`}
                title={voiceEnabled ? 'Disable voice responses' : 'Enable voice responses'}
              >
                {voiceEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
              </button>

              <button
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition"
              >
                {showMobileMenu ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>

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
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1 border border-gray-200">
                    <button
                      onClick={() => navigate('/onboarding')}
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2 transition"
                    >
                      <Settings className="w-4 h-4" />
                      <span>Settings</span>
                    </button>
                    <button
                      onClick={onLogout}
                      className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-gray-50 flex items-center space-x-2 transition"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {showMobileMenu && (
          <div className="md:hidden border-t border-gray-200 bg-white">
            <div className="px-4 py-2 space-y-1">
              {menuTabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => {
                    handleNavigate(tab);
                    setShowMobileMenu(false);
                  }}
                  className={`w-full text-left px-4 py-2 rounded-lg text-sm font-medium transition flex items-center gap-2 ${
                    activeTab === tab
                      ? 'bg-cyan-600 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {getTabIcon(tab)}
                  <span>{tab}</span>
                </button>
              ))}
              <button
                onClick={onLogout}
                className="w-full text-left px-4 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-gray-50"
              >
                Sign Out
              </button>
            </div>
          </div>
        )}
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col h-[calc(100vh-12rem)] bg-white rounded-lg shadow-lg">
          <div className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">AI Assistant</h2>
                <p className="text-sm text-gray-500">Always here to help</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-xs text-gray-600">Online</span>
              </div>
              <button
                onClick={handleClearChat}
                disabled={messages.length === 0}
                className="p-2 hover:bg-gray-100 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                title="Clear chat"
              >
                <Trash2 className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            <MessageList messages={messages} />
            <div ref={messagesEndRef} />
          </div>

          <div className="border-t p-4 bg-gray-50">
            {!voiceSupported && (
              <div className="mb-3 text-xs text-amber-600 bg-amber-50 px-3 py-2 rounded">
                Voice recognition is not supported in this browser. Text input is still available.
              </div>
            )}
            <InputControls
              onSendMessage={handleSendMessage}
              onVoiceInput={handleVoiceInput}
              isRecording={isListening}
              isProcessing={isProcessing}
              transcript={transcript}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
