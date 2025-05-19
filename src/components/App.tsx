import { useState } from 'react'
import "../App.css"
import { Routes, Route, Navigate } from 'react-router'
import { useAuth } from './hooks'
import { AppContextProvider } from '../context/AppContext'
import { Login, Home } from './core'

function AppRoutes() {
  const { isLoggedIn } = useAuth();

  return (
    <Routes>
      <Route path="/" element={<Navigate to={isLoggedIn ? "/home" : "/login"} replace />} />
      <Route path="/home" element={<Home />} />
      <Route path="/login" element={<Login />} />
    </Routes>
  );
}

function App() {
  return (
    <AppContextProvider>
      <AppRoutes />
    </AppContextProvider>
  )
}

export default App;
