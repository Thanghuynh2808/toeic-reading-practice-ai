import React, { useMemo } from 'react';
import type { DailyQuestStatus } from '../types';

interface DailyQuestsProps {
    quests: DailyQuestStatus;
    onClose: () => void;
}

const QUEST_CONFIG: { 
    key: keyof DailyQuestStatus; 
    text: string; 
    progress: number;
    icon: string;
    color: string;
    description: string;
}[] = [
    { 
        key: 'loggedIn', 
        text: 'Đăng nhập', 
        progress: 10,
        icon: 'fas fa-sign-in-alt',
        color: 'from-blue-500 to-blue-600',
        description: 'Bắt đầu ngày học mới'
    },
    { 
        key: 'savedWord', 
        text: 'Lưu từ vựng mới', 
        progress: 10,
        icon: 'fas fa-bookmark',
        color: 'from-purple-500 to-purple-600',
        description: 'Khám phá từ vựng mới'
    },
    { 
        key: 'reviewedVocab', 
        text: 'Ôn tập từ vựng', 
        progress: 20,
        icon: 'fas fa-brain',
        color: 'from-indigo-500 to-indigo-600',
        description: 'Củng cố kiến thức'
    },
    { 
        key: 'completedPart5', 
        text: 'Hoàn thành Part 5', 
        progress: 20,
        icon: 'fas fa-puzzle-piece',
        color: 'from-emerald-500 to-emerald-600',
        description: 'Incomplete Sentences'
    },
    { 
        key: 'completedPart6', 
        text: 'Hoàn thành Part 6', 
        progress: 20,
        icon: 'fas fa-file-alt',
        color: 'from-amber-500 to-amber-600',
        description: 'Text Completion'
    },
    { 
        key: 'completedPart7', 
        text: 'Hoàn thành Part 7', 
        progress: 20,
        icon: 'fas fa-book-open',
        color: 'from-rose-500 to-rose-600',
        description: 'Reading Comprehension'
    },
];

const getPlantImage = (progress: number): string => {
    if (progress >= 100) return '/assets/plant-stage-4.png';
    if (progress >= 80) return '/assets/plant-stage-3.png';
    if (progress >= 50) return '/assets/plant-stage-2.png';
    if (progress >= 20) return '/assets/plant-stage-1.png';
    return '/assets/plant-stage-0.png';
};

const getPlantStage = (progress: number): { stage: string; message: string } => {
    if (progress >= 100) return { stage: 'Hoàn hảo', message: 'Cây của bạn đã nở hoa rồi! 🌸' };
    if (progress >= 80) return { stage: 'Phát triển', message: 'Cây đang lớn mạnh! 🌿' };
    if (progress >= 50) return { stage: 'Tăng trưởng', message: 'Cây bắt đầu xanh tốt! 🌱' };
    if (progress >= 20) return { stage: 'Nảy mầm', message: 'Cây đã nảy mầm! 🌱' };
    return { stage: 'Hạt giống', message: 'Hãy bắt đầu học để cây lớn nhé! 🌰' };
};

export const DailyQuests: React.FC<DailyQuestsProps> = ({ quests, onClose }) => {
    const totalProgress = useMemo(() => {
        return QUEST_CONFIG.reduce((sum, quest) => {
            return quests[quest.key] ? sum + quest.progress : sum;
        }, 0);
    }, [quests]);

    const completedQuests = useMemo(() => {
        return QUEST_CONFIG.filter(quest => quests[quest.key]).length;
    }, [quests]);

    const plantStage = getPlantStage(totalProgress);

    return (
        <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex justify-center items-center p-4"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
        >
            <div 
                className="modern-card dark:modern-card-dark w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Modern Header with Gradient */}
                <header className="relative p-6 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white">
                    <div className="absolute inset-0 bg-black/20"></div>
                    <div className="relative flex justify-between items-center">
                        <div className="flex items-center space-x-4">
                            <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                                <i className="fas fa-trophy text-2xl text-white"></i>
                            </div>
                            <div>
                                <h2 className="text-3xl font-bold mb-1">Nhiệm Vụ Hàng Ngày</h2>
                                <p className="text-white/80 text-lg">
                                    {completedQuests}/{QUEST_CONFIG.length} nhiệm vụ hoàn thành • {totalProgress}% tiến độ
                                </p>
                            </div>
                        </div>
                        <button 
                            onClick={onClose} 
                            className="w-10 h-10 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center text-white text-xl transition-all duration-200"
                            aria-label="Close"
                        >
                            <i className="fas fa-times"></i>
                        </button>
                    </div>
                </header>

                {/* Main Content with Improved Layout */}
                <main className="flex-grow flex overflow-hidden">
                    {/* Left Panel: Plant & Progress */}
                    <div className="w-80 bg-gradient-to-b from-green-50 to-emerald-50 dark:from-green-900/10 dark:to-emerald-900/10 p-6 border-r border-slate-200 dark:border-slate-700">
                        <div className="text-center">
                            <h3 className="text-xl font-bold mb-4 text-slate-700 dark:text-slate-200">Cây Học Tập</h3>
                            
                            {/* Plant Container */}
                            <div className="relative w-48 h-48 mx-auto mb-6">
                                <div className="w-full h-full bg-gradient-to-b from-sky-100 to-green-100 dark:from-slate-700 dark:to-slate-600 rounded-full flex items-center justify-center overflow-hidden shadow-inner">
                                    <img 
                                        src={getPlantImage(totalProgress)} 
                                        alt="Growing plant" 
                                        className={`max-w-[80%] max-h-[80%] ${totalProgress > 0 ? 'plant-grow-animation' : ''}`} 
                                    />
                                </div>
                                
                                {/* Stage Badge */}
                                <div className="absolute -top-2 -right-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg animate-pulse">
                                    {plantStage.stage}
                                </div>
                            </div>
                            
                            {/* Progress Bar */}
                            <div className="space-y-3">
                                <div className="w-full bg-slate-200 dark:bg-slate-600 rounded-full h-6 overflow-hidden shadow-inner">
                                    <div 
                                        className="bg-gradient-to-r from-green-400 to-emerald-500 h-full rounded-full transition-all duration-700 flex items-center justify-end pr-2 progress-fill-animation"
                                        style={{ width: `${Math.max(totalProgress, 8)}%` }}
                                    >
                                        {totalProgress > 10 && (
                                            <span className="text-white text-xs font-bold">{totalProgress}%</span>
                                        )}
                                    </div>
                                </div>
                                <p className="text-2xl font-bold text-green-600 dark:text-green-400">{totalProgress}%</p>
                                <p className="text-sm text-slate-600 dark:text-slate-400 italic">{plantStage.message}</p>
                            </div>
                        </div>
                    </div>

                    {/* Right Panel: Quest Grid */}
                    <div className="flex-grow p-6 overflow-y-auto">
                        <div className="mb-6">
                            <h3 className="text-2xl font-bold text-slate-700 dark:text-slate-200 mb-2">Danh sách nhiệm vụ</h3>
                            <p className="text-slate-600 dark:text-slate-400">Hoàn thành các nhiệm vụ để cây của bạn lớn mạnh!</p>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {QUEST_CONFIG.map((quest, index) => {
                                const isCompleted = quests[quest.key];
                                return (
                                    <div 
                                        key={quest.key} 
                                        className={`quest-card-enter group relative p-5 rounded-2xl border-2 transition-all duration-300 hover:shadow-lg ${
                                            isCompleted 
                                                ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 dark:from-green-900/20 dark:to-emerald-900/20 dark:border-green-700 quest-completed-animation' 
                                                : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-600'
                                        }`}
                                        style={{animationDelay: `${index * 0.1}s`}}
                                    >
                                        {/* Quest Icon & Status */}
                                        <div className="flex items-start justify-between mb-3">
                                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white bg-gradient-to-r ${quest.color} shadow-lg quest-icon-float`}>
                                                <i className={`${quest.icon} text-lg`}></i>
                                            </div>
                                            
                                            {isCompleted ? (
                                                <div className="flex items-center space-x-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-3 py-1 rounded-full text-sm font-bold">
                                                    <i className="fas fa-check text-xs"></i>
                                                    <span>Hoàn thành</span>
                                                </div>
                                            ) : (
                                                <div className="flex items-center space-x-1 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 px-3 py-1 rounded-full text-sm font-bold">
                                                    <i className="fas fa-clock text-xs"></i>
                                                    <span>Cần làm</span>
                                                </div>
                                            )}
                                        </div>
                                        
                                        {/* Quest Info */}
                                        <div className="space-y-2">
                                            <h4 className="font-bold text-base text-slate-800 dark:text-slate-200 leading-tight">
                                                {quest.text}
                                            </h4>
                                            <p className="text-sm text-slate-600 dark:text-slate-400">
                                                {quest.description}
                                            </p>
                                            <div className="flex items-center space-x-2">
                                                <div className="flex items-center space-x-1 text-blue-600 dark:text-blue-400">
                                                    <i className="fas fa-star text-xs"></i>
                                                    <span className="text-sm font-medium">+{quest.progress}% tiến độ</span>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        {/* Completed Overlay */}
                                        {isCompleted && (
                                            <div className="absolute inset-0 bg-green-500/5 rounded-2xl pointer-events-none">
                                                <div className="absolute top-4 right-4">
                                                    <i className="fas fa-check-circle text-2xl text-green-500"></i>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};
