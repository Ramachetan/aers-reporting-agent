
import React, { useState, useRef, useEffect } from 'react';
import type { Message } from '../types';
import ChatMessage from './ChatMessage';
import { SendIcon, BotIcon, PaperclipIcon } from './Icons';

interface ChatPanelProps {
  messages: Message[];
  onSendMessage: (text: string, files?: File[]) => void;
  isLoading: boolean;
}

const TypingIndicator: React.FC = () => (
    <div className="flex items-start gap-3 justify-start">
        <div className="w-10 h-10 rounded-full bg-primary-light flex items-center justify-center flex-shrink-0">
            <BotIcon />
        </div>
        <div className="max-w-md lg:max-w-lg px-4 py-3 rounded-2xl shadow-sm bg-surface text-text rounded-tl-none border border-border">
            <div className="animate-pulse flex items-center space-x-1.5 h-[1.25rem]">
                <div className="w-2 h-2 bg-text-muted rounded-full"></div>
                <div className="w-2 h-2 bg-text-muted rounded-full" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-2 h-2 bg-text-muted rounded-full" style={{ animationDelay: '0.4s' }}></div>
            </div>
        </div>
    </div>
);

const ChatPanel: React.FC<ChatPanelProps> = ({ messages, onSendMessage, isLoading }) => {
  const [userInput, setUserInput] = useState('');
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages, isLoading]);
  
  useEffect(() => {
    if (!isLoading) {
      inputRef.current?.focus();
    }
  }, [isLoading]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = event.target.files;
    if (selectedFiles && selectedFiles.length > 0 && !isLoading) {
      // Immediately send the message with the files and current text
      onSendMessage(userInput.trim(), Array.from(selectedFiles));
      setUserInput(''); // Clear input after sending
    }
    // Reset file input to allow selecting the same file again
    if (event.target) {
        event.target.value = '';
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (userInput.trim() && !isLoading) {
      onSendMessage(userInput.trim(), []); // Send text-only message
      setUserInput('');
    }
  };

  return (
    <div className="bg-surface rounded-lg shadow-lg flex flex-col h-full">
      <div className="p-4 border-b border-border">
        <h2 className="text-xl font-semibold text-text">Conversation</h2>
      </div>
      <div ref={chatContainerRef} className="flex-grow p-6 space-y-6 overflow-y-auto">
        {messages.map((msg) => (
          <ChatMessage key={msg.id} message={msg} />
        ))}
        {isLoading && <TypingIndicator />}
      </div>
      <div className="p-4 border-t border-border bg-background/80 backdrop-blur-sm">
        <form onSubmit={handleSubmit} className="flex flex-col">
            <div className="flex items-center space-x-3">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                multiple
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={handleUploadClick}
                disabled={isLoading}
                className="flex-shrink-0 p-3 border border-border-medium rounded-full hover:bg-gray-100 disabled:opacity-50 transition-colors text-text-muted hover:text-primary"
                aria-label="Attach file"
              >
                  <PaperclipIcon />
              </button>
              <input
                ref={inputRef}
                type="text"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                placeholder="Type your message..."
                disabled={isLoading}
                className="flex-grow p-3 border border-border-medium rounded-full focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-gray-200 transition-shadow bg-white"
                autoComplete="off"
                autoFocus
              />
              <button
                type="submit"
                disabled={isLoading || !userInput.trim()}
                className="bg-primary text-white rounded-full w-12 h-12 flex items-center justify-center hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:bg-primary-light disabled:cursor-not-allowed transition-colors flex-shrink-0"
                aria-label="Send message"
              >
                <SendIcon />
              </button>
            </div>
        </form>
      </div>
    </div>
  );
};

export default ChatPanel;
