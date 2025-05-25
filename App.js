// Forcing a refresh - version 3
import React, { useState, useEffect, useCallback } from 'react';
// ... rest of your App.js code
// --- START OF FILE App.js (NEW VERSION) ---
import React, { useState, useEffect, useCallback } from 'react';
import ReactDOM from 'react-dom/client'; // Import ReactDOM here
import Header from './components/Header.js';
import GuessInput from './components/GuessInput.js';
import FeedbackDisplay from './components/FeedbackDisplay.js';
import RestartButton from './components/RestartButton.js';
import {
  getRegionChallengeDetails,
  evaluateCountryGuess,
  getWinMessage,
  isApiKeyAvailable as checkApiKey
} from './services/geminiService.js';

const AppContent = () => { // Renamed original App to AppContent
  const [gameState, setGameState] = useState({
    regions: [],
    secretCountry: '',
    aiQuestion: 'Loading regions and mystery nation...',
    currentGuess: '',
    feedbackMessage: '',
    statusMessage: '',
    guessCount: 0,
    gameOver: false,
    isLoadingAI: true,
    isCorrectGuess: false,
  });
  const [apiKeyAvailable, setApiKeyAvailable] = useState(false);
  const [showApiKeyWarning, setShowApiKeyWarning] = useState(false);

  const initializeGame = useCallback(async (isRestart = false) => {
    setGameState(prev => ({
      ...prev,
      isLoadingAI: true,
      statusMessage: '',
      feedbackMessage: isRestart ? 'Fetching new regions...' : 'Loading regions and mystery nation...',
      aiQuestion: isRestart ? 'One moment...' : 'Loading regions and mystery nation...',
      regions: [],
      isCorrectGuess: false,
    }));
    
    const keyAvailable = checkApiKey();
    setApiKeyAvailable(keyAvailable);
    if (!keyAvailable && !isRestart) {
      setShowApiKeyWarning(true);
    }

    const challenge = await getRegionChallengeDetails();
    setGameState(prev => ({
      ...prev,
      regions: challenge.regions,
      secretCountry: challenge.country,
      aiQuestion: challenge.playerQuestion,
      feedbackMessage: '',
      statusMessage: '',
      currentGuess: '',
      guessCount: 0,
      gameOver: false,
      isLoadingAI: false,
      isCorrectGuess: false,
    }));
  }, []);

  useEffect(() => {
    initializeGame();
  }, [initializeGame]);

  const handleGuessChange = (value) => {
    setGameState(prev => ({ ...prev, currentGuess: value }));
  };

  const handleSubmitGuess = useCallback(async () => {
    if (gameState.currentGuess.trim() === '') {
      setGameState(prev => ({ ...prev, feedbackMessage: "Please enter your guess for the country.", statusMessage: "Empty guess" }));
      return;
    }
    setGameState(prev => ({ ...prev, isLoadingAI: true, guessCount: prev.guessCount + 1, statusMessage: '', feedbackMessage: '', isCorrectGuess: false }));
    const evaluation = await evaluateCountryGuess(gameState.regions, gameState.secretCountry, gameState.currentGuess);
    if (evaluation.isCorrect) {
      const congratsMessage = await getWinMessage(gameState.guessCount, gameState.secretCountry); // guessCount already incremented
      setGameState(prev => ({ ...prev, feedbackMessage: congratsMessage, statusMessage: "Correct!", gameOver: true, isLoadingAI: false, isCorrectGuess: true }));
    } else {
      let status = "Incorrect";
      if (evaluation.isClose) status = "Close!";
      setGameState(prev => ({ ...prev, feedbackMessage: evaluation.feedback, statusMessage: status, currentGuess: '', isLoadingAI: false, isCorrectGuess: false }));
    }
  }, [gameState.regions, gameState.secretCountry, gameState.currentGuess, gameState.guessCount]);

  const handleRestartGame = () => {
    initializeGame(true);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-br from-slate-900 via-slate-800 to-gray-900 selection:bg-cyan-500 selection:text-cyan-900">
      <div className="w-full max-w-xl mx-auto">
        <Header />
        {showApiKeyWarning && !apiKeyAvailable && (
          <div className="my-4 p-3 bg-yellow-500/20 border border-yellow-600 text-yellow-300 rounded-md text-sm text-center">
            <strong>Warning:</strong> Gemini API key not found. AI-powered features are disabled. The game will use basic fallback data.
          </div>
        )}
        <main className="mt-4 bg-slate-800/50 p-6 sm:p-8 rounded-xl shadow-2xl backdrop-blur-md border border-slate-700">
          <FeedbackDisplay regions={gameState.regions} aiQuestion={gameState.aiQuestion} aiFeedbackMessage={gameState.feedbackMessage} statusMessage={gameState.statusMessage} guessCount={gameState.guessCount} isLoadingAI={gameState.isLoadingAI} gameOver={gameState.gameOver} isCorrectGuess={gameState.isCorrectGuess} />
          {!gameState.gameOver && (
            <GuessInput currentGuess={gameState.currentGuess} onGuessChange={handleGuessChange} onSubmitGuess={handleSubmitGuess} isDisabled={gameState.isLoadingAI || gameState.gameOver} />
          )}
          <div className="mt-6 flex justify-center">
             <RestartButton onRestart={handleRestartGame} isVisible={gameState.gameOver || (gameState.guessCount > 0 && !gameState.isLoadingAI)} />
          </div>
        </main>
        <footer className="text-center mt-8 text-slate-500 text-xs">
          <p>© {new Date().getFullYear()} Region Reveal. Powered by AI.</p>
        </footer>
      </div>
    </div>
  );
};

// New function to handle rendering
const renderApp = (rootElement) => {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <AppContent />
    </React.StrictMode>
  );
};

// Export the renderApp function and the component (though AppContent isn't directly used by index.js anymore)
export default { renderApp, AppContent }; // Exporting an object