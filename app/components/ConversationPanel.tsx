'use client';

import { useState, useRef, useEffect } from 'react';
import { Panel } from './panels/Panel';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

interface ConversationPanelProps {
  onSubmit: (prompt: string) => void;
  messages: Message[];
  isLoading: boolean;
}

const PRESET_PROMPTS = [
  { label: '⏱️ Pomodoro Timer', prompt: 'Create a pomodoro timer with 25 min work and 5 min break' },
  { label: '✅ Todo List', prompt: 'Build a todo list with add, complete, and delete' },
  { label: '🧮 Calculator', prompt: 'Create a simple calculator' },
  { label: '🎲 Dice Roller', prompt: 'Build a dice roller with multiple dice' },
  { label: '⏰ Stopwatch', prompt: 'Create a stopwatch with lap times' },
  { label: '🔢 Counter', prompt: 'Build a counter with increment, decrement, and reset' },
];

export function ConversationPanel({ onSubmit, messages, isLoading }: ConversationPanelProps) {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    onSubmit(input.trim());
    setInput('');
  };

  const handlePreset = (prompt: string) => {
    if (isLoading) return;
    onSubmit(prompt);
  };

  return (
    <Panel title="Conversation">
      <div className="flex flex-col h-full">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 && (
            <div className="text-center text-zinc-500 mt-4">
              <p className="text-lg font-medium mb-2">Welcome to my-way</p>
              <p className="text-sm mb-4">Describe the UI component you want to create.</p>
              
              {/* Preset buttons */}
              <div className="grid grid-cols-2 gap-2 mt-4">
                {PRESET_PROMPTS.map((preset) => (
                  <button
                    key={preset.label}
                    onClick={() => handlePreset(preset.prompt)}
                    disabled={isLoading}
                    className="px-3 py-2 text-xs bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed text-zinc-300 rounded-lg transition-colors text-left"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>
          )}
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-lg px-4 py-2 ${
                  message.role === 'user'
                    ? 'bg-cyan-600 text-white'
                    : 'bg-zinc-800 text-zinc-200'
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-zinc-800 rounded-lg px-4 py-2">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <form onSubmit={handleSubmit} className="p-4 border-t border-zinc-800">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Describe the UI you want to create..."
              disabled={isLoading}
              className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-sm text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 disabled:bg-zinc-700 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors"
            >
              Send
            </button>
          </div>
        </form>
      </div>
    </Panel>
  );
}
