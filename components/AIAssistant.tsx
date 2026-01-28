
import React, { useState } from 'react';
import { processNaturalLanguage } from '../services/gemini';
import { Icons } from '../constants';

interface AIAssistantProps {
  onProcess: (entries: any[]) => void;
}

const AIAssistant: React.FC<AIAssistantProps> = ({ onProcess }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    setIsLoading(true);
    try {
      const results = await processNaturalLanguage(input);
      onProcess(results);
      setInput('');
      setIsOpen(false);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="fixed bottom-6 right-6 z-50">
        {!isOpen ? (
          <button 
            onClick={() => setIsOpen(true)}
            className="w-14 h-14 bg-indigo-600 text-white rounded-full shadow-lg hover:shadow-indigo-500/40 flex items-center justify-center transition-all hover:scale-110 active:scale-95"
          >
            {Icons.AI}
          </button>
        ) : (
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-80 sm:w-96 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="p-4 bg-indigo-600 text-white flex justify-between items-center">
              <h3 className="font-bold flex items-center gap-2">
                {Icons.AI} Smart AI Entry
              </h3>
              <button onClick={() => setIsOpen(false)} className="text-white/80 hover:text-white">
                <i className="fas fa-times"></i>
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-4">
              <p className="text-xs text-slate-500 mb-3">Example: "I spent 45 on grocery and earned 1200 today"</p>
              <textarea 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your activity here..."
                className="w-full h-24 p-3 bg-slate-50 border border-slate-200 rounded-xl resize-none outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white text-sm"
              />
              <button 
                type="submit" 
                disabled={isLoading}
                className="w-full mt-3 py-2 bg-indigo-600 text-white rounded-lg font-bold text-sm shadow-md hover:bg-indigo-700 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <i className="fas fa-spinner fa-spin"></i> Processing...
                  </>
                ) : (
                  <>Process Entry</>
                )}
              </button>
            </form>
          </div>
        )}
      </div>
    </>
  );
};

export default AIAssistant;
