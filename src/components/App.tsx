import { useState } from 'react'
import "../App.css"
import { Routes, Route, Navigate } from 'react-router'
import Home from './core/Home'
import { useAuth } from './hooks'
import { AppContextProvider } from '../context/AppContext'

function App() {
  // const { user, isLoading, error } = useAuth();

  return (
    <>
      <AppContextProvider>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AppContextProvider>
    </>
  )
}

export default App;
