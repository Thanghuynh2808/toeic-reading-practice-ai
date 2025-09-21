# 🎯 TOEIC Reading Practice AI

<div align="center">

![TOEIC Reading Practice AI](https://img.shields.io/badge/TOEIC-Reading_Practice-blue?style=for-the-badge)
![React](https://img.shields.io/badge/React-19.1.1-61DAFB?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8.2-3178C6?style=for-the-badge&logo=typescript)
![Vite](https://img.shields.io/badge/Vite-6.2.0-646CFF?style=for-the-badge&logo=vite)

**Intelligent TOEIC Reading practice with AI-powered questions, vocabulary learning, and personalized feedback**

[View in AI Studio](https://ai.studio/apps/drive/1QJkN5iMDmWD0sa-nZlDOB02LkMSn9LdO) • [Live Demo](#) • [Documentation](#features)

</div>

## ✨ Features

### 🧠 **AI-Powered Practice**
- **Dynamic Question Generation**: AI creates unique TOEIC questions for Parts 5, 6, and 7
- **Intelligent Analysis**: Get personalized explanations for your mistakes
- **Adaptive Difficulty**: Questions adapt to your progress level

### 📚 **Smart Vocabulary System**
- **Click-to-Learn**: Click any word in passages to get instant definitions
- **Spaced Repetition**: Scientific review system to maximize retention
- **Visual Learning**: Auto-generated images for better memorization
- **Progress Tracking**: Monitor your vocabulary growth

### 🎮 **Gamified Learning**
- **Daily Quests**: Complete challenges to stay motivated
- **Streak Tracking**: Build and maintain your study streak
- **Virtual Plant**: Watch your learning plant grow with progress
- **Achievement System**: Unlock rewards as you improve

### 🎨 **Modern User Experience**
- **Responsive Design**: Perfect on desktop, tablet, and mobile
- **Dark/Light Mode**: Comfortable studying in any lighting
- **Glassmorphism UI**: Beautiful, modern interface design
- **Vietnamese Support**: Full localization for Vietnamese learners

## 🚀 Quick Start

### Prerequisites
- **Node.js** (16.0 or higher)
- **Gemini API Key** ([Get one here](https://makersuite.google.com/app/apikey))
- **Unsplash API Key** (Optional, for vocabulary images)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/toeic-reading-practice-ai.git
   cd toeic-reading-practice-ai
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   # Copy the example file
   cp .env.example .env.local
   
   # Edit .env.local with your API keys
   GEMINI_API_KEY=your_gemini_api_key_here
   UNSPLASH_ACCESS_KEY=your_unsplash_key_here  # Optional
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:3000`

## 🛠️ Tech Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS
- **Build Tool**: Vite 6.2
- **AI Integration**: Google Gemini API
- **Images**: Unsplash API
- **Styling**: Modern Glassmorphism design
- **State Management**: React Hooks + localStorage
- **Icons**: Font Awesome 6

## 📱 Supported TOEIC Parts

### Part 5: Incomplete Sentences
- Grammar and vocabulary questions
- Single sentence completion
- 4 multiple choice options

### Part 6: Text Completion  
- Short business documents
- Fill-in-the-blank format
- Context-based questions

### Part 7: Reading Comprehension
- Business advertisements and documents
- Comprehension questions
- Detail and inference testing

## 🎯 Learning Features

### Vocabulary System
```typescript
interface WordInfo {
  translation: string;      // Vietnamese translation
  example: string;         // Example sentence
  phonetic: string;        // Pronunciation guide
  visualDescription: string; // For image generation
  imageUrl: string;        // Generated visual aid
}
```

### Spaced Repetition Algorithm
- Level 1: Review after 1 day
- Level 2: Review after 3 days  
- Level 3: Review after 7 days
- Level 4: Review after 15 days
- Level 5: Review after 30 days

## 🏗️ Project Structure

```
├── components/           # React components
│   ├── ErrorBoundary.tsx   # Error handling
│   ├── PracticeArea.tsx    # Main practice interface
│   ├── VocabularyList.tsx  # Vocabulary management
│   ├── Mascot.tsx          # Interactive assistant
│   └── ...
├── services/            # API services
│   └── geminiService.ts    # AI integration
├── lib/                 # Utility functions
├── types.ts            # TypeScript definitions
├── assets/             # Static assets
└── index.css           # Global styles
```

## 🚀 Build and Deploy

### Development
```bash
npm run dev          # Start dev server
npm run build        # Build for production
npm run preview      # Preview production build
```

### Production Deployment
1. Build the project: `npm run build`
2. Deploy the `dist/` folder to your hosting provider
3. Configure environment variables on your hosting platform

### Recommended Hosting
- **Vercel** (recommended for React apps)
- **Netlify** 
- **GitHub Pages**
- **AWS S3 + CloudFront**

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Google Gemini** for AI-powered question generation
- **Unsplash** for beautiful vocabulary images
- **Font Awesome** for comprehensive iconography
- **Tailwind CSS** for utility-first styling

## 📞 Support

- 📧 Email: your-email@example.com
- 💬 Discord: [Join our community](#)
- 🐛 Issues: [GitHub Issues](https://github.com/your-username/toeic-reading-practice-ai/issues)

---

<div align="center">

**Built with ❤️ for TOEIC learners worldwide**

[⭐ Star this repo](https://github.com/your-username/toeic-reading-practice-ai) • [🍴 Fork it](https://github.com/your-username/toeic-reading-practice-ai/fork) • [📝 Report Bug](https://github.com/your-username/toeic-reading-practice-ai/issues)

</div>
