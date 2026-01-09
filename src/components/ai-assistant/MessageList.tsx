import { Bot, User, Loader2 } from 'lucide-react';
import Markdown from 'react-markdown';

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  data?: any;
}

interface MessageListProps {
  messages: Message[];
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
}

export default function MessageList({ messages }: MessageListProps) {
  if (messages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center px-4">
        <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center mb-4">
          <Bot className="w-8 h-8 text-white" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Welcome to AI Assistant
        </h3>
        <p className="text-sm text-gray-600 max-w-md mb-4">
          I can help you manage your schedule, book appointments, and block time. Try asking:
        </p>
        <div className="space-y-2 text-sm text-left bg-gray-50 rounded-lg p-4 max-w-md">
          <p className="text-gray-700">• "What's my schedule today?"</p>
          <p className="text-gray-700">• "Block out next Friday for vacation"</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {messages.map((message) => {
        if (message.role === 'system') {
          return (
            <div key={message.id} className="flex justify-center">
              <div className="bg-cyan-50 text-cyan-700 rounded-lg px-4 py-2 text-sm flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                {message.content}
              </div>
            </div>
          );
        }

        if (message.role === 'user') {
          return (
            <div key={message.id} className="flex justify-end">
              <div className="max-w-[70%]">
                <div className="flex items-end justify-end gap-2 mb-1">
                  <span className="text-xs text-gray-500">{formatTime(message.timestamp)}</span>
                  <div className="w-6 h-6 bg-gray-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <User className="w-4 h-4 text-white" />
                  </div>
                </div>
                <div className="bg-cyan-600 text-white rounded-lg px-4 py-2">
                  <div className="prose prose-invert prose-sm max-w-none">
                    <Markdown>{message.content}</Markdown>
                  </div>
                </div>
              </div>
            </div>
          );
        }

        return (
          <div key={message.id} className="flex justify-start">
            <div className="max-w-[70%]">
              <div className="flex items-end gap-2 mb-1">
                <div className="w-6 h-6 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <span className="text-xs text-gray-500">{formatTime(message.timestamp)}</span>
              </div>
              <div className="bg-gray-100 text-gray-900 rounded-lg px-4 py-2">
                <div className="prose prose-sm max-w-none">
                  <Markdown>{message.content}</Markdown>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
