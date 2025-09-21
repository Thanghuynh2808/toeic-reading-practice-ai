import React, { useEffect, useRef } from 'react';
import type { WordInfo } from '../types';

interface VocabularyPopupProps {
    word: string;
    wordInfo: WordInfo | null;
    isLoading: boolean;
    error: string | null;
    position: { top: number; left: number };
    onClose: () => void;
    onSave: () => void;
    isSaved: boolean;
}

export const VocabularyPopup: React.FC<VocabularyPopupProps> = ({ word, wordInfo, isLoading, error, position, onClose, onSave, isSaved }) => {
    const popupRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
                onClose();
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [onClose]);

    const handlePlayAudio = (text: string) => {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel(); // Stop any previous speech
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'en-US';
            window.speechSynthesis.speak(utterance);
        } else {
            alert('Text-to-speech is not supported in your browser.');
        }
    };
    
    // Adjust position to keep popup within viewport
    const getPopupStyle = (): React.CSSProperties => {
        const popupWidth = 380; // Increased width for better content display
        const popupHeight = 600; // Increased height estimate
        const margin = 20;
        
        let { top, left } = position;
        
        // Calculate available space on each side
        const spaceRight = window.innerWidth - left;
        const spaceLeft = left;
        const spaceBottom = window.innerHeight - top;
        const spaceTop = top;
        
        // Position horizontally (prefer right, then left)
        if (spaceRight >= popupWidth + margin) {
            // Enough space on the right
            left = left + 10;
        } else if (spaceLeft >= popupWidth + margin) {
            // Not enough space on right, try left
            left = left - popupWidth - 10;
        } else {
            // Not enough space on either side, center horizontally
            left = Math.max(margin, (window.innerWidth - popupWidth) / 2);
        }
        
        // Position vertically (prefer below cursor, then above)
        if (spaceBottom >= popupHeight + margin) {
            // Enough space below
            top = top + 10;
        } else if (spaceTop >= popupHeight + margin) {
            // Not enough space below, try above
            top = top - popupHeight - 10;
        } else {
            // Not enough space above or below, center vertically
            top = Math.max(margin, (window.innerHeight - popupHeight) / 2);
        }
        
        // Ensure popup doesn't go outside viewport
        left = Math.max(margin, Math.min(left, window.innerWidth - popupWidth - margin));
        top = Math.max(margin, Math.min(top, window.innerHeight - popupHeight - margin));

        return {
            position: 'fixed',
            top: `${top}px`,
            left: `${left}px`,
            zIndex: 9999,
        };
    }
    
    return (
        <div 
            ref={popupRef}
            style={getPopupStyle()}
            className="z-[9999] w-[380px] max-w-[95vw] max-h-[90vh] glass-morphism dark:glass-morphism-dark p-5 rounded-2xl shadow-2xl flex flex-col animate-in slide-in-from-bottom-4 duration-300 overflow-hidden"
            role="dialog"
            aria-modal="true"
            aria-labelledby="vocabulary-popup-title"
        >
            <div className="flex justify-between items-start mb-4">
                <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                        <i className="fas fa-book text-white text-sm"></i>
                    </div>
                    <h3 id="vocabulary-popup-title" className="text-xl font-bold capitalize bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        {word}
                    </h3>
                </div>
                <button 
                    onClick={onClose} 
                    className="text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors duration-200 p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full"
                    aria-label="Close"
                >
                    <i className="fas fa-times"></i>
                </button>
            </div>

            {isLoading && (
                <div className="flex flex-col items-center justify-center h-48 space-y-4">
                    <div className="loader-modern"></div>
                    <span className="text-slate-600 dark:text-slate-300 font-medium">Looking up word...</span>
                </div>
            )}
            
            {error && (
                <div className="text-center py-10">
                    <i className="fas fa-exclamation-triangle text-4xl text-red-500 mb-3"></i>
                    <p className="text-red-500 font-medium">{error}</p>
                </div>
            )}
            
            {wordInfo && (
                <div className="space-y-4">
                    <div className="w-full aspect-square bg-slate-200 dark:bg-slate-700 rounded-xl overflow-hidden shadow-lg group">
                         <img 
                            src={wordInfo.imageUrl} 
                            alt={word} 
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                         />
                    </div>

                    <div className="flex items-center justify-between">
                       <div className="flex items-center space-x-3">
                         <span className="text-slate-500 dark:text-slate-400 font-mono text-lg bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-lg">
                            {wordInfo.phonetic}
                         </span>
                         <button
                            onClick={() => handlePlayAudio(word)}
                            className="text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 text-lg p-2 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-full transition-all duration-200"
                            aria-label={`Pronounce ${word}`}
                         >
                            <i className="fas fa-volume-up"></i>
                         </button>
                       </div>
                       <button
                           onClick={onSave}
                           className={`text-2xl transition-all duration-300 p-2 rounded-full ${
                            isSaved 
                                ? 'text-yellow-400 bg-yellow-100 dark:bg-yellow-900/30' 
                                : 'text-slate-400 hover:text-yellow-400 hover:bg-yellow-100 dark:hover:bg-yellow-900/30'
                           }`}
                           aria-label={isSaved ? 'Unsave word' : 'Save word'}
                        >
                           <i className={`fa-${isSaved ? 'solid' : 'regular'} fa-bookmark`}></i>
                        </button>
                    </div>
                    
                    <div className="space-y-4">
                        <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg border-l-4 border-blue-400">
                                <p className="card-subtitle text-sm mb-1 flex items-center">
                  <i className="fas fa-language mr-2 text-blue-600"></i>
                  Meaning:
                </p>
                <p className="card-description text-sm">{wordInfo.translation}</p>
                        </div>
                        
                        <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg border-l-4 border-green-400">
                            <p className="card-subtitle text-sm mb-1 flex items-center">
                                <i className="fas fa-quote-left mr-2 text-green-600"></i>
                                Example:
                            </p>
                            <p className="card-description text-sm italic">"{wordInfo.example}"</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};