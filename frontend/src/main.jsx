// main.jsx
// LEARNING NOTE:
// This is the ENTRY POINT of a React application.
// React renders our entire app into the <div id="root"> in index.html.
// StrictMode is a React tool that helps find bugs during development.

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
