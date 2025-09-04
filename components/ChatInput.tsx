
import React, { useState, useRef } from 'react';
import { SendIcon, MicIcon } from '../constants';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  onVoiceInput: () => void;
  onEmergency: () => void;
  isLoading: boolean;
  isListening: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, onVoiceInput, onEmergency, isLoading, isListening }) => {
  const [inputValue, setInputValue] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);
    if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
        textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  const handleSend = () => {
    if (inputValue.trim() && !isLoading) {
      onSendMessage(inputValue);
      setInputValue('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md p-2 sm:p-4 shadow-[0_-2px_10px_rgba(0,0,0,0.05)] dark:shadow-[0_-2px_10px_rgba(0,0,0,0.2)] flex items-end gap-2 sm:gap-3">
       <button
        onClick={onEmergency}
        className="px-3 sm:px-4 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 disabled:bg-red-400 disabled:cursor-not-allowed transition-all hover:scale-105 active:scale-100 font-semibold text-sm sm:text-base flex-shrink-0 shadow-md"
        disabled={isLoading}
        aria-label="Emergency help"
      >
        <span className="hidden sm:inline">EMERGENCY</span>
        <span className="sm:hidden">SOS</span>
      </button>
      <div className="flex-1 relative flex items-center">
        <textarea
            ref={textareaRef}
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Type your message..."
            className="w-full p-3 pl-10 sm:pl-12 border-0 bg-slate-100 dark:bg-gray-700 rounded-xl dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none max-h-40 transition-shadow text-base"
            rows={1}
            disabled={isLoading || isListening}
        />
        <button
            onClick={onVoiceInput}
            className={`absolute left-2 sm:left-3 transition-colors ${
            isListening
                ? 'text-red-500 animate-pulse'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
            }`}
            disabled={isLoading}
            aria-label="Use microphone"
        >
            <MicIcon className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>
      </div>
      <button
        onClick={handleSend}
        className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-full hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-105 active:scale-100 shadow-lg"
        disabled={isLoading || !inputValue.trim()}
        aria-label="Send message"
      >
        <SendIcon className="w-5 h-5 sm:w-6 sm:h-6" />
      </button>
    </div>
  );
};

export default ChatInput;
