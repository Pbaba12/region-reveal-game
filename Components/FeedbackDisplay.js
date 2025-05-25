import React from 'react';
import LoadingSpinner from './LoadingSpinner.js';

// interface FeedbackDisplayProps removed
const FeedbackDisplay = ({ // Removed React.FC and prop types
  regions,
  aiQuestion,
  aiFeedbackMessage,
  statusMessage,
  guessCount,
  isLoadingAI,
  gameOver,
  isCorrectGuess
}) => {
  const getStatusColor = () => {
    if (isCorrectGuess) return 'text-green-400';
    if (statusMessage.toLowerCase().includes('close')) return 'text-yellow-400';
    if (statusMessage.toLowerCase().includes('incorrect')) return 'text-orange-400';
    return 'text-slate-300';
  };

  return (
    <div className="mt-6 p-6 bg-slate-800 rounded-lg shadow-xl min-h-[200px] flex flex-col justify-center items-center text-center">
      {isLoadingAI ? (
        <div className="flex flex-col items-center">
          <LoadingSpinner color="text-pink-500" size="w-8 h-8" />
          <p className="mt-3 text-slate-400 text-base">Gemini is searching the globe...</p>
        </div>
      ) : (
        <>
          {regions && regions.length > 0 && (
            <div className="mb-4">
              <h2 className="text-lg text-slate-400 mb-1">Consider these regions/states:</h2>
              <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
                {regions.map((region, index) => (
                  <span
                    key={index}
                    className="px-4 py-2 bg-slate-700 text-cyan-300 rounded-md text-base sm:text-lg font-medium shadow"
                  >
                    {region}
                  </span>
                ))}
              </div>
            </div>
          )}

          <p className="text-lg sm:text-xl text-pink-400 font-medium leading-relaxed mt-2 mb-1">
            {gameOver || aiFeedbackMessage ? aiFeedbackMessage : aiQuestion}
          </p>
          
          {statusMessage && !isCorrectGuess && (
            <p className={`mt-2 text-xl font-semibold ${getStatusColor()}`}>
              {statusMessage}
            </p>
          )}
        </>
      )}
      {!isLoadingAI && guessCount > 0 && (
        <p className="mt-4 text-sm text-slate-500">
          {`Guesses: ${guessCount}`}
        </p>
      )}
    </div>
  );
};

export default FeedbackDisplay;