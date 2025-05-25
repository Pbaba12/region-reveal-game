import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="py-6 text-center">
      <h1 className="text-4xl sm:text-5xl font-bold">
        <span className="text-cyan-400">Region</span> Reveal{' '}
        <span className="text-pink-500">Nation</span>
      </h1>
      <p className="text-slate-400 mt-2 text-sm sm:text-base">
        Can you identify the nation from three of its regions/states?
      </p>
    </header>
  );
};

export default Header;