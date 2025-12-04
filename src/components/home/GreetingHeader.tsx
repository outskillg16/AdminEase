import { Moon, Sun, Bot } from 'lucide-react';

interface GreetingHeaderProps {
  userName: string;
  appointmentCount: number;
  currentDate: Date;
  onOpenAIAssistant?: () => void;
}

export default function GreetingHeader({ userName, appointmentCount, currentDate, onOpenAIAssistant }: GreetingHeaderProps) {
  const getTimeBasedGreeting = () => {
    const hour = currentDate.getHours();

    if (hour >= 5 && hour < 12) {
      return { greeting: 'Good Morning', icon: <Sun className="w-8 h-8 text-yellow-300" /> };
    } else if (hour >= 12 && hour < 17) {
      return { greeting: 'Good Afternoon', icon: <Sun className="w-8 h-8 text-yellow-300" /> };
    } else if (hour >= 17 && hour < 21) {
      return { greeting: 'Good Evening', icon: <Sun className="w-8 h-8 text-orange-300" /> };
    } else {
      return { greeting: 'Good Night', icon: <Moon className="w-8 h-8 text-blue-200" /> };
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: '2-digit',
      year: 'numeric',
    });
  };

  const { greeting, icon } = getTimeBasedGreeting();

  return (
    <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl shadow-lg p-6 text-white">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-2">
            {icon}
            <h1 className="text-3xl font-bold">
              {greeting}, {userName.toUpperCase()}!
            </h1>
          </div>
          <p className="text-blue-100 text-lg mb-1">{formatDate(currentDate)}</p>
          <p className="text-blue-200 flex items-center">
            <span className="inline-block w-2 h-2 bg-blue-300 rounded-full mr-2"></span>
            {appointmentCount} appointment{appointmentCount !== 1 ? 's' : ''} scheduled today
          </p>
        </div>
        {onOpenAIAssistant && (
          <div className="ml-4">
            <button
              onClick={onOpenAIAssistant}
              className="flex items-center space-x-2 px-6 py-3 bg-white text-blue-600 rounded-lg font-semibold shadow-md hover:bg-blue-50 hover:shadow-lg transition-all"
            >
              <Bot className="w-5 h-5" />
              <span>AI Assistant</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
