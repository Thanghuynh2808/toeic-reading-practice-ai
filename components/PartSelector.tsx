
import React from 'react';

interface PartSelectorProps {
  onSelectPart: (part: number) => void;
  disabled: boolean;
}

const PartButton: React.FC<{
    partNumber: number;
    title: string;
    description: string;
    iconClass: string;
    onClick: () => void;
    disabled: boolean;
}> = ({ partNumber, title, description, iconClass, onClick, disabled }) => (
    <button 
        onClick={onClick}
        disabled={disabled}
        className="group relative overflow-hidden modern-card dark:modern-card-dark p-8 hover:scale-105 transform transition-all duration-500 ease-out disabled:opacity-50 disabled:cursor-wait disabled:hover:scale-100 disabled:hover:transform-none"
    >
        {/* Gradient overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        
        {/* Content */}
        <div className="relative z-10 flex flex-col items-center justify-center text-center">
            <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <i className={`${iconClass} text-3xl text-white`}></i>
            </div>
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-4 group-hover:pulse-glow">
                <span className="text-white font-bold text-xl">{partNumber}</span>
            </div>
            <h3 className="card-title mb-2 group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-purple-600 group-hover:bg-clip-text group-hover:text-transparent transition-all duration-300">
                Part {partNumber}
            </h3>
            <p className="card-subtitle mb-3 group-hover:text-slate-900 dark:group-hover:text-slate-200 transition-colors duration-300">
                {title}
            </p>
            <p className="card-description leading-relaxed group-hover:text-slate-800 dark:group-hover:text-slate-300 transition-colors duration-300">
                {description}
            </p>
            
            {/* Hover indicator */}
            <div className="mt-4 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                <div className="flex items-center space-x-2 text-blue-600 dark:text-blue-400 font-bold">
                    <span>Start Practice</span>
                    <i className="fas fa-arrow-right"></i>
                </div>
            </div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute top-4 right-4 w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full opacity-20 group-hover:opacity-40 transition-opacity duration-300"></div>
        <div className="absolute bottom-4 left-4 w-4 h-4 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full opacity-20 group-hover:opacity-40 transition-opacity duration-300"></div>
    </button>
);


export const PartSelector: React.FC<PartSelectorProps> = ({ onSelectPart, disabled }) => {
  return (
    <div className="text-center">
      <div className="mb-8">
        <h2 className="text-4xl font-extrabold mb-4 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
          Choose a Part to Practice
        </h2>
        <p className="text-xl mb-4 text-slate-900 dark:text-slate-300 font-bold leading-relaxed">
          Select a section of the TOEIC Reading test to begin.
        </p>
        <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mx-auto"></div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
        <PartButton
            partNumber={5}
            title="Incomplete Sentences"
            description="Complete sentences with the best grammar or vocabulary choice."
            iconClass="fa-solid fa-puzzle-piece"
            onClick={() => onSelectPart(5)}
            disabled={disabled}
        />
        <PartButton
            partNumber={6}
            title="Text Completion"
            description="Fill in the blanks within short passages like emails or memos."
            iconClass="fa-solid fa-file-alt"
            onClick={() => onSelectPart(6)}
            disabled={disabled}
        />
        <PartButton
            partNumber={7}
            title="Reading Comprehension"
            description="Answer questions based on single or multiple reading passages."
            iconClass="fa-solid fa-book-reader"
            onClick={() => onSelectPart(7)}
            disabled={disabled}
        />
      </div>
      
      {/* Decorative elements */}
      <div className="mt-16 flex justify-center space-x-4">
        <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
        <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
        <div className="w-2 h-2 bg-pink-500 rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
      </div>
    </div>
  );
};
