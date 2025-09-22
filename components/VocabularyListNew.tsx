import React, { useMemo, useState } from 'react';
import type { SavedWord, WordInfo } from '../types';
import { getWordInfo, generateImageForWord } from '../services/geminiService';

interface VocabularyListProps {
  savedWords: SavedWord[];
  onClose: () => void;
  onRemoveWord: (word: string) => void;
  onStartReview: () => void;
  onSaveWord: (word: string, info: WordInfo) => void;
}

const VocabularyCard: React.FC<{
  item: SavedWord;
  onRemove: (word: string) => void;
}> = ({ item, onRemove }) => {
  const getStatusColor = (level: number) => {
    if (level >= 3) return 'from-green-400 to-emerald-500';
    if (level >= 1) return 'from-yellow-400 to-orange-500';
    return 'from-blue-400 to-purple-500';
  };

  return (
    <div className="group modern-card dark:modern-card-dark p-4 hover:shadow-lg transition-all duration-300 relative overflow-hidden h-fit">
      {/* Status indicator */}
      <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${getStatusColor(item.reviewLevel || 1)}`}></div>
      
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <h4 className="text-lg font-bold text-slate-800 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors mb-1 truncate">
            {item.word}
          </h4>
          <p className="text-xs text-slate-600 dark:text-slate-400 font-mono bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded text-center inline-block">
            {item.phonetic}
          </p>
        </div>
        
        <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
          <div className="text-xs font-medium text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded-full">
            L{item.reviewLevel || 1}
          </div>
          <button 
            onClick={() => onRemove(item.word)} 
            className="text-slate-400 hover:text-red-500 text-sm p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-full transition-all duration-200"
            aria-label={`Remove ${item.word}`}
          >
            <i className="fas fa-trash-alt"></i>
          </button>
        </div>
      </div>
      
      <div className="space-y-3">
        <div className="p-3 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg border-l-4 border-blue-400">
          <p className="text-xs font-semibold text-blue-700 dark:text-blue-300 mb-1 flex items-center">
            <i className="fas fa-language mr-1"></i>
            Meaning
          </p>
          <p className="text-sm font-medium text-slate-800 dark:text-slate-200 leading-relaxed line-clamp-2">{item.translation}</p>
        </div>
        
        <div className="p-3 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg border-l-4 border-green-400">
          <p className="text-xs font-semibold text-green-700 dark:text-green-300 mb-1 flex items-center">
            <i className="fas fa-quote-left mr-1"></i>
            Example
          </p>
          <p className="text-sm text-slate-800 dark:text-slate-200 italic leading-relaxed line-clamp-2">"{item.example}"</p>
        </div>
      </div>
    </div>
  );
};

const SearchResultCard: React.FC<{
  word: string;
  wordInfo: WordInfo;
  onSave: () => void;
  isSaved: boolean;
}> = ({ word, wordInfo, onSave, isSaved }) => {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl p-4 space-y-4 border border-slate-200 dark:border-slate-700">
      <div className="flex items-center justify-between">
        <h4 className="text-lg font-bold text-slate-800 dark:text-slate-200">Found: {word}</h4>
        <button
          onClick={onSave}
          disabled={isSaved}
          className={`py-2 px-4 rounded-lg font-semibold text-sm transition-all duration-300 ${
            isSaved 
              ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' 
              : 'btn-gradient-primary'
          }`}
        >
          {isSaved ? 'Saved' : 'Save'}
        </button>
      </div>
      <p className="text-base font-medium text-slate-700 dark:text-slate-300 leading-relaxed">{wordInfo.translation}</p>
      <p className="text-sm text-slate-600 dark:text-slate-400 italic leading-relaxed">"{wordInfo.example}"</p>
    </div>
  );
};

const VocabularyList: React.FC<VocabularyListProps> = ({ 
  savedWords, 
  onClose, 
  onRemoveWord, 
  onStartReview, 
  onSaveWord 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResult, setSearchResult] = useState<WordInfo | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [showBackToTop, setShowBackToTop] = useState(false);

  const wordsDueForReview = useMemo(() => {
    const now = new Date();
    return savedWords.filter(word => new Date(word.nextReviewAt) <= now).length;
  }, [savedWords]);

  const statistics = useMemo(() => {
    const total = savedWords.length;
    const mastered = savedWords.filter(w => (w.reviewLevel || 1) >= 3).length;
    const learning = savedWords.filter(w => (w.reviewLevel || 1) < 3).length;
    
    return { total, mastered, learning, needReview: wordsDueForReview };
  }, [savedWords, wordsDueForReview]);

  // Handle scroll for back to top button
  const handleScroll = (e: React.UIEvent<HTMLElement>) => {
    const target = e.target as HTMLElement;
    setShowBackToTop(target.scrollTop > 200);
  };

  const scrollToTop = () => {
    const mainElement = document.querySelector('.vocabulary-scroll-container');
    if (mainElement) {
      mainElement.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanedWord = searchTerm.trim().toLowerCase();
    if (!cleanedWord || isSearching) return;

    setIsSearching(true);
    setSearchResult(null);
    setSearchError(null);

    try {
      const info = await getWordInfo(cleanedWord);
      const imageUrl = await generateImageForWord(info.visualDescription, cleanedWord);
      setSearchResult({ ...info, imageUrl });
    } catch (err) {
      setSearchError('Không tìm thấy thông tin cho từ này. Vui lòng thử lại.');
      console.error(err);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSaveClick = () => {
    if (searchResult && searchTerm) {
      onSaveWord(searchTerm, searchResult);
      setSearchResult(null);
      setSearchTerm('');
    }
  };

  const isSearchedWordSaved = useMemo(() => {
    if (!searchResult || !searchTerm) return false;
    return savedWords.some(w => w.word === searchTerm.trim().toLowerCase());
  }, [savedWords, searchResult, searchTerm]);

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex justify-center items-center p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div 
        className="modern-card dark:modern-card-dark w-full max-w-8xl h-[90vh] max-h-[900px] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modern Header */}
        <header className="p-6 border-b border-slate-200 dark:border-slate-700 space-y-4 relative bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>
          
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <i className="fas fa-book-bookmark text-xl text-white"></i>
              </div>
              <div>
                <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-200 mb-1">My Vocabulary</h2>
                <p className="text-base text-slate-600 dark:text-slate-400 font-medium">
                  {statistics.total} words saved • {statistics.needReview} due for review
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <button 
                onClick={onStartReview}
                disabled={statistics.needReview === 0}
                className="btn-gradient-success py-3 px-6 rounded-xl font-bold text-base transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                <i className="fas fa-brain"></i>
                <span>Review ({statistics.needReview})</span>
              </button>
              
              <button 
                onClick={onClose} 
                className="text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 text-xl p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-all duration-200"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
          </div>
          
          {/* Modern Search Bar */}
          <form onSubmit={handleSearch} className="flex gap-3">
            <div className="flex-grow relative">
              <input 
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search and add new vocabulary..."
                className="w-full glass-morphism dark:glass-morphism-dark border-2 border-slate-200 dark:border-slate-600 rounded-xl px-6 py-4 pl-14 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 text-base font-medium"
              />
              <i className="fas fa-search absolute left-5 top-1/2 transform -translate-y-1/2 text-slate-400 text-lg"></i>
            </div>
            <button
              type="submit"
              disabled={isSearching || !searchTerm.trim()}
              className="btn-gradient-primary py-4 px-8 rounded-xl font-bold text-base transition-all duration-300 disabled:opacity-50 disabled:cursor-wait flex items-center space-x-2"
            >
              {isSearching ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <i className="fas fa-plus"></i>
              )}
              <span>{isSearching ? 'Searching...' : 'Add Word'}</span>
            </button>
          </form>
        </header>

        {/* Main Content */}
        <div className="flex-grow overflow-hidden">
          {/* Statistics Cards - Horizontal Layout */}
          <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-3 text-white text-center">
                <p className="text-blue-100 text-xs font-medium">Total</p>
                <p className="text-xl font-bold">{statistics.total}</p>
              </div>
              
              <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-3 text-white text-center">
                <p className="text-green-100 text-xs font-medium">Mastered</p>
                <p className="text-xl font-bold">{statistics.mastered}</p>
              </div>
              
              <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg p-3 text-white text-center">
                <p className="text-orange-100 text-xs font-medium">Review</p>
                <p className="text-xl font-bold">{statistics.needReview}</p>
              </div>

              {/* Search Results in header for better space usage */}
              <div className="col-span-1 sm:col-span-1 min-w-0">
                {isSearching && (
                  <div className="flex items-center justify-center space-x-2 p-3 bg-white dark:bg-slate-800 rounded-lg border">
                    <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-xs text-slate-600 dark:text-slate-400 truncate">Searching...</span>
                  </div>
                )}
                
                {searchError && (
                  <div className="text-center p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                    <i className="fas fa-exclamation-triangle text-sm text-red-500"></i>
                    <p className="text-xs text-red-600 dark:text-red-400 truncate">Error</p>
                  </div>
                )}
                
                {searchResult && (
                  <div className="bg-white dark:bg-slate-800 rounded-lg p-3 border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate">{searchTerm}</h5>
                      <button
                        onClick={handleSaveClick}
                        disabled={isSearchedWordSaved}
                        className={`py-1 px-2 rounded text-xs font-semibold transition-all duration-300 ${
                          isSearchedWordSaved 
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' 
                            : 'bg-blue-500 text-white hover:bg-blue-600'
                        }`}
                      >
                        {isSearchedWordSaved ? 'Saved' : 'Save'}
                      </button>
                    </div>
                    <p className="text-xs text-slate-700 dark:text-slate-300 line-clamp-2">{searchResult.translation}</p>
                  </div>
                )}
                
                {!isSearching && !searchError && !searchResult && (
                  <div className="text-center p-3 bg-slate-100 dark:bg-slate-800 rounded-lg">
                    <i className="fas fa-search text-lg text-slate-400 mb-1"></i>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Search words</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Main Content Area - Full Width with Enhanced Scrolling */}
          <main 
            className="vocabulary-scroll-container flex-grow overflow-y-auto p-6 scroll-smooth scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-600 scrollbar-track-transparent hover:scrollbar-thumb-slate-400 dark:hover:scrollbar-thumb-slate-500 relative"
            onScroll={handleScroll}
          >
            {savedWords.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <div className="w-32 h-32 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-6">
                  <i className="fas fa-book-bookmark text-6xl text-white"></i>
                </div>
                <h3 className="text-3xl font-bold text-slate-700 dark:text-slate-200 mb-3">Your vocabulary list is empty</h3>
                <p className="text-slate-500 dark:text-slate-400 text-lg max-w-md leading-relaxed">
                  Search for words above or click on words while practicing to save them here.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex items-center justify-between sticky top-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm py-2 z-10 rounded-lg shadow-sm">
                  <h3 className="text-2xl font-bold text-slate-700 dark:text-slate-300 flex items-center">
                    <i className="fas fa-list mr-3 text-blue-600"></i>
                    Saved Words ({savedWords.length})
                  </h3>
                  {savedWords.length > 8 && (
                    <div className="text-sm text-slate-500 dark:text-slate-400 flex items-center space-x-2 bg-blue-50 dark:bg-blue-900/20 px-3 py-1 rounded-full">
                      <i className="fas fa-scroll text-blue-500 animate-pulse"></i>
                      <span>Scroll to see more</span>
                    </div>
                  )}
                </div>
                
                {/* Responsive Grid - More cards per row with improved spacing */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 pb-4">
                  {savedWords.map((item, index) => (
                    <div key={item.word} style={{animationDelay: `${index * 0.1}s`}} className="animate-fade-in">
                      <VocabularyCard item={item} onRemove={onRemoveWord} />
                    </div>
                  ))}
                </div>
                
                {/* Bottom spacing for better scrolling experience */}
                <div className="h-8"></div>
              </div>
            )}
          </main>
          
          {/* Back to Top Button */}
          {showBackToTop && (
            <button
              onClick={scrollToTop}
              className="fixed bottom-8 right-8 bg-gradient-to-r from-blue-500 to-purple-600 text-white p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 z-20"
              aria-label="Back to top"
            >
              <i className="fas fa-arrow-up text-lg"></i>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default VocabularyList;