// App.js (Updated)
import React from 'react'
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom'
import Register from './authentification/Register'
import Login from './authentification/Login'
import Home from './pda/Home'
function App() {
  return (
    <Router>
      <Routes>
        <Route path='/register' element={<Register />} />
        <Route path='/login' element={<Login />} />
        <Route path='/home' element={<Home />} />
        <Route path='/' element={<Login />} /> {/* Route par défaut */}
      </Routes>
    </Router>
  )
}

export default App
