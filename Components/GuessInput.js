import React from 'react';

// interface GuessInputProps removed
const GuessInput = ({ // Removed React.FC and prop types
  currentGuess,
  onGuessChange,
  onSubmitGuess,
  isDisabled,
}) => {
  const handleInputChange = (e) => { // Removed React.ChangeEvent type
    onGuessChange(e.target.value);
  };

  const handleKeyPress = (e) => { // Removed React.KeyboardEvent type
    if (e.key === 'Enter' && !isDisabled && currentGuess.trim() !== '') {
      onSubmitGuess();
    }
  };

  return (
    <div className="flex flex-col sm:flex-row items-center gap-3 mt-6">
      <input
        type="text"
        value={currentGuess}
        onChange={handleInputChange}
        onKeyPress={handleKeyPress}
        placeholder="Enter the country name"
        disabled={isDisabled}
        className="w-full sm:w-auto flex-grow px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-slate-100 placeholder-slate-400 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-shadow duration-150 text-center sm:text-left text-lg"
        aria-label="Enter your guess for the country"
      />
      <button
        onClick={onSubmitGuess}
        disabled={isDisabled || currentGuess.trim() === ''}
        className="w-full sm:w-auto px-8 py-3 bg-cyan-500 hover:bg-cyan-400 disabled:bg-slate-600 disabled:cursor-not-allowed text-slate-900 font-semibold rounded-lg transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-cyan-300 focus:ring-offset-2 focus:ring-offset-slate-900 text-lg"
      >
        Guess
      </button>
    </div>
  );
};

export default GuessInput;