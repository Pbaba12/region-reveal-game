import React from 'react';

// interface RestartButtonProps removed
const RestartButton = ({ onRestart, isVisible }) => { // Removed React.FC and prop types
  if (!isVisible) {
    return null;
  }

  return (
    <button
      onClick={onRestart}
      className="mt-8 px-8 py-3 bg-pink-600 hover:bg-pink-500 text-white font-semibold rounded-lg transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-pink-400 focus:ring-offset-2 focus:ring-offset-slate-900 text-lg w-full sm:w-auto"
    >
      Play Again?
    </button>
  );
};

export default RestartButton;