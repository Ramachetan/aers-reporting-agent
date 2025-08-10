
import React, { useState, useEffect } from 'react';
import { RemoveIcon } from './Icons';

interface SuggestionModalProps {
  isOpen: boolean;
  suggestions: string[];
  onConfirm: (selection: string) => void;
  onClose: () => void;
}

const SuggestionModal: React.FC<SuggestionModalProps> = ({ isOpen, suggestions, onConfirm, onClose }) => {
  const [selectedSuggestion, setSelectedSuggestion] = useState<string>('');

  useEffect(() => {
    // Reset selection when modal is opened or suggestions change
    if (isOpen) {
      setSelectedSuggestion('');
    }
  }, [isOpen, suggestions]);

  if (!isOpen) {
    return null;
  }

  const handleConfirm = () => {
    if (selectedSuggestion) {
      onConfirm(selectedSuggestion);
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-fade-in"
      aria-labelledby="suggestion-modal-title"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-surface rounded-2xl shadow-xl w-full max-w-md m-4 transform animate-slide-up">
        <div className="p-6 border-b border-border flex items-center justify-between">
          <h2 id="suggestion-modal-title" className="text-xl font-semibold text-text">Confirm Your Symptom</h2>
          <button 
            onClick={onClose} 
            className="p-2 rounded-full hover:bg-background text-text-muted hover:text-primary transition-colors"
            aria-label="Close"
          >
            <RemoveIcon />
          </button>
        </div>
        
        <div className="p-6">
            <p className="text-text-muted mb-4">
                To ensure we have the most accurate information, please select the term that best describes what you are experiencing.
            </p>
            <fieldset className="space-y-3">
                <legend className="sr-only">Symptom Suggestions</legend>
                {suggestions.map((suggestion, index) => (
                    <label 
                        key={index} 
                        htmlFor={`suggestion-${index}`}
                        className={`flex items-center p-4 rounded-lg border-2 cursor-pointer transition-all ${selectedSuggestion === suggestion ? 'bg-primary/10 border-primary shadow-inner' : 'bg-background/50 border-border hover:border-border-medium'}`}
                    >
                        <input
                            type="radio"
                            id={`suggestion-${index}`}
                            name="suggestion"
                            value={suggestion}
                            checked={selectedSuggestion === suggestion}
                            onChange={(e) => setSelectedSuggestion(e.target.value)}
                            className="h-5 w-5 text-primary focus:ring-primary border-gray-300"
                        />
                        <span className="ml-4 font-medium text-text">{suggestion}</span>
                    </label>
                ))}
            </fieldset>
        </div>

        <div className="p-6 bg-background/50 border-t border-border rounded-b-2xl">
          <button
            onClick={handleConfirm}
            disabled={!selectedSuggestion}
            className="w-full bg-primary text-white font-bold py-3 px-8 rounded-lg hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:bg-primary-light disabled:cursor-not-allowed transition-colors text-lg shadow-md hover:shadow-lg"
          >
            Confirm Selection
          </button>
        </div>
      </div>
    </div>
  );
};

export default SuggestionModal;
