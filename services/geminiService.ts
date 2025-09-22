import { GoogleGenAI, Type } from "@google/genai";
import type { PracticeSet, WordInfo, MistakeAnalysis } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

function createPromptAndSchema(part: number): { prompt: string, schema: any } {
    const questionSchema = {
        type: Type.OBJECT,
        properties: {
            id: { type: Type.STRING, description: "A unique identifier for the question, e.g., 'q1'." },
            questionText: { type: Type.STRING, description: "The full text of the question, including the blank for Part 5 or the full question for Parts 6 & 7." },
            options: { 
                type: Type.ARRAY, 
                items: { type: Type.STRING },
                description: "An array of four string options, e.g., ['(A) option one', '(B) option two', ...]"
            },
            correctAnswer: { type: Type.STRING, description: "The correct option string, exactly as it appears in the options array." },
            explanation: { type: Type.STRING, description: "A brief explanation of why the answer is correct." },
        },
        required: ["id", "questionText", "options", "correctAnswer", "explanation"]
    };

    switch (part) {
        case 5:
            return {
                prompt: `Generate 5 unique multiple-choice questions for TOEIC Reading Part 5. Each question must be a single sentence with a blank. The questions should test English grammar and vocabulary in a business context. Topics should cover office communication, marketing, or personnel. Provide four distinct options (A, B, C, D) for each question.`,
                schema: {
                    type: Type.OBJECT,
                    properties: {
                        part: { type: Type.INTEGER },
                        questions: {
                            type: Type.ARRAY,
                            items: questionSchema,
                            description: "An array of 5 Part 5 questions."
                        }
                    },
                    required: ["part", "questions"]
                }
            };
        case 6:
            return {
                prompt: `Generate a text for TOEIC Reading Part 6 with 4 blanks. The text should be a business document like an email, notice, or letter, about 100-150 words long, on the topic of a company event. For each blank, provide a corresponding multiple-choice question with four distinct options (A, B, C, D). One of the questions must be a full sentence choice.`,
                schema: {
                    type: Type.OBJECT,
                    properties: {
                        part: { type: Type.INTEGER },
                        passage: { type: Type.STRING, description: "The full passage text with placeholders like '[1]' for the blanks." },
                        questions: {
                            type: Type.ARRAY,
                            items: questionSchema,
                            description: "An array of 4 questions corresponding to the blanks in the passage."
                        }
                    },
                    required: ["part", "passage", "questions"]
                }
            };
        case 7:
            return {
                prompt: `Generate a single reading passage for TOEIC Reading Part 7. The passage should be a business advertisement for a new service, about 150-200 words. After the passage, create 3 multiple-choice questions that test comprehension of the text. Questions should cover main purpose, specific details, and inferences. Provide four distinct options (A, B, C, D) for each question.`,
                schema: {
                    type: Type.OBJECT,
                    properties: {
                        part: { type: Type.INTEGER },
                        passage: { type: Type.STRING, description: "The full passage text for Part 7." },
                        questions: {
                            type: Type.ARRAY,
                            items: questionSchema,
                            description: "An array of 3 questions based on the passage."
                        }
                    },
                    required: ["part", "passage", "questions"]
                }
            };
        default:
            throw new Error("Invalid part number");
    }
}


export const generateToeicQuestions = async (part: number): Promise<PracticeSet> => {
    const { prompt, schema } = createPromptAndSchema(part);

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: schema,
        },
    });

    try {
        const jsonText = response.text.trim();
        const data = JSON.parse(jsonText);
        return data as PracticeSet;
    } catch (e) {
        console.error("Failed to parse JSON response:", response.text);
        throw new Error("Received malformed data from the API.");
    }
};

export const getWordInfo = async (word: string): Promise<Omit<WordInfo, 'imageUrl'>> => {
    const schema = {
        type: Type.OBJECT,
        properties: {
            translation: { type: Type.STRING, description: "The Vietnamese translation of the word." },
            example: { type: Type.STRING, description: "A simple English sentence using the word." },
            phonetic: { type: Type.STRING, description: "The IPA phonetic transcription of the word, e.g., /həˈloʊ/." },
            visualDescription: { type: Type.STRING, description: "A short, vivid, and concrete description of the word for an AI image generator. Focus on objects, scenes, or actions. Avoid abstract concepts or text." },
        },
        required: ["translation", "example", "phonetic", "visualDescription"],
    };

    const prompt = `Provide comprehensive information for the English word: "${word}".

Return:
1. Vietnamese translation (most common meaning)
2. Simple example sentence using the word in context  
3. IPA phonetic transcription with stress marks
4. Visual description: Create a vivid, specific visual scene that represents this word's meaning. Focus on:
   - Concrete objects, people, actions, or settings
   - Visual elements that clearly represent the word's concept
   - Specific details that make the scene searchable on image databases
   - Avoid abstract concepts, emotions, or text-based descriptions
   
Examples of good visual descriptions:
- "meeting" → "business people sitting around conference table in modern office"
- "cooking" → "chef preparing food in professional kitchen with pots and ingredients"
- "education" → "teacher explaining lesson to students in bright classroom"`;

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: schema,
        },
    });

    try {
        const jsonText = response.text.trim();
        const data = JSON.parse(jsonText);
        return data;
    } catch (e) {
        console.error("Failed to parse JSON response for word info:", response.text);
        throw new Error("Received malformed data from the API for word lookup.");
    }
};

export const generateImageForWord = async (visualDescription: string, word?: string): Promise<string> => {
    try {
        // Use Gemini to create better search query from visual description
        const queryPrompt = `From this visual description: "${visualDescription}"
        
Extract the most important visual elements and create a short, specific search query (2-4 words) for finding relevant photos on Unsplash. 
Focus on:
- Concrete objects, actions, or scenes mentioned
- Key visual elements that represent the word's meaning
- Avoid abstract concepts or text
- Use simple, common English words

Examples:
- "office meeting discussion" → "business meeting office"
- "cooking food kitchen" → "cooking chef kitchen"
- "car driving road" → "car highway driving"

Return only the search query, nothing else.`;

        const queryResponse = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: queryPrompt,
        });

        let searchQuery = queryResponse.text.trim().replace(/['"]/g, '');
        
        // Fallback to basic keyword extraction if Gemini fails
        if (!searchQuery || searchQuery.length < 3) {
            const keywords = visualDescription
                .toLowerCase()
                .replace(/[^a-z\s]/g, '')
                .split(' ')
                .filter(word => word.length > 2)
                .slice(0, 3)
                .join(' ');
            searchQuery = keywords || 'education learning';
        }
        
        // Add word context if available
        if (word) {
            searchQuery = `${word} ${searchQuery}`.substring(0, 50); // Limit length
        }
        
        console.log(`Searching Unsplash for: "${searchQuery}"`);
        
        const response = await fetch(
            `https://api.unsplash.com/search/photos?query=${encodeURIComponent(searchQuery)}&page=1&per_page=20&orientation=landscape&content_filter=high`,
            {
                headers: {
                    'Authorization': `Client-ID ${process.env.UNSPLASH_ACCESS_KEY}`,
                },
            }
        );

        if (!response.ok) {
            throw new Error(`Unsplash API error: ${response.status}`);
        }

        const data = await response.json();
        
        if (data.results && data.results.length > 0) {
            // Prefer images with higher likes/downloads for better quality
            const sortedImages = data.results.sort((a: any, b: any) => b.likes - a.likes);
            const selectedImage = sortedImages[Math.floor(Math.random() * Math.min(5, sortedImages.length))];
            return selectedImage.urls.regular;
        } else {
            // Try a more generic search if specific search fails
            const fallbackQuery = word || 'education';
            const fallbackResponse = await fetch(
                `https://api.unsplash.com/search/photos?query=${encodeURIComponent(fallbackQuery)}&page=1&per_page=10&orientation=landscape&content_filter=high`,
                {
                    headers: {
                        'Authorization': `Client-ID ${process.env.UNSPLASH_ACCESS_KEY}`,
                    },
                }
            );
            
            if (fallbackResponse.ok) {
                const fallbackData = await fallbackResponse.json();
                if (fallbackData.results && fallbackData.results.length > 0) {
                    const randomIndex = Math.floor(Math.random() * fallbackData.results.length);
                    return fallbackData.results[randomIndex].urls.regular;
                }
            }
            
            throw new Error('No relevant images found');
        }
    } catch(e) {
        console.error("Failed to fetch image from Unsplash:", e);
        // Return a more attractive placeholder image
        const placeholderText = word ? encodeURIComponent(word) : 'Vocabulary';
        return `https://via.placeholder.com/400x300/667eea/FFFFFF?text=${placeholderText}`;
    }
};

export const generateClozeQuestion = async (word: string): Promise<{ sentence: string }> => {
    const schema = {
        type: Type.OBJECT,
        properties: {
            sentence: {
                type: Type.STRING,
                description: "A new, simple English sentence that provides context for the word, with the word itself replaced by '[BLANK]'.",
            },
        },
        required: ["sentence"],
    };

    const prompt = `Create a simple, new fill-in-the-blank sentence for the English word "${word}". The sentence should provide clear context. Replace the word "${word}" with the placeholder "[BLANK]".`;

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: schema,
        },
    });

    try {
        const jsonText = response.text.trim();
        return JSON.parse(jsonText);
    } catch (e) {
        console.error("Failed to parse JSON for cloze question:", response.text);
        throw new Error("Received malformed data from the API for cloze question.");
    }
};

export const analyzeMistake = async (params: {
    questionText: string;
    options: string[];
    correctAnswer: string;
    userAnswer: string;
    passage?: string;
}): Promise<MistakeAnalysis> => {
    const { questionText, options, correctAnswer, userAnswer, passage } = params;

    const context = passage ? `Given the passage:\n"""${passage}"""\n\n` : '';

    const prompt = `
        You are an expert TOEIC tutor. A student is practicing and has made a mistake.
        Analyze their error and provide a clear, helpful explanation.

        ${context}

        Here is the question:
        Question: "${questionText}"
        Options: ${options.join(', ')}

        The student chose: "${userAnswer}"
        The correct answer is: "${correctAnswer}"

        Please provide an analysis with the following structure:
        ### Tại sao câu trả lời của bạn chưa chính xác
        [Explain in Vietnamese why the user's answer is wrong]

        ### Tại sao đáp án đúng lại chính xác
        [Explain in Vietnamese why the correct answer is right]

        ### Bài học rút ra
        [Identify the type of mistake and give a tip in Vietnamese]

        Keep the explanation concise and encouraging. Use simple markdown for bolding key terms like **this**. Do not use any other markdown.
    `;
    
    const schema = {
        type: Type.OBJECT,
        properties: {
            analysis: { 
                type: Type.STRING, 
                description: "A detailed analysis of the user's mistake in Vietnamese, formatted with '###' Headings and **bold** text."
            },
        },
        required: ["analysis"],
    };

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: schema,
        },
    });

    try {
        const jsonText = response.text.trim();
        return JSON.parse(jsonText) as MistakeAnalysis;
    } catch (e) {
        console.error("Failed to parse JSON for mistake analysis:", response.text);
        throw new Error("Received malformed data from the API for mistake analysis.");
    }
};
