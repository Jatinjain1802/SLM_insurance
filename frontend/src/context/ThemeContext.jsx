// context/ThemeContext.jsx
// LEARNING NOTE:
// React Context provides a way to pass data through the component tree
// without having to pass props down manually at every level.
// Here we use Context to store the current theme ('light' or 'dark')
// so any component can access the theme and toggle it easily.

import React, { createContext, useContext, useState, useEffect } from 'react';

// 1. Create the Context
const ThemeContext = createContext();

// 2. Create the Provider component
export function ThemeProvider({ children }) {
  // Initialize from localStorage or default to 'dark'
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem('app-theme');
    return savedTheme ? savedTheme : 'dark';
  });

  // Whenever the theme changes, update the <html> element and save to localStorage
  useEffect(() => {
    // This adds data-theme="light" or data-theme="dark" to the <html> tag.
    // Our CSS will react to this attribute to change variables.
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('app-theme', theme);
  }, [theme]);

  // Helper function to switch theme
  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  // Provide the theme state and toggle function to the rest of the app
  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

// 3. Custom hook to use the ThemeContext easily
export function useTheme() {
  return useContext(ThemeContext);
}
