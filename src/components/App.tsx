import { useState } from 'react'
import "../App.css"
import { Routes, Route, Navigate } from 'react-router'
import { useAuth } from './hooks'
import { AppContextProvider } from '../context/AppContext'
import { Login, Home, Favorites } from './core'

function AppRoutes() {
  const { isLoggedIn } = useAuth();

  return (
    <Routes>
      <Route path="/" element={<Navigate to={isLoggedIn ? "/home" : "/login"} replace />} />
      {isLoggedIn ?
        <>
          <Route path="/home" element={<Home />} />
          <Route path="/favorites" element={<Favorites />} />
        </>
        :
        <>
          <Route path="/login" element={<Login />} />
        </>
      }
      <Route path="*" element={<h1>{"Sorry, the page you are looking for does not exist."}</h1>} />
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
