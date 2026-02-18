import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { ToastProvider } from './utils/ToastContext.jsx'
import './index.css'

console.log('🔥 main.jsx executing - app starting up!');

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ToastProvider>
      <App />
    </ToastProvider>
  </React.StrictMode>,
)
