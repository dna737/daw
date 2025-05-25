import "../App.css"
import { Routes, Route, Navigate } from "react-router"
import { useAuth } from './hooks'
import { AppContextProvider } from '../context/AppContext'
import { Login, Home, Favorites, Match, Logout } from './core'
import NotFound from "./NotFound";

function AppRoutes() {
  const { isLoggedIn } = useAuth();

  return (
    <Routes>
      {!isLoggedIn ? (
        <>
          <Route path="/login" element={<Login />} />
        </>
      ) : (
        <>
          <Route path="/home" element={<Home />} />
          <Route path="/favorites" element={<Favorites />} />
          <Route path="/match" element={<Match />} />
        </>
      )}

      <Route path="/logout" element={<Logout />} />
      <Route path="/" element={<Navigate to={isLoggedIn ? "/home" : "/login"} replace/>} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AppContextProvider>
      <AppRoutes />
    </AppContextProvider>
  );
}
