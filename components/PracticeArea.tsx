import React, { useState } from 'react';
import type { PracticeSet, UserAnswers } from '../types';
import { analyzeMistake } from '../services/geminiService';


interface PracticeAreaProps {
  practiceSet: PracticeSet;
  userAnswers: UserAnswers;
  onAnswerSelect: (questionId: string, answer: string) => void;
  showResults: boolean;
  onWordClick: (word: string, event: React.MouseEvent) => void;
  onStartAnalysis: () => void;
}

const ClickableText: React.FC<{text: string, onWordClick: (word: string, event: React.MouseEvent) => void}> = React.memo(({text, onWordClick}) => {
    const parts = text.split(/(\b[a-zA-Z-]+\b)/);
    return (
        <>
            {parts.map((part, index) => {
                if (index % 2 === 1) { 
                     return (
                        <span 
                            key={index}
                            className="cursor-pointer hover:bg-yellow-200 dark:hover:bg-yellow-700 rounded transition-colors"
                            onClick={(e) => onWordClick(part, e)}
                        >
                            {part}
                        </span>
                    );
                }
                return <React.Fragment key={index}>{part}</React.Fragment>;
            })}
        </>
    );
});

const AiAnalysisMarkdown: React.FC<{ text: string }> = ({ text }) => {
  const processText = (text: string) => {
    // Clean up common markdown artifacts
    let processed = text
      .replace(/#{1,6}\s*/g, '') // Remove # headers
      .replace(/\*\*\*/g, '') // Remove triple asterisks
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>') // Bold text
      .replace(/\*([^*]+)\*/g, '<em>$1</em>') // Italic text
      .replace(/`([^`]+)`/g, '<code>$1</code>') // Inline code
      .split('\n')
      .filter(line => line.trim() !== '')
      .map(line => line.trim());

    return processed;
  };

  const lines = processText(text);

  return (
    <div className="space-y-4">
      {lines.map((line, lineIndex) => {
        // Skip empty lines
        if (!line.trim()) return null;

        // Check if line contains HTML tags we created
        const hasHtml = /<(strong|em|code)>/.test(line);
        
        if (hasHtml) {
          return (
            <div 
              key={lineIndex} 
              className="text-slate-800 dark:text-slate-200 leading-relaxed"
              dangerouslySetInnerHTML={{ 
                __html: line.replace(
                  /<strong>(.*?)<\/strong>/g, 
                  '<span class="font-bold text-blue-800 dark:text-blue-300">$1</span>'
                ).replace(
                  /<em>(.*?)<\/em>/g,
                  '<span class="italic text-purple-700 dark:text-purple-300">$1</span>'
                ).replace(
                  /<code>(.*?)<\/code>/g,
                  '<span class="bg-slate-200 dark:bg-slate-700 px-2 py-1 rounded font-mono text-sm">$1</span>'
                )
              }}
            />
          );
        }

        // Regular text paragraphs
        return (
          <p key={lineIndex} className="text-slate-800 dark:text-slate-200 leading-relaxed">
            {line}
          </p>
        );
      })}
    </div>
  );
};


const QuestionCard: React.FC<{
  question: PracticeSet['questions'][0];
  questionNumber: number;
  passage?: string;
  userAnswer?: string;
  onAnswerSelect: (questionId: string, answer: string) => void;
  showResults: boolean;
  onWordClick: (word: string, event: React.MouseEvent) => void;
  onStartAnalysis: () => void;
}> = ({ question, questionNumber, passage, userAnswer, onAnswerSelect, showResults, onWordClick, onStartAnalysis }) => {
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  
  const isIncorrect = showResults && userAnswer && userAnswer !== question.correctAnswer;

  const handleAnalyze = async () => {
    if (!userAnswer) return;
    onStartAnalysis();
    setIsAnalyzing(true);
    setAnalysis(null);
    setAnalysisError(null);
    try {
      const result = await analyzeMistake({
        questionText: question.questionText,
        options: question.options,
        correctAnswer: question.correctAnswer,
        userAnswer: userAnswer,
        passage: passage,
      });
      setAnalysis(result.analysis);
    } catch (err) {
      console.error(err);
      setAnalysisError("Sorry, I couldn't analyze this mistake. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="mb-8 question-card dark:question-card-dark p-8 group">
      <div className="flex items-start space-x-4 mb-6">
        <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
          <span className="text-white font-bold">{questionNumber}</span>
        </div>
        <p className="card-title text-lg leading-relaxed flex-grow">
          <ClickableText text={question.questionText} onWordClick={onWordClick} />
        </p>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 ml-14">
        {question.options.map((option, index) => {
          const isSelected = userAnswer === option;
          const isCorrect = question.correctAnswer === option;
          let buttonClass = "option-btn p-6 text-left font-medium ";
          
          if (showResults) {
            if (isCorrect) {
              buttonClass += "option-btn-correct transform scale-105 shadow-lg ";
            } else if (isSelected && !isCorrect) {
              buttonClass += "option-btn-incorrect ";
            } else {
              buttonClass += "opacity-60 ";
            }
          } else {
            if (isSelected) {
              buttonClass += "bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/30 dark:to-purple-900/30 border-blue-500 ring-2 ring-blue-500/30 ";
            }
            buttonClass += "hover:shadow-lg ";
          }

          return (
            <button
              key={index}
              onClick={() => !showResults && onAnswerSelect(question.id, option)}
              className={buttonClass}
              disabled={showResults}
            >
              <div className="flex items-center space-x-3">
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                  showResults && isCorrect 
                    ? 'bg-green-500 border-green-500' 
                    : showResults && isSelected && !isCorrect 
                    ? 'bg-red-500 border-red-500'
                    : isSelected 
                    ? 'bg-blue-500 border-blue-500' 
                    : 'border-slate-300 dark:border-slate-600'
                }`}>
                  {(showResults && isCorrect) || (isSelected && !showResults) ? (
                    <i className="fas fa-check text-white text-xs"></i>
                  ) : showResults && isSelected && !isCorrect ? (
                    <i className="fas fa-times text-white text-xs"></i>
                  ) : null}
                </div>
                <span className="flex-grow card-title font-medium">{option}</span>
              </div>
            </button>
          );
        })}
      </div>
      
      {showResults && (
        <div className="mt-6 ml-14 p-6 glass-morphism dark:glass-morphism-dark rounded-xl border-l-4 border-yellow-400">
          <div className="flex items-start space-x-3">
            <i className="fas fa-lightbulb text-yellow-500 text-xl mt-1"></i>
            <div>
              <p className="card-subtitle mb-2">Explanation:</p>
              <p className="card-description leading-relaxed">{question.explanation}</p>
            </div>
          </div>
        </div>
      )}

      {isIncorrect && (
        <div className="mt-6 ml-14">
          {!analysis && !isAnalyzing && !analysisError && (
            <div className="group">
              <button
                onClick={handleAnalyze}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white py-4 px-6 rounded-xl font-bold text-lg transition-all duration-300 transform hover:scale-[1.02] shadow-lg hover:shadow-xl"
              >
                <div className="flex items-center justify-center space-x-3">
                  <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center group-hover:animate-pulse">
                    <i className="fas fa-robot text-lg"></i>
                  </div>
                  <span>AI Analysis - Why did I get this wrong?</span>
                </div>
              </button>
              <p className="text-center text-slate-600 dark:text-slate-400 text-sm mt-2 opacity-75">
                Get personalized explanation for your mistake
              </p>
            </div>
          )}

          {isAnalyzing && (
            <div className="flex items-center justify-center space-x-3 p-6 glass-morphism dark:glass-morphism-dark rounded-xl">
              <div className="loader-modern"></div>
              <span className="text-blue-600 dark:text-blue-400 font-semibold">AI is analyzing your answer...</span>
            </div>
          )}

          {analysisError && (
             <div className="p-6 bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 rounded-xl border-l-4 border-red-400">
                <div className="flex items-start space-x-3">
                  <i className="fas fa-exclamation-triangle text-red-500 text-xl mt-1"></i>
                  <div>
                    <p className="font-bold text-red-800 dark:text-red-300 mb-1">Analysis Error</p>
                    <p className="text-red-700 dark:text-red-200">{analysisError}</p>
                  </div>
                </div>
             </div>
          )}

          {analysis && (
            <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-900/20 dark:via-indigo-900/20 dark:to-purple-900/20 rounded-xl border border-blue-200 dark:border-blue-700 overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                    <i className="fas fa-brain text-white text-lg"></i>
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-lg">AI Analysis</h4>
                    <p className="text-blue-100 text-sm">Understanding your mistake</p>
                  </div>
                </div>
              </div>
              
              {/* Content */}
              <div className="p-6">
                <div className="prose prose-blue dark:prose-invert max-w-none">
                  <AiAnalysisMarkdown text={analysis} />
                </div>
                
                {/* Action buttons */}
                <div className="mt-6 pt-4 border-t border-blue-200 dark:border-blue-700">
                  <div className="flex items-center space-x-3">
                    <button 
                      onClick={() => setAnalysis(null)}
                      className="text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 text-sm font-medium transition-colors"
                    >
                      <i className="fas fa-times mr-2"></i>
                      Close Analysis
                    </button>
                    <button 
                      onClick={handleAnalyze}
                      className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 text-sm font-medium transition-colors"
                    >
                      <i className="fas fa-redo mr-2"></i>
                      Analyze Again
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export const PracticeArea: React.FC<PracticeAreaProps> = ({
  practiceSet,
  userAnswers,
  onAnswerSelect,
  showResults,
  onWordClick,
  onStartAnalysis
}) => {
  return (
    <div className="space-y-8">
      {practiceSet.passage && (
        <div className="modern-card dark:modern-card-dark p-8 relative overflow-hidden">
          {/* Decorative gradient line */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>
          
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
              <i className="fas fa-file-text text-white"></i>
            </div>
            <h3 className="card-subtitle text-lg">
              Questions {practiceSet.questions.length > 1 ? `${practiceSet.questions[0].id.replace('q', '')}-${practiceSet.questions[practiceSet.questions.length-1].id.replace('q', '')}` : practiceSet.questions[0].id.replace('q', '')} refer to the following passage.
            </h3>
          </div>
          
          <div className="prose prose-slate dark:prose-invert max-w-none">
            <div className="p-6 bg-gradient-to-r from-slate-50 to-blue-50 dark:from-slate-800 dark:to-slate-700 rounded-xl border-l-4 border-blue-400 leading-relaxed text-lg">
              <ClickableText text={practiceSet.passage} onWordClick={onWordClick} />
            </div>
          </div>
        </div>
      )}
      
      <div className="space-y-6">
        {practiceSet.questions.map((q, index) => (
          <QuestionCard
            key={q.id}
            question={q}
            questionNumber={parseInt(q.id.replace('q', ''), 10)}
            userAnswer={userAnswers[q.id]}
            onAnswerSelect={onAnswerSelect}
            showResults={showResults}
            onWordClick={onWordClick}
            passage={practiceSet.passage}
            onStartAnalysis={onStartAnalysis}
          />
        ))}
      </div>
    </div>
  );
};