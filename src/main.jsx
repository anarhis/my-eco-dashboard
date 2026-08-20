import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { seedDatabase } from './db/dexieDB'

// Инициализируем локальную базу данных моковыми данными
seedDatabase().catch(err => console.error("Database seed error:", err));

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
