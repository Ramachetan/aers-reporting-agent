
import React from 'react';
import type { Message } from '../types';
import { BotIcon, UserIcon, AlertTriangleIcon } from './Icons';

interface ChatMessageProps {
  message: Message;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isAI = message.sender === 'ai';
  const isError = isAI && message.text.startsWith("I'm sorry, I seem to be having trouble");

  const avatarClass = isAI
    ? isError
      ? 'bg-red-200 text-red-700'
      : 'bg-primary-light text-primary'
    : 'bg-border-medium text-text';
  
  const bubbleClass = isAI
    ? isError
      ? 'bg-red-50 text-red-800 rounded-tl-none border border-red-200'
      : 'bg-surface text-text rounded-tl-none border border-border'
    : 'bg-primary text-white rounded-br-none';

  return (
    <div className={`flex items-start gap-3 ${isAI ? 'justify-start' : 'flex-row-reverse'}`}>
      <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${avatarClass}`}>
          {isAI ? (isError ? <AlertTriangleIcon /> : <BotIcon />) : <UserIcon />}
      </div>
      <div
        className={`max-w-md lg:max-w-lg px-4 py-3 rounded-2xl shadow-sm ${bubbleClass}`}
      >
        <p className="text-base">{message.text}</p>
      </div>
    </div>
  );
};

export default ChatMessage;
