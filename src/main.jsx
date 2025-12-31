import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { registerSW } from 'virtual:pwa-register'

const updateSW = registerSW({
  onNeedRefresh() {
    console.log('SW: New content available, click to reload')
  },
  onOfflineReady() {
    console.log('SW: Ready for offline usage')
  },
  onRegistered(r) {
    console.log('SW: Registered:', r)
  },
  onRegisterError(error) {
    console.error('SW: Registration error:', error)
  }
})

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
