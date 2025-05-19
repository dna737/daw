import { useState } from 'react'
import "../App.css"
import { Routes, Route, Navigate } from 'react-router'
import Home from './core/Home'
import { useAuth } from './hooks'
import { AppContextProvider } from '../context/AppContext'
import { Login } from './core'

function App() {
  const { isLoggedIn } = useAuth();
  // const isLoggedIn = true;

  return (
    <>
      <AppContextProvider>
        <Routes>
          <Route path="/" element={
            <Navigate to={isLoggedIn ? "/home" : "/login"} replace />
          } />
          {/* TODO: Use DelayedRedirect for routes later */}
          {isLoggedIn ? (
            <>
              <Route path="/home" element={<Home />} />
            </>
          ) : (
            <>
              <Route path="/login" element={<Login />} />
            </>
          )}
        </Routes>
      </AppContextProvider>
    </>
  )
}

export default App;
