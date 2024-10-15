import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import Home from './Home.tsx'
import './index.css'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import PollDetails from './PollDetails.tsx'
import { WebSocketProvider } from './WebSocketContext.tsx'

createRoot(document.getElementById('root')!).render(
 <WebSocketProvider>
  <StrictMode>
      <Router>
        <Routes>
          <Route path='/' element={<Home />} />
          <Route path='/poll' element={<Home />} />
          <Route path='/poll/:id' element={<PollDetails />} />
        </Routes>
      </Router>
  </StrictMode>
</WebSocketProvider>
)
