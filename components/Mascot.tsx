import React, { useState, useEffect, useRef } from 'react';

const mascotPoses = {
    idle: '/assets/mascot-idle.png',
    explaining: '/assets/mascot-explaining.png',
    correct: '/assets/mascot-correct.png',
    thinking: '/assets/mascot-thinking.png',
};

export type MascotPose = keyof typeof mascotPoses;

interface MascotProps {
    isVisible: boolean;
    message: string;
    pose: MascotPose;
}

export const Mascot: React.FC<MascotProps> = ({ isVisible, message, pose }) => {
    const [isRendered, setIsRendered] = useState(false);
    const [displayedMessage, setDisplayedMessage] = useState('');
    const typingIntervalRef = useRef<number | null>(null);

    useEffect(() => {
        if (isVisible) {
            setIsRendered(true);
        } else {
            // Clear any ongoing typing when hiding
            if (typingIntervalRef.current) {
                clearInterval(typingIntervalRef.current);
                typingIntervalRef.current = null;
            }
            setDisplayedMessage('');
            const timer = setTimeout(() => setIsRendered(false), 300);
            return () => clearTimeout(timer);
        }
    }, [isVisible]);

    // Typing effect for the message
    useEffect(() => {
        // Clear any existing typing interval
        if (typingIntervalRef.current) {
            clearInterval(typingIntervalRef.current);
            typingIntervalRef.current = null;
        }

        if (isVisible && message) {
            setDisplayedMessage(''); // Clear previous message first
            let i = 0;
            typingIntervalRef.current = setInterval(() => {
                if (i < message.length) {
                    setDisplayedMessage(message.substring(0, i + 1));
                    i++;
                } else {
                    if (typingIntervalRef.current) {
                        clearInterval(typingIntervalRef.current);
                        typingIntervalRef.current = null;
                    }
                }
            }, 30);
            
            // Cleanup function
            return () => {
                if (typingIntervalRef.current) {
                    clearInterval(typingIntervalRef.current);
                    typingIntervalRef.current = null;
                }
            };
        }
    }, [message, isVisible]);


    if (!isRendered) return null;

    return (
        <div 
            className={`fixed bottom-6 right-6 z-50 flex items-end gap-4 transition-all duration-500 ease-out ${isVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-8 scale-95'}`}
            role="alert"
            aria-live="polite"
        >
            {/* Chat Bubble */}
            <div 
                className="chat-bubble p-4 rounded-2xl rounded-br-md shadow-2xl max-w-xs border relative"
                style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.98)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    color: '#1e293b'
                }}
            >
                {/* Typing indicator dots */}
                {isVisible && message && displayedMessage.length < message.length && (
                    <div className="flex space-x-1 mb-2">
                        <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                        <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                    </div>
                )}
                
                <p 
                    className="leading-relaxed font-medium" 
                    style={{
                        color: '#000000', 
                        fontSize: '0.95rem', 
                        fontWeight: '500',
                        textShadow: '0 0 1px rgba(255,255,255,0.8)',
                        opacity: 1,
                        visibility: 'visible',
                        fontFamily: 'Noto Sans, Inter, Segoe UI, sans-serif'
                    }}
                >
                    {displayedMessage}
                    {isVisible && message && displayedMessage.length < message.length && (
                        <span className="inline-block w-1 h-4 bg-blue-500 ml-1 animate-pulse"></span>
                    )}
                </p>
            </div>

            {/* Mascot Image */}
            <div className="mascot-container floating relative">
                <div className="w-32 h-auto relative">
                    <img src={mascotPoses[pose]} alt="Mascot assistant" className="w-full h-auto drop-shadow-2xl" />
                    
                    {/* Decorative glow effect */}
                    <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-400/20 to-purple-400/20 blur-xl -z-10 animate-pulse"></div>
                </div>
            </div>
        </div>
    );
};