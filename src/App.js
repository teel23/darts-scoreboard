import React, { useState, useEffect } from 'react';
import Home from './components/Home';
import Setup from './components/Setup';
import Game from './components/Game';
import Winner from './components/Winner';

export default function App() {
  const [screen, setScreen] = useState('home');
  const [gameConfig, setGameConfig] = useState(null);
  const [winnerData, setWinnerData] = useState(null);
  const [theme, setTheme] = useState(() => localStorage.getItem('darts-theme') || 'dark');

  // Apply theme to <html> so CSS vars work globally
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('darts-theme', theme);
  }, [theme]);

  const goHome = () => { setScreen('home'); setGameConfig(null); setWinnerData(null); };
  const goSetup = (mode) => { setScreen('setup'); setGameConfig({ mode }); };
  const startGame = (config) => { setGameConfig(config); setScreen('game'); };
  const endGame = (data) => { setWinnerData(data); setScreen('winner'); };
  const toggleTheme = () => setTheme(t => t === 'dark' ? 'light' : 'dark');

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      {screen === 'home'   && <Home onSelectMode={goSetup} theme={theme} onToggleTheme={toggleTheme} />}
      {screen === 'setup'  && <Setup config={gameConfig} onStart={startGame} onBack={goHome} />}
      {screen === 'game'   && <Game config={gameConfig} onEnd={endGame} onBack={goHome} />}
      {screen === 'winner' && <Winner data={winnerData} onPlayAgain={() => startGame(gameConfig)} onHome={goHome} />}
    </div>
  );
}
