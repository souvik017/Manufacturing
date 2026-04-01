import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'   // ✅ ADD THIS
import './index.css'
import App from './App.jsx'
import { store } from './redux/store.js'
import { Provider } from 'react-redux'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      <BrowserRouter>   {/* ✅ THIS FIXES YOUR ERROR */}
        <App />
      </BrowserRouter>
    </Provider>
  </StrictMode>,
)