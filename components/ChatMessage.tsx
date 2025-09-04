
import React from 'react';
import { ChatMessage, ChatRole } from '../types';
import { BotIcon, UserIcon } from '../constants';

interface ChatMessageProps {
  message: ChatMessage;
}

const ChatMessageComponent: React.FC<ChatMessageProps> = ({ message }) => {
  const isUser = message.role === ChatRole.USER;

  const wrapperClasses = `flex items-start gap-2 sm:gap-3.5 my-5 animate-fade-in ${isUser ? 'justify-end' : 'justify-start'}`;
  const bubbleClasses = `p-3 sm:p-4 max-w-2xl rounded-2xl whitespace-pre-wrap shadow-lg ${isUser ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-br-lg' : 'bg-white dark:bg-slate-700 dark:text-gray-200 rounded-bl-lg'}`;
  const iconWrapperClasses = `w-8 h-8 sm:w-10 sm:h-10 flex-shrink-0 rounded-full flex items-center justify-center ${isUser ? 'bg-blue-100 dark:bg-blue-900/50' : 'bg-indigo-100 dark:bg-indigo-900/50'}`;
  const iconClasses = `w-5 h-5 sm:w-6 sm:h-6 ${isUser ? 'text-blue-600 dark:text-blue-300' : 'text-indigo-600 dark:text-indigo-300'}`;
  
  const formattedText = message.text.split('\n').map((line, index, array) => (
    <React.Fragment key={index}>
      {line}
      {index < array.length - 1 && <br />}
    </React.Fragment>
  ));

  return (
    <div className={wrapperClasses}>
      {!isUser && (
        <div className={iconWrapperClasses}>
            <BotIcon className={iconClasses} />
        </div>
      )}
      <div className={bubbleClasses}>
        {formattedText}
      </div>
      {isUser && (
        <div className={iconWrapperClasses}>
            <UserIcon className={iconClasses} />
        </div>
      )}
    </div>
  );
};

export default ChatMessageComponent;
