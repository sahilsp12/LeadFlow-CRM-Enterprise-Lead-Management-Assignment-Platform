import React from 'react';
import { useTheme } from '../context/ThemeContext';

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      type="button"
      className="btn btn-outline-secondary border-0 rounded-circle p-2 d-flex align-items-center justify-content-center"
      style={{ width: '40px', height: '40px', transition: 'all 0.2s ease' }}
      title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
    >
      {theme === 'light' ? (
        <i className="bi bi-moon-fill text-dark" style={{ fontSize: '18px' }}></i>
      ) : (
        <i className="bi bi-sun-fill text-warning" style={{ fontSize: '18px' }}></i>
      )}
    </button>
  );
};

export default ThemeToggle;
