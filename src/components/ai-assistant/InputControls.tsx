import { useState, KeyboardEvent } from 'react';
import { Mic, MicOff, Send } from 'lucide-react';

interface InputControlsProps {
  onSendMessage: (message: string) => void;
  onVoiceInput: () => void;
  isRecording: boolean;
  isProcessing: boolean;
  transcript: string;
}

export default function InputControls({
  onSendMessage,
  onVoiceInput,
  isRecording,
  isProcessing,
  transcript
}: InputControlsProps) {
  const [inputText, setInputText] = useState('');

  const displayText = isRecording ? transcript : inputText;

  const handleSend = () => {
    const message = displayText.trim();
    if (message && !isProcessing) {
      onSendMessage(message);
      setInputText('');
    }
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInputChange = (value: string) => {
    if (!isRecording) {
      setInputText(value);
    }
  };

  return (
    <div className="flex items-end gap-3">
      <div className="flex-1 relative">
        <textarea
          value={displayText}
          onChange={(e) => handleInputChange(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={isRecording ? 'Listening...' : 'Type your message or click the microphone to speak...'}
          disabled={isProcessing || isRecording}
          className="w-full px-4 py-3 pr-12 rounded-lg border border-gray-300 focus:ring-2 focus:ring-cyan-500 focus:border-transparent resize-none disabled:bg-gray-50 disabled:text-gray-700"
          rows={1}
          style={{ minHeight: '48px', maxHeight: '120px' }}
        />
      </div>

      <button
        onClick={onVoiceInput}
        disabled={isProcessing}
        className={`p-3 rounded-lg transition-all flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed ${
          isRecording
            ? 'bg-red-500 hover:bg-red-600 animate-pulse'
            : 'bg-cyan-600 hover:bg-cyan-700'
        } text-white`}
        title={isRecording ? 'Stop recording' : 'Start voice input'}
      >
        {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
      </button>

      <button
        onClick={handleSend}
        disabled={!displayText.trim() || isProcessing}
        className="p-3 bg-cyan-600 hover:bg-cyan-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg transition-all flex-shrink-0"
        title="Send message"
      >
        <Send className="w-5 h-5" />
      </button>
    </div>
  );
}
