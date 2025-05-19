import { useState } from 'react'
import "../App.css"
import { Routes, Route, Navigate } from 'react-router'
import Home from './core/Home'
import { useAuth } from './hooks'
import { AppContextProvider } from '../context/AppContext'

function App() {
  // const { isLoggedIn } = useAuth();
  const isLoggedIn = true;

  return (
    <>
      <AppContextProvider>
        <Routes>
          <Route path="/" element={isLoggedIn ? <Home /> : <Navigate to="/login" replace />} />
          {/* TODO: Use DelayedRedirect for routes later */}
          {isLoggedIn ? (
            <>
            </>
          ) : (
            <>
            </>
          )}
        </Routes>
      </AppContextProvider>
    </>
  )
}

export default App;
