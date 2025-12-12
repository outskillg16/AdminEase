import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Zap, Calendar, Phone, MessageSquare, FileText, Users,
  CheckCircle, TrendingUp, Clock, Bot, X, Play, Pause
} from 'lucide-react';

interface AnimatedDemoPresentationProps {
  onClose: () => void;
  isPlaying: boolean;
  onPlayPause: () => void;
}

export default function AnimatedDemoPresentation({
  onClose,
  isPlaying,
  onPlayPause
}: AnimatedDemoPresentationProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const slideDuration = 10000;

  const slides = [
    {
      id: 0,
      duration: 10000,
      component: <IntroSlide />
    },
    {
      id: 1,
      duration: 12000,
      component: <ProblemSlide />
    },
    {
      id: 2,
      duration: 12000,
      component: <DashboardSlide />
    },
    {
      id: 3,
      duration: 13000,
      component: <AIAssistantSlide />
    },
    {
      id: 4,
      duration: 12000,
      component: <AppointmentSlide />
    },
    {
      id: 5,
      duration: 11000,
      component: <AutomationSlide />
    },
    {
      id: 6,
      duration: 12000,
      component: <ManagementSlide />
    },
    {
      id: 7,
      duration: 10000,
      component: <CTASlide />
    }
  ];

  useEffect(() => {
    if (!isPlaying) return;

    const timer = setTimeout(() => {
      if (currentSlide < slides.length - 1) {
        setCurrentSlide(currentSlide + 1);
      } else {
        setCurrentSlide(0);
      }
    }, slides[currentSlide].duration);

    return () => clearTimeout(timer);
  }, [currentSlide, isPlaying, slides]);

  const progress = ((currentSlide + 1) / slides.length) * 100;

  return (
    <div className="relative w-full h-full bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      <div className="absolute top-0 left-0 w-full h-1 bg-gray-800">
        <motion.div
          className="h-full bg-blue-500"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentSlide}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.05 }}
          transition={{ duration: 0.5 }}
          className="w-full h-full"
        >
          {slides[currentSlide].component}
        </motion.div>
      </AnimatePresence>

      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex items-center space-x-4 z-10">
        <button
          onClick={onPlayPause}
          className="p-3 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition"
        >
          {isPlaying ? <Pause className="text-white" size={24} /> : <Play className="text-white" size={24} />}
        </button>
        <div className="flex space-x-2">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-2 h-2 rounded-full transition ${
                index === currentSlide ? 'bg-white w-8' : 'bg-white/50'
              }`}
            />
          ))}
        </div>
      </div>

      <div className="absolute top-4 right-4 z-10">
        <button
          onClick={onClose}
          className="p-2 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition"
        >
          <X className="text-white" size={24} />
        </button>
      </div>
    </div>
  );
}

function IntroSlide() {
  return (
    <div className="flex flex-col items-center justify-center h-full px-8 text-center">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.8, type: 'spring' }}
      >
        <Zap className="w-32 h-32 text-blue-400 mb-8" />
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-6xl font-bold text-white mb-6"
      >
        AdminEase
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="text-3xl text-blue-200 max-w-4xl"
      >
        Automate mundane admin work. Focus on your passion!
      </motion.p>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="mt-12 text-blue-300 text-xl"
      >
        AI-powered automation for small businesses
      </motion.div>
    </div>
  );
}

function ProblemSlide() {
  const problems = [
    { icon: Phone, text: 'Missing 20-30% of calls while with customers', color: 'text-red-400' },
    { icon: Clock, text: '60-70% of callers won\'t leave voicemail', color: 'text-orange-400' },
    { icon: TrendingUp, text: 'Lost revenue to competitors', color: 'text-red-400' }
  ];

  return (
    <div className="flex flex-col items-center justify-center h-full px-8 text-center">
      <motion.h2
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-5xl font-bold text-white mb-4"
      >
        Missing Calls = Missing Revenue
      </motion.h2>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-2xl text-blue-200 mb-12"
      >
        Small business owners lose thousands monthly
      </motion.p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl">
        {problems.map((problem, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 + index * 0.2 }}
            className="bg-white/10 backdrop-blur-md p-8 rounded-2xl"
          >
            <problem.icon className={`w-16 h-16 ${problem.color} mx-auto mb-4`} />
            <p className="text-white text-lg">{problem.text}</p>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1.5 }}
        className="mt-12 text-3xl font-bold text-red-400"
      >
        $3,500 - $13,000 lost per month
      </motion.div>
    </div>
  );
}

function DashboardSlide() {
  return (
    <div className="flex flex-col items-center justify-center h-full px-8">
      <motion.h2
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-5xl font-bold text-white mb-8 text-center"
      >
        Your Command Center
      </motion.h2>

      <div className="grid grid-cols-2 gap-8 max-w-5xl">
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-br from-blue-500 to-blue-700 p-8 rounded-2xl"
        >
          <Calendar className="w-12 h-12 text-white mb-4" />
          <h3 className="text-2xl font-bold text-white mb-2">Weekly Overview</h3>
          <p className="text-blue-100">See all appointments at a glance</p>
          <div className="mt-6 space-y-2">
            <div className="flex justify-between text-white">
              <span>Total</span>
              <span className="font-bold text-3xl">14</span>
            </div>
            <div className="flex justify-between text-green-300">
              <span>Completed</span>
              <span className="font-bold">6</span>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-gradient-to-br from-emerald-500 to-emerald-700 p-8 rounded-2xl"
        >
          <CheckCircle className="w-12 h-12 text-white mb-4" />
          <h3 className="text-2xl font-bold text-white mb-2">Today's Schedule</h3>
          <p className="text-emerald-100">8 appointments scheduled</p>
          <div className="mt-6 space-y-3">
            <div className="bg-white/20 p-3 rounded-lg">
              <p className="text-white font-semibold">Raj Mohan - Nail Trim</p>
              <p className="text-emerald-100 text-sm">9:00 AM</p>
            </div>
            <div className="bg-white/20 p-3 rounded-lg">
              <p className="text-white font-semibold">Lisa Jackson - Bath</p>
              <p className="text-emerald-100 text-sm">10:30 AM</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-gradient-to-br from-purple-500 to-purple-700 p-8 rounded-2xl"
        >
          <TrendingUp className="w-12 h-12 text-white mb-4" />
          <h3 className="text-2xl font-bold text-white mb-2">Recent Activity</h3>
          <p className="text-purple-100">AI Chat Sessions logged</p>
          <div className="mt-4">
            <p className="text-white text-sm">Setup meeting with Lisa for 12/23/2025</p>
            <p className="text-purple-200 text-xs mt-1">23 hours ago</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="bg-gradient-to-br from-cyan-500 to-cyan-700 p-8 rounded-2xl"
        >
          <Bot className="w-12 h-12 text-white mb-4" />
          <h3 className="text-2xl font-bold text-white mb-2">AI Assistant</h3>
          <p className="text-cyan-100">Always ready to help</p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="mt-4 bg-white text-cyan-700 px-6 py-3 rounded-lg font-semibold"
          >
            Open Assistant
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
}

function AIAssistantSlide() {
  const [messages, setMessages] = useState<Array<{ text: string; isAI: boolean }>>([]);

  useEffect(() => {
    const messageSequence = [
      { text: "Hi! I'd like to book a grooming appointment for my dog.", isAI: false, delay: 500 },
      { text: "I'd be happy to help! What type of grooming service would you like?", isAI: true, delay: 1500 },
      { text: "Bath and brush, please. Do you have anything available this Friday?", isAI: false, delay: 3000 },
      { text: "Let me check... Yes! I have slots at 10:00 AM and 2:00 PM available.", isAI: true, delay: 4500 },
      { text: "Perfect! I'll take the 10:00 AM slot.", isAI: false, delay: 6000 },
      { text: "Great! I've scheduled your appointment for Friday at 10:00 AM. You'll receive a confirmation email shortly.", isAI: true, delay: 7500 }
    ];

    messageSequence.forEach(({ text, isAI, delay }) => {
      setTimeout(() => {
        setMessages(prev => [...prev, { text, isAI }]);
      }, delay);
    });
  }, []);

  return (
    <div className="flex flex-col items-center justify-center h-full px-8">
      <motion.h2
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-5xl font-bold text-white mb-4 text-center"
      >
        AI Assistant in Action
      </motion.h2>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-2xl text-blue-200 mb-8 text-center"
      >
        24/7 Intelligent Customer Service
      </motion.p>

      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 max-w-4xl w-full">
        <div className="flex items-center space-x-3 mb-6 pb-4 border-b border-white/20">
          <MessageSquare className="text-cyan-400 w-8 h-8" />
          <div>
            <h3 className="text-white font-semibold text-lg">AI Assistant Chat</h3>
            <p className="text-blue-200 text-sm">Booking an appointment...</p>
          </div>
        </div>

        <div className="space-y-4 h-80 overflow-y-auto">
          {messages.map((message, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: message.isAI ? -20 : 20 }}
              animate={{ opacity: 1, x: 0 }}
              className={`flex ${message.isAI ? 'justify-start' : 'justify-end'}`}
            >
              <div
                className={`max-w-md px-6 py-4 rounded-2xl ${
                  message.isAI
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white'
                    : 'bg-white/20 text-white'
                }`}
              >
                {message.text}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 8 }}
        className="mt-8 flex items-center space-x-8"
      >
        <div className="text-center">
          <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-2" />
          <p className="text-white font-semibold">70-90% Calls Captured</p>
        </div>
        <div className="text-center">
          <Clock className="w-12 h-12 text-blue-400 mx-auto mb-2" />
          <p className="text-white font-semibold">24/7 Availability</p>
        </div>
        <div className="text-center">
          <Bot className="w-12 h-12 text-purple-400 mx-auto mb-2" />
          <p className="text-white font-semibold">Natural Conversations</p>
        </div>
      </motion.div>
    </div>
  );
}

function AppointmentSlide() {
  return (
    <div className="flex flex-col items-center justify-center h-full px-8">
      <motion.h2
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-5xl font-bold text-white mb-8 text-center"
      >
        Smart Appointment Management
      </motion.h2>

      <div className="grid grid-cols-4 gap-6 mb-8 max-w-6xl w-full">
        {[
          { label: 'Scheduled This Month', value: '13', color: 'from-blue-500 to-blue-600', icon: Calendar },
          { label: 'Rescheduled', value: '7', color: 'from-orange-500 to-orange-600', icon: Clock },
          { label: 'Cancelled', value: '3', color: 'from-red-500 to-red-600', icon: X },
          { label: 'Voice Agent Bookings', value: '17', color: 'from-purple-500 to-purple-600', icon: Phone }
        ].map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + index * 0.15 }}
            className={`bg-gradient-to-br ${stat.color} p-6 rounded-2xl text-center`}
          >
            <stat.icon className="w-10 h-10 text-white mx-auto mb-3" />
            <div className="text-4xl font-bold text-white mb-2">{stat.value}</div>
            <div className="text-white/90 text-sm">{stat.label}</div>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.8 }}
        className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 max-w-6xl w-full"
      >
        <h3 className="text-2xl font-bold text-white mb-6">Upcoming Appointments</h3>
        <div className="space-y-4">
          {[
            { name: 'Raj Mohan', service: 'Nail Trim', time: 'Dec 12, 2025 - 04:00 AM', status: 'Rescheduled' },
            { name: 'Lisa Jackson', service: 'Bath And Brush', time: 'Dec 17, 2025 - 03:30 PM', status: 'Scheduled' },
            { name: 'Lisa Jackson', service: 'Bath And Brush', time: 'Dec 21, 2025 - 03:30 PM', status: 'Scheduled' }
          ].map((apt, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1 + index * 0.2 }}
              className="flex items-center justify-between bg-white/5 p-5 rounded-xl hover:bg-white/10 transition"
            >
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                  {apt.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <p className="text-white font-semibold">{apt.name}</p>
                  <p className="text-blue-200 text-sm">{apt.service}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-white text-sm">{apt.time}</p>
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold mt-1 ${
                  apt.status === 'Scheduled' ? 'bg-blue-500/30 text-blue-200' : 'bg-purple-500/30 text-purple-200'
                }`}>
                  {apt.status}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

function AutomationSlide() {
  return (
    <div className="flex flex-col items-center justify-center h-full px-8">
      <motion.h2
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-5xl font-bold text-white mb-4 text-center"
      >
        Automated Reminders & Notifications
      </motion.h2>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-2xl text-blue-200 mb-12 text-center"
      >
        Reduce no-shows by 50%+
      </motion.p>

      <div className="grid grid-cols-3 gap-8 max-w-6xl">
        {[
          {
            icon: '📧',
            title: 'Email Reminders',
            description: 'Automated 24hr and 2hr reminders',
            color: 'from-blue-500 to-blue-600'
          },
          {
            icon: '📱',
            title: 'SMS Notifications',
            description: 'Text message confirmations',
            color: 'from-green-500 to-green-600'
          },
          {
            icon: '📞',
            title: 'Voice Calls',
            description: 'AI voice appointment reminders',
            color: 'from-purple-500 to-purple-600'
          }
        ].map((feature, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 50, rotate: -5 }}
            animate={{ opacity: 1, y: 0, rotate: 0 }}
            transition={{ delay: 0.5 + index * 0.2, type: 'spring' }}
            className={`bg-gradient-to-br ${feature.color} p-8 rounded-2xl text-center shadow-2xl`}
          >
            <div className="text-6xl mb-4">{feature.icon}</div>
            <h3 className="text-2xl font-bold text-white mb-3">{feature.title}</h3>
            <p className="text-white/90">{feature.description}</p>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1.5 }}
        className="mt-12 bg-gradient-to-r from-green-500 to-emerald-600 px-12 py-6 rounded-2xl"
      >
        <div className="text-center">
          <p className="text-white text-lg mb-2">Average No-Show Reduction</p>
          <p className="text-6xl font-bold text-white">50%+</p>
          <p className="text-green-100 mt-2">Save $500-$2,000/month</p>
        </div>
      </motion.div>
    </div>
  );
}

function ManagementSlide() {
  return (
    <div className="flex flex-col items-center justify-center h-full px-8">
      <motion.h2
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-5xl font-bold text-white mb-12 text-center"
      >
        Complete Business Management
      </motion.h2>

      <div className="grid grid-cols-2 gap-8 max-w-5xl">
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-br from-cyan-500 to-blue-600 p-8 rounded-2xl"
        >
          <Users className="w-16 h-16 text-white mb-4" />
          <h3 className="text-3xl font-bold text-white mb-3">Customer Management</h3>
          <ul className="space-y-3 text-white/90">
            <li className="flex items-center space-x-2">
              <CheckCircle size={20} />
              <span>Track customer history</span>
            </li>
            <li className="flex items-center space-x-2">
              <CheckCircle size={20} />
              <span>Pet profiles & preferences</span>
            </li>
            <li className="flex items-center space-x-2">
              <CheckCircle size={20} />
              <span>Contact management</span>
            </li>
            <li className="flex items-center space-x-2">
              <CheckCircle size={20} />
              <span>Quick search & filter</span>
            </li>
          </ul>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-gradient-to-br from-purple-500 to-pink-600 p-8 rounded-2xl"
        >
          <FileText className="w-16 h-16 text-white mb-4" />
          <h3 className="text-3xl font-bold text-white mb-3">Document Organization</h3>
          <ul className="space-y-3 text-white/90">
            <li className="flex items-center space-x-2">
              <CheckCircle size={20} />
              <span>AI-powered search</span>
            </li>
            <li className="flex items-center space-x-2">
              <CheckCircle size={20} />
              <span>Auto-categorization</span>
            </li>
            <li className="flex items-center space-x-2">
              <CheckCircle size={20} />
              <span>Tax-ready filing</span>
            </li>
            <li className="flex items-center space-x-2">
              <CheckCircle size={20} />
              <span>Find receipts in seconds</span>
            </li>
          </ul>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-gradient-to-br from-orange-500 to-red-600 p-8 rounded-2xl"
        >
          <Phone className="w-16 h-16 text-white mb-4" />
          <h3 className="text-3xl font-bold text-white mb-3">Call Analytics</h3>
          <ul className="space-y-3 text-white/90">
            <li className="flex items-center space-x-2">
              <CheckCircle size={20} />
              <span>Track all calls</span>
            </li>
            <li className="flex items-center space-x-2">
              <CheckCircle size={20} />
              <span>Call recordings</span>
            </li>
            <li className="flex items-center space-x-2">
              <CheckCircle size={20} />
              <span>Response analytics</span>
            </li>
            <li className="flex items-center space-x-2">
              <CheckCircle size={20} />
              <span>Performance insights</span>
            </li>
          </ul>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="bg-gradient-to-br from-emerald-500 to-teal-600 p-8 rounded-2xl"
        >
          <Calendar className="w-16 h-16 text-white mb-4" />
          <h3 className="text-3xl font-bold text-white mb-3">Calendar Sync</h3>
          <ul className="space-y-3 text-white/90">
            <li className="flex items-center space-x-2">
              <CheckCircle size={20} />
              <span>Google Calendar integration</span>
            </li>
            <li className="flex items-center space-x-2">
              <CheckCircle size={20} />
              <span>Real-time availability</span>
            </li>
            <li className="flex items-center space-x-2">
              <CheckCircle size={20} />
              <span>Automatic sync</span>
            </li>
            <li className="flex items-center space-x-2">
              <CheckCircle size={20} />
              <span>Multi-device access</span>
            </li>
          </ul>
        </motion.div>
      </div>
    </div>
  );
}

function CTASlide() {
  return (
    <div className="flex flex-col items-center justify-center h-full px-8 text-center">
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6, type: 'spring' }}
        className="mb-8"
      >
        <Zap className="w-32 h-32 text-blue-400 mx-auto" />
      </motion.div>

      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-6xl font-bold text-white mb-6"
      >
        Ready to Get Your Time Back?
      </motion.h2>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="text-3xl text-blue-200 mb-12"
      >
        Join 50+ small businesses saving 15-20 hours weekly
      </motion.p>

      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.7 }}
        className="grid grid-cols-3 gap-8 mb-12 max-w-4xl"
      >
        <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-6 rounded-2xl">
          <p className="text-4xl font-bold text-white mb-2">$199</p>
          <p className="text-white/90">per month</p>
        </div>
        <div className="bg-gradient-to-br from-blue-500 to-cyan-600 p-6 rounded-2xl">
          <p className="text-4xl font-bold text-white mb-2">15 min</p>
          <p className="text-white/90">setup time</p>
        </div>
        <div className="bg-gradient-to-br from-purple-500 to-pink-600 p-6 rounded-2xl">
          <p className="text-4xl font-bold text-white mb-2">24/7</p>
          <p className="text-white/90">coverage</p>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1 }}
        className="space-y-4"
      >
        <div className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-500">
          Boost revenue by $3,500-$13,000/month
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="text-2xl text-white"
        >
          Start your free trial today
        </motion.div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 2 }}
        className="mt-12 flex space-x-4"
      >
        <CheckCircle className="text-green-400" size={24} />
        <span className="text-white">Setup in 15 minutes</span>
        <span className="text-blue-300">•</span>
        <CheckCircle className="text-green-400" size={24} />
        <span className="text-white">Cancel anytime</span>
      </motion.div>
    </div>
  );
}
