import React, { useState, useEffect, useCallback, useRef } from 'react';
import type { SavedWord } from '../types';
import { generateClozeQuestion } from '../services/geminiService';

// Define types for different quiz question formats
type QuizQuestionType = 'image_to_word' | 'pronunciation_to_word' | 'en_to_vi' | 'vi_to_en' | 'fill_in_blank';
interface BaseQuizQuestion {
    type: QuizQuestionType;
    word: SavedWord;
    options: string[];
    correctAnswer: string;
}
interface ClozeQuizQuestion extends BaseQuizQuestion {
    type: 'fill_in_blank';
    sentence: string;
}
type QuizQuestion = BaseQuizQuestion | ClozeQuizQuestion;


interface VocabularyReviewProps {
    wordsToReview: SavedWord[];
    allWords: SavedWord[];
    onClose: () => void;
    onUpdateWordLevel: (word: SavedWord, isCorrect: boolean) => void;
}


const shuffleArray = <T,>(array: T[]): T[] => {
    return [...array].sort(() => Math.random() - 0.5);
};

// Helper to get distractors
const getDistractors = (correctWord: SavedWord, allWords: SavedWord[], count: number, field: 'word' | 'translation'): string[] => {
    const distractors = new Set<string>();
    const filteredWords = allWords.filter(w => w.word !== correctWord.word);
    
    while (distractors.size < count && distractors.size < filteredWords.length) {
        const randomWord = filteredWords[Math.floor(Math.random() * filteredWords.length)];
        distractors.add(randomWord[field]);
    }
    return Array.from(distractors);
};


export const VocabularyReview: React.FC<VocabularyReviewProps> = ({ wordsToReview, allWords, onClose, onUpdateWordLevel }) => {
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [quizQuestion, setQuizQuestion] = useState<QuizQuestion | null>(null);
    const [userAnswer, setUserAnswer] = useState<string | null>(null);
    const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [sessionResults, setSessionResults] = useState<{ word: SavedWord; result: 'correct' | 'incorrect' }[]>([]);

    // Use a ref to hold the latest allWords array without making it a dependency of generateQuestion
    const allWordsRef = useRef(allWords);
    useEffect(() => {
        allWordsRef.current = allWords;
    }, [allWords]);

    const generateQuestion = useCallback(async (word: SavedWord) => {
        setIsLoading(true);
        setUserAnswer(null);
        setIsCorrect(null);

        const quizTypes: QuizQuestionType[] = ['image_to_word', 'en_to_vi', 'vi_to_en', 'fill_in_blank', 'pronunciation_to_word'];
        const randomType = quizTypes[Math.floor(Math.random() * quizTypes.length)];
        
        let question: QuizQuestion;
        
        // Access the most current list of words via the ref
        const currentAllWords = allWordsRef.current;

        switch(randomType) {
            case 'image_to_word':
            case 'pronunciation_to_word':
            case 'vi_to_en': {
                const distractors = getDistractors(word, currentAllWords, 3, 'word');
                question = {
                    type: randomType,
                    word: word,
                    options: shuffleArray([...distractors, word.word]),
                    correctAnswer: word.word
                };
                break;
            }
            case 'en_to_vi': {
                const distractors = getDistractors(word, currentAllWords, 3, 'translation');
                question = {
                    type: 'en_to_vi',
                    word: word,
                    options: shuffleArray([...distractors, word.translation]),
                    correctAnswer: word.translation
                };
                break;
            }
            case 'fill_in_blank': {
                 try {
                    const { sentence } = await generateClozeQuestion(word.word);
                    const distractors = getDistractors(word, currentAllWords, 3, 'word');
                     question = {
                         type: 'fill_in_blank',
                         word: word,
                         sentence: sentence,
                         options: shuffleArray([...distractors, word.word]),
                         correctAnswer: word.word
                     };
                 } catch (error) {
                     console.error("Failed to generate cloze question, falling back.", error);
                     const distractors = getDistractors(word, currentAllWords, 3, 'word');
                     question = { type: 'vi_to_en', word, options: shuffleArray([...distractors, word.word]), correctAnswer: word.word };
                 }
                break;
            }
            default: 
                const distractors = getDistractors(word, currentAllWords, 3, 'word');
                question = { type: 'vi_to_en', word, options: shuffleArray([...distractors, word.word]), correctAnswer: word.word };
        }
        
        setQuizQuestion(question);
        setIsLoading(false);
    }, []); // Empty dependency array makes this function stable

    useEffect(() => {
        if (currentQuestionIndex < wordsToReview.length) {
            generateQuestion(wordsToReview[currentQuestionIndex]);
        }
    }, [currentQuestionIndex, wordsToReview, generateQuestion]);
    
    const handleAnswerSelect = (answer: string) => {
        if (userAnswer) return; 

        const correct = answer === quizQuestion?.correctAnswer;
        const currentWord = wordsToReview[currentQuestionIndex];
        
        setUserAnswer(answer);
        setIsCorrect(correct);
        onUpdateWordLevel(currentWord, correct);
        
        setSessionResults(prev => [...prev, { word: currentWord, result: correct ? 'correct' : 'incorrect' }]);
    };

    const handleNextQuestion = () => {
        if (currentQuestionIndex < wordsToReview.length) {
            setCurrentQuestionIndex(prev => prev + 1);
        }
    };
    
    const handlePlayAudio = (text: string) => {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'en-US';
            window.speechSynthesis.speak(utterance);
        }
    };
    
    if (currentQuestionIndex >= wordsToReview.length && sessionResults.length === wordsToReview.length && wordsToReview.length > 0) {
        const correctWords = sessionResults.filter(r => r.result === 'correct');
        const incorrectWords = sessionResults.filter(r => r.result === 'incorrect');

        return (
             <div className="fixed inset-0 bg-slate-100 dark:bg-slate-900 z-50 flex justify-center items-center p-4">
                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-2xl h-[90vh] max-h-[700px] flex flex-col">
                    <header className="p-6 text-center border-b border-slate-200 dark:border-slate-700">
                        <i className="fas fa-trophy text-6xl text-yellow-400 mb-4"></i>
                        <h2 className="text-3xl font-bold mb-2">Review Summary</h2>
                        <p className="card-description text-lg">
                            You scored <span className="font-bold text-blue-600 dark:text-blue-400">{correctWords.length}</span> out of <span className="font-bold">{sessionResults.length}</span>
                        </p>
                    </header>
                    <main className="flex-grow overflow-y-auto p-6 space-y-6">
                       {incorrectWords.length > 0 && (
                          <div>
                            <h3 className="text-xl font-semibold mb-3 text-red-600 dark:text-red-400">Words to practice</h3>
                            <div className="space-y-3">
                                {incorrectWords.map(({ word }) => (
                                    <div key={word.word} className="flex items-center p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                                        <i className="fas fa-times-circle text-red-500 mr-4 text-xl"></i>
                                        <div>
                                            <p className="font-bold capitalize">{word.word}</p>
                                            <p className="card-description text-sm">{word.translation}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                          </div>
                       )}
                       {correctWords.length > 0 && (
                          <div>
                             <h3 className="text-xl font-semibold mb-3 text-green-600 dark:text-green-400">Words you've mastered!</h3>
                             <div className="space-y-3">
                                {correctWords.map(({ word }) => (
                                    <div key={word.word} className="flex items-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                                        <i className="fas fa-check-circle text-green-500 mr-4 text-xl"></i>
                                        <div>
                                            <p className="font-bold capitalize">{word.word}</p>
                                            <p className="card-description text-sm">{word.translation}</p>
                                        </div>
                                    </div>
                                ))}
                             </div>
                          </div>
                       )}
                    </main>
                    <footer className="p-6 border-t border-slate-200 dark:border-slate-700">
                        <button
                            onClick={onClose}
                            className="w-full bg-blue-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Finish
                        </button>
                    </footer>
                </div>
            </div>
        );
    }
    
    const renderQuestionContent = () => {
        if (isLoading || !quizQuestion) {
            return (
                 <div className="flex flex-col items-center justify-center min-h-[200px]">
                    <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    <p className="mt-4">Generating question...</p>
                 </div>
            );
        }
        
        switch(quizQuestion.type) {
            case 'image_to_word':
                return (
                    <div className="w-full aspect-video bg-slate-200 dark:bg-slate-700 rounded-lg overflow-hidden mb-6">
                        <img src={quizQuestion.word.imageUrl} alt="Guess the word" className="w-full h-full object-cover" />
                    </div>
                );
            case 'pronunciation_to_word':
                return (
                    <div className="text-center my-12">
                        <button onClick={() => handlePlayAudio(quizQuestion.word.word)} className="bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-300 rounded-full h-24 w-24 flex items-center justify-center mx-auto text-5xl hover:bg-blue-200 dark:hover:bg-blue-800 transition">
                            <i className="fas fa-volume-up"></i>
                        </button>
                        <p className="mt-4 text-slate-500">Listen and choose the correct word.</p>
                    </div>
                );
            case 'en_to_vi':
                return (
                     <div className="text-center my-12">
                        <p className="text-slate-500 dark:text-slate-400 mb-1">What is the meaning of:</p>
                        <h3 className="text-5xl font-bold capitalize">{quizQuestion.word.word}</h3>
                        <p className="font-mono mt-2 text-slate-500">{quizQuestion.word.phonetic}</p>
                     </div>
                );
            case 'vi_to_en':
                 return (
                     <div className="text-center my-12">
                        <p className="text-slate-500 dark:text-slate-400 mb-1">Which word means:</p>
                        <h3 className="text-4xl font-bold capitalize">{quizQuestion.word.translation}</h3>
                     </div>
                );
            case 'fill_in_blank':
                const clozeQuestion = quizQuestion as ClozeQuizQuestion;
                const [before, after] = clozeQuestion.sentence.split('[BLANK]');
                return (
                    <div className="text-center my-10 bg-slate-100 dark:bg-slate-700 p-6 rounded-lg">
                        <p className="text-2xl font-serif leading-relaxed">
                            {before}
                            <span className="inline-block w-32 h-8 bg-slate-200 dark:bg-slate-600 rounded-md mx-2 align-middle"></span>
                            {after}
                        </p>
                    </div>
                );
        }
    }

    const isLastQuestion = currentQuestionIndex === wordsToReview.length - 1;

    // A small edge case check to prevent premature summary screen
    if (currentQuestionIndex >= wordsToReview.length && wordsToReview.length > 0) {
        // If we are at the end, but the results array isn't full yet, show a loader.
        if (sessionResults.length < wordsToReview.length) {
            return (
                <div className="fixed inset-0 bg-slate-100 dark:bg-slate-900 z-50 flex justify-center items-center">
                    <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
            )
        }
    }


    return (
        <div className="fixed inset-0 bg-slate-100 dark:bg-slate-900 z-50 flex flex-col p-4 sm:p-6 lg:p-8">
            <header className="w-full max-w-4xl mx-auto flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Vocabulary Review</h2>
                 <button onClick={onClose} className="text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 text-2xl" aria-label="Close">
                    <i className="fas fa-times"></i>
                 </button>
            </header>
            
            <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full max-w-4xl mx-auto">
                <div className="h-2 bg-blue-600 rounded-full transition-all duration-300" style={{width: `${((currentQuestionIndex) / wordsToReview.length) * 100}%`}}></div>
            </div>

            <main className="flex-grow w-full max-w-2xl mx-auto flex flex-col justify-center">
               {renderQuestionContent()}
               
               {!isLoading && quizQuestion && (
                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                       {quizQuestion.options.map((option, index) => {
                           let buttonClass = "w-full p-4 rounded-lg border-2 text-lg font-semibold transition-all duration-200 ";
                           if (userAnswer) {
                               const isCorrectOption = option === quizQuestion.correctAnswer;
                               const isSelectedOption = option === userAnswer;
                               if(isCorrectOption) {
                                   buttonClass += "bg-green-500 border-green-600 text-white transform scale-105";
                               } else if (isSelectedOption) {
                                   buttonClass += "bg-red-500 border-red-600 text-white";
                               } else {
                                   buttonClass += "bg-slate-200 dark:bg-slate-800 border-slate-300 dark:border-slate-700 opacity-50";
                               }
                           } else {
                               buttonClass += "bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 hover:border-blue-500 hover:text-blue-600 dark:hover:border-blue-400 dark:hover:text-blue-400";
                           }

                           return (
                               <button key={index} onClick={() => handleAnswerSelect(option)} disabled={!!userAnswer} className={buttonClass}>
                                   {option}
                               </button>
                           );
                       })}
                   </div>
               )}
               
               {userAnswer && (
                 <div className={`mt-6 p-4 rounded-lg text-center ${isCorrect ? 'bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-200' : 'bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-200'}`}>
                    <h4 className="font-bold text-xl">{isCorrect ? "Correct!" : "Incorrect"}</h4>
                    {!isCorrect && <p>The correct answer is: <strong>{quizQuestion?.correctAnswer}</strong></p>}
                    <button 
                        onClick={handleNextQuestion}
                        className="mt-4 bg-slate-800 text-white font-bold py-2 px-8 rounded-lg hover:bg-slate-900 dark:bg-slate-200 dark:text-slate-900 dark:hover:bg-white"
                    >
                        {isLastQuestion ? 'Finish Review' : 'Next'}
                    </button>
                 </div>
               )}
            </main>
        </div>
    );
};