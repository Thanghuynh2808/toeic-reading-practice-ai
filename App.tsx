import React, { useState, useCallback, useEffect, useRef } from 'react';
import { PartSelector } from './components/PartSelector';
import { PracticeArea } from './components/PracticeArea';
import { Loader } from './components/Loader';
import { VocabularyPopup } from './components/VocabularyPopup';
import VocabularyList from './components/VocabularyListNew';
import { VocabularyReview } from './components/VocabularyReview';
import { Mascot } from './components/Mascot';
import { DailyQuests } from './components/DailyQuests';
import { generateToeicQuestions, getWordInfo, generateImageForWord } from './services/geminiService';
// FIX: Import `mascotMessages` to resolve type errors.
import { getRandomMessage, mascotMessages } from './lib/mascotMessages';
import type { PracticeSet, UserAnswers, WordInfo, SavedWord, DailyQuestStatus } from './types';
import type { MascotPose } from './components/Mascot';

// Spaced repetition intervals in days for each level
const reviewIntervals: { [level: number]: number } = {
  1: 1,
  2: 3,
  3: 7,
  4: 15,
  5: 30, 
};

// Helper to get today's date as a YYYY-MM-DD string
const getTodayDateString = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const App: React.FC = () => {
  const [currentPart, setCurrentPart] = useState<number | null>(null);
  const [practiceSet, setPracticeSet] = useState<PracticeSet | null>(null);
  const [userAnswers, setUserAnswers] = useState<UserAnswers>({});
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [showResults, setShowResults] = useState<boolean>(false);

  // State for vocabulary lookup
  const [lookupWord, setLookupWord] = useState<string | null>(null);
  const [wordInfo, setWordInfo] = useState<WordInfo | null>(null);
  const [isLookingUp, setIsLookingUp] = useState<boolean>(false);
  const [lookupError, setLookupError] = useState<string | null>(null);
  const [popupPosition, setPopupPosition] = useState<{ top: number; left: number }>({ top: 0, left: 0 });

  // State for saved words and review
  const [savedWords, setSavedWords] = useState<SavedWord[]>([]);
  const [isVocabListVisible, setIsVocabListVisible] = useState<boolean>(false);
  const [isReviewing, setIsReviewing] = useState<boolean>(false);
  const [reviewWords, setReviewWords] = useState<SavedWord[]>([]);

  // State for Mascot
  const [mascotState, setMascotState] = useState({
    isVisible: false,
    message: '',
    pose: 'idle' as MascotPose,
  });
  const mascotTimeoutRef = useRef<number | null>(null);
  
  // State for learning streak
  const [streak, setStreak] = useState<number>(0);

  // State for Daily Quests
  const [dailyQuests, setDailyQuests] = useState<DailyQuestStatus | null>(null);
  const [isQuestModalOpen, setIsQuestModalOpen] = useState<boolean>(false);


  const showMascotMessage = useCallback((category: keyof typeof mascotMessages, pose: MascotPose, duration: number = 7000) => {
      if (mascotTimeoutRef.current) {
          clearTimeout(mascotTimeoutRef.current);
      }

      // First hide mascot to ensure clean reset
      setMascotState(prev => ({ ...prev, isVisible: false }));
      
      // Then show new message after a brief delay
      setTimeout(() => {
          setMascotState({
              isVisible: true,
              message: getRandomMessage(category),
              pose: pose,
          });
      }, 100); // Small delay to ensure clean reset

      mascotTimeoutRef.current = window.setTimeout(() => {
          setMascotState(prev => ({ ...prev, isVisible: false }));
      }, duration);
  }, []);

  // Welcome message on load
  useEffect(() => {
      const welcomeTimer = setTimeout(() => {
          showMascotMessage('welcome', 'idle', 8000);
      }, 1500);
      return () => clearTimeout(welcomeTimer);
  }, [showMascotMessage]);

  // Load streak from localStorage on initial render and validate it
  useEffect(() => {
    try {
      const storedStreak = localStorage.getItem('toeic-streak');
      const storedDateStr = localStorage.getItem('toeic-lastPracticeDate');

      if (storedStreak && storedDateStr) {
        const today = new Date();
        const lastPracticeDate = new Date(storedDateStr);

        // Normalize dates to the start of the day for accurate comparison
        today.setHours(0, 0, 0, 0);
        lastPracticeDate.setHours(0, 0, 0, 0);

        const diffTime = today.getTime() - lastPracticeDate.getTime();
        // Get difference in days
        const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays <= 1) {
          // Streak is valid if it's from today or yesterday
          setStreak(parseInt(storedStreak, 10));
        } else {
          // Streak is broken
          setStreak(0);
          localStorage.removeItem('toeic-streak');
          localStorage.removeItem('toeic-lastPracticeDate');
        }
      } else {
        setStreak(0);
      }
    } catch (error) {
      console.error("Failed to load streak data from localStorage", error);
      setStreak(0);
    }
  }, []);

  // Initialize or load daily quests
  useEffect(() => {
    try {
      const todayStr = getTodayDateString();
      const storedQuestsStr = localStorage.getItem('toeic-daily-quests');
      let questsData: { date: string; quests: DailyQuestStatus } | null = null;
      
      if (storedQuestsStr) {
        questsData = JSON.parse(storedQuestsStr);
      }
      
      if (questsData && questsData.date === todayStr) {
        // Data is for today, load it
        setDailyQuests(questsData.quests);
      } else {
        // Data is old or doesn't exist, create a new set for today
        const newQuests: DailyQuestStatus = {
          loggedIn: true, // This is true just by being here
          savedWord: false,
          reviewedVocab: false,
          completedPart5: false,
          completedPart6: false,
          completedPart7: false,
        };
        setDailyQuests(newQuests);
        localStorage.setItem('toeic-daily-quests', JSON.stringify({ date: todayStr, quests: newQuests }));
      }
    } catch (error) {
      console.error("Failed to initialize daily quests", error);
    }
  }, []);


  const handleQuestCompletion = useCallback((questKey: keyof DailyQuestStatus) => {
    setDailyQuests(prevQuests => {
      if (!prevQuests || prevQuests[questKey]) {
        return prevQuests; // Already completed or not initialized, do nothing
      }
      const updatedQuests = { ...prevQuests, [questKey]: true };
      
      // Update localStorage
      try {
        const todayStr = getTodayDateString();
        localStorage.setItem('toeic-daily-quests', JSON.stringify({ date: todayStr, quests: updatedQuests }));
      } catch (error) {
        console.error("Failed to save daily quest progress", error);
      }

      return updatedQuests;
    });
  }, []);


  // Load saved words from localStorage on initial render
  useEffect(() => {
    try {
      const storedWords = localStorage.getItem('toeic-saved-words');
      if (storedWords) {
        setSavedWords(JSON.parse(storedWords));
      }
    } catch (error) {
      console.error("Failed to load saved words from localStorage", error);
    }
  }, []);

  // Save words to localStorage whenever the list changes
  useEffect(() => {
    try {
      localStorage.setItem('toeic-saved-words', JSON.stringify(savedWords));
    } catch (error) {
      console.error("Failed to save words to localStorage", error);
    }
  }, [savedWords]);


  const handleStartPractice = useCallback(async (part: number) => {
    setCurrentPart(part);
    setPracticeSet(null);
    setUserAnswers({});
    setShowResults(false);
    setError(null);
    setIsLoading(true);

    try {
      const questions = await generateToeicQuestions(part);
      setPracticeSet(questions);
    } catch (err) {
      console.error(err);
      setError('Failed to generate questions. The model may be overloaded. Please try again in a moment.');
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  const handleAnswerSelect = (questionId: string, answer: string) => {
    setUserAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const calculateScore = useCallback(() => {
    if (!practiceSet) return { score: 0, total: 0 };
    let correctAnswers = 0;
    const allQuestions = practiceSet.questions;
    allQuestions.forEach(q => {
      if (userAnswers[q.id] === q.correctAnswer) {
        correctAnswers++;
      }
    });
    return { score: correctAnswers, total: allQuestions.length };
  }, [practiceSet, userAnswers]);

  const handleUpdateStreak = useCallback(() => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Normalize to the start of the day

      const storedDateStr = localStorage.getItem('toeic-lastPracticeDate');
      
      if (storedDateStr) {
        const lastPracticeDate = new Date(storedDateStr);
        lastPracticeDate.setHours(0, 0, 0, 0); // Normalize

        const diffTime = today.getTime() - lastPracticeDate.getTime();
        const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 0) {
          // Already practiced today, do nothing.
          return;
        }

        if (diffDays === 1) {
          // Consecutive day, increment streak
          setStreak(prevStreak => {
            const newStreak = prevStreak + 1;
            localStorage.setItem('toeic-streak', newStreak.toString());
            localStorage.setItem('toeic-lastPracticeDate', today.toISOString());
            return newStreak;
          });
        } else {
          // Streak broken, start a new one
          setStreak(1);
          localStorage.setItem('toeic-streak', '1');
          localStorage.setItem('toeic-lastPracticeDate', today.toISOString());
        }
      } else {
        // First practice session ever
        setStreak(1);
        localStorage.setItem('toeic-streak', '1');
        localStorage.setItem('toeic-lastPracticeDate', today.toISOString());
      }
    } catch (error) {
      console.error("Failed to update streak data in localStorage", error);
    }
  }, []);

  const handleSubmit = () => {
    showMascotMessage('onSubmit', 'explaining', 4000);
    handleUpdateStreak();

    // Check for quest completion
    const { score, total } = calculateScore();
    if (total > 0 && (score / total) >= 0.8) {
      if (currentPart === 5) handleQuestCompletion('completedPart5');
      if (currentPart === 6) handleQuestCompletion('completedPart6');
      if (currentPart === 7) handleQuestCompletion('completedPart7');
    }

    setShowResults(true);
  };
  
  // Message on showing results
  useEffect(() => {
      if (showResults && practiceSet) {
          const { score, total } = calculateScore();
          const percentage = total > 0 ? (score / total) * 100 : 0;
          
          const resultTimer = setTimeout(() => {
              if (percentage >= 80) {
                  showMascotMessage('resultGood', 'correct');
              } else if (percentage >= 50) {
                  showMascotMessage('resultOkay', 'explaining');
              } else {
                  showMascotMessage('resultBad', 'thinking');
              }
          }, 1000); // Delay to show after score is visible
          
          return () => clearTimeout(resultTimer);
      }
  }, [showResults, practiceSet, showMascotMessage, calculateScore]);

  const handleReset = () => {
      setCurrentPart(null);
      setPracticeSet(null);
      setUserAnswers({});
      setShowResults(false);
      setError(null);
  }

  const handleWordClick = useCallback(async (word: string, event: React.MouseEvent) => {
    const cleanedWord = word.toLowerCase().replace(/[^a-z-]/g, '');
    if (!cleanedWord || cleanedWord.length < 2 || cleanedWord.length > 20) return;
    
    if (lookupWord) { // Close existing popup if a new word is clicked
      handleClosePopup();
    }
    
    setPopupPosition({ top: event.clientY, left: event.clientX });
    setLookupWord(cleanedWord);
    setWordInfo(null);
    setLookupError(null);
    setIsLookingUp(true);

    try {
        const info = await getWordInfo(cleanedWord);
        const imageUrl = await generateImageForWord(info.visualDescription);
        setWordInfo({ ...info, imageUrl });
    } catch (err) {
        console.error(err);
        setLookupError("Failed to get info for this word.");
    } finally {
        setIsLookingUp(false);
    }
  }, [lookupWord]);

  const handleClosePopup = () => {
    setLookupWord(null);
    setWordInfo(null);
    setLookupError(null);
  };

  const saveWord = useCallback((wordToSave: string, info: WordInfo) => {
    const cleanedWord = wordToSave.trim().toLowerCase();
    if (!cleanedWord) return;

    const existingWord = savedWords.find(w => w.word === cleanedWord);
    if (existingWord) {
      console.warn(`Word "${cleanedWord}" is already saved.`);
      return; // Don't re-add if already saved.
    }

    const newSavedWord: SavedWord = {
      word: cleanedWord,
      ...info,
      level: 1,
      nextReviewAt: new Date().toISOString(),
    };
    
    setSavedWords(prev => [newSavedWord, ...prev]);
    handleQuestCompletion('savedWord');
  }, [savedWords, handleQuestCompletion]);

  const handleSavePopupWord = useCallback(() => {
    if (!lookupWord || !wordInfo) return;
    saveWord(lookupWord, wordInfo);
    handleClosePopup(); // Close popup after saving
  }, [lookupWord, wordInfo, saveWord]);


  const handleRemoveWord = (wordToRemove: string) => {
    setSavedWords(prev => prev.filter(w => w.word !== wordToRemove));
  };

  const handleStartReview = () => {
    const now = new Date();
    const wordsDue = savedWords.filter(word => new Date(word.nextReviewAt) <= now);
    if (wordsDue.length > 0) {
      // Shuffle the words for variety
      setReviewWords(wordsDue.sort(() => Math.random() - 0.5));
      setIsVocabListVisible(false);
      setIsReviewing(true);
    }
  };

  const handleUpdateWordLevel = (wordToUpdate: SavedWord, isCorrect: boolean) => {
    setSavedWords(prevWords => {
      return prevWords.map(word => {
        if (word.word === wordToUpdate.word) {
          let newLevel = word.level;
          if (isCorrect) {
            newLevel = Math.min(5, word.level + 1);
          } else {
            newLevel = Math.max(1, word.level - 1);
          }
          
          const reviewIntervalDays = reviewIntervals[newLevel];
          const nextReviewDate = new Date();
          nextReviewDate.setDate(nextReviewDate.getDate() + reviewIntervalDays);

          return { ...word, level: newLevel, nextReviewAt: nextReviewDate.toISOString() };
        }
        return word;
      });
    });
  };

  const handleFinishReview = () => {
    setIsReviewing(false);
    handleQuestCompletion('reviewedVocab');
  };

  const handleStartAnalysis = useCallback(() => {
    showMascotMessage('startAnalysis', 'explaining');
  }, [showMascotMessage]);

  const { score, total } = showResults ? calculateScore() : { score: 0, total: 0 };

  const isCurrentWordSaved = lookupWord ? savedWords.some(w => w.word === lookupWord) : false;

  return (
    <div className="min-h-screen font-sans">
      <header className="header-modern sticky top-0 z-40">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="floating">
              <i className="fa-solid fa-book-open-reader text-3xl text-white drop-shadow-lg"></i>
            </div>
            <h1 className="text-2xl font-bold text-white drop-shadow-lg">TOEIC AI Practice</h1>
          </div>
          <div className="flex items-center space-x-2 sm:space-x-6">
            {/* Daily Quests Button */}
            <button
                onClick={() => setIsQuestModalOpen(true)}
                className="text-white hover:text-green-300 p-2 rounded-full transition-all duration-300 hover:scale-110 hover:bg-white/10"
                aria-label="Open daily quests"
                title="Daily Quests"
              >
                <i className="fas fa-seedling text-2xl drop-shadow-lg"></i>
            </button>
            
            {/* Streak Counter */}
            <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-lg rounded-full px-4 py-2 border border-white/20" title={`${streak} day learning streak`}>
                <i className="fas fa-fire text-2xl text-orange-400 drop-shadow-lg"></i>
                <span className="font-bold text-xl text-white drop-shadow-lg">{streak}</span>
            </div>

            {/* Vocab Button */}
            <button
              onClick={() => setIsVocabListVisible(true)}
              className="relative text-white hover:text-blue-300 p-2 rounded-full transition-all duration-300 hover:scale-110 hover:bg-white/10"
              aria-label="Open saved words list"
            >
              <i className="fas fa-book-bookmark text-2xl drop-shadow-lg"></i>
              {savedWords.length > 0 && (
                <span className="absolute -top-1 -right-1 block h-6 w-6 rounded-full bg-gradient-to-r from-pink-500 to-red-500 text-white text-xs font-bold flex items-center justify-center animate-pulse">
                  {savedWords.length}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-4xl mx-auto modern-card dark:modern-card-dark p-6 sm:p-8">
          {!currentPart && !isReviewing && <PartSelector onSelectPart={handleStartPractice} disabled={isLoading} />}
          
          {isLoading && <Loader />}
          
          {error && (
            <div className="text-center">
              <div className="mb-6">
                <i className="fas fa-exclamation-triangle text-6xl text-yellow-500 mb-4"></i>
              </div>
              <p className="text-red-500 font-semibold mb-4 text-lg">{error}</p>
              <button 
                  onClick={handleReset} 
                  className="btn-gradient-primary py-3 px-8 rounded-xl font-bold text-lg">
                  <i className="fas fa-redo mr-2"></i>
                  Try Again
              </button>
            </div>
          )}

          {practiceSet && !isLoading && (
            <div>
              <div className="flex justify-between items-center mb-6 border-b border-slate-200 dark:border-slate-700 pb-4">
                 <div className="flex items-center space-x-3">
                   <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                     <span className="text-white font-bold text-lg">{currentPart}</span>
                   </div>
                   <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Reading Part {currentPart}</h2>
                 </div>
                 {showResults && (
                   <div className="text-right">
                     <p className="text-lg font-semibold text-slate-600 dark:text-slate-300">Your Score</p>
                     <div className="flex items-center space-x-2">
                       <p className="text-3xl font-bold bg-gradient-to-r from-green-500 to-blue-500 bg-clip-text text-transparent">{score}</p>
                       <span className="text-2xl text-slate-400">/</span>
                       <p className="text-3xl font-bold text-slate-600 dark:text-slate-300">{total}</p>
                     </div>
                   </div>
                 )}
              </div>

              <PracticeArea 
                practiceSet={practiceSet}
                userAnswers={userAnswers}
                onAnswerSelect={handleAnswerSelect}
                showResults={showResults}
                onWordClick={handleWordClick}
                onStartAnalysis={handleStartAnalysis}
              />
              
              <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-700 flex justify-center space-x-4">
                {!showResults ? (
                  <button 
                    onClick={handleSubmit}
                    className="btn-gradient-success py-4 px-12 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                    disabled={Object.keys(userAnswers).length !== (practiceSet.questions.length)}>
                    <i className="fas fa-paper-plane mr-2"></i>
                    Submit Answers
                  </button>
                ) : (
                  <button 
                    onClick={handleReset}
                    className="btn-gradient-primary py-4 px-12 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-300">
                    <i className="fas fa-refresh mr-2"></i>
                    Practice Another Part
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </main>

      {lookupWord && (
        <VocabularyPopup
            word={lookupWord}
            wordInfo={wordInfo}
            isLoading={isLookingUp}
            error={lookupError}
            position={popupPosition}
            onClose={handleClosePopup}
            onSave={handleSavePopupWord}
            isSaved={isCurrentWordSaved}
        />
      )}

      {isVocabListVisible && (
        <VocabularyList
          savedWords={savedWords}
          onClose={() => setIsVocabListVisible(false)}
          onRemoveWord={handleRemoveWord}
          onStartReview={handleStartReview}
          onSaveWord={saveWord}
        />
      )}
      
      {isReviewing && (
        <VocabularyReview
            wordsToReview={reviewWords}
            allWords={savedWords}
            onClose={handleFinishReview}
            onUpdateWordLevel={handleUpdateWordLevel}
        />
      )}

      {dailyQuests && isQuestModalOpen && (
        <DailyQuests 
          quests={dailyQuests}
          onClose={() => setIsQuestModalOpen(false)}
        />
      )}

      <Mascot 
          isVisible={mascotState.isVisible}
          message={mascotState.message}
          pose={mascotState.pose}
      />

      <footer className="text-center py-4 text-slate-500 dark:text-slate-400 text-sm">
        <p>Generated with AI for educational purposes.</p>
      </footer>
    </div>
  );
};

export default App;
