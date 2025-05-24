import "../App.css"
import { Routes, Route } from "react-router"
import { useAuth } from './hooks'
import { AppContextProvider } from '../context/AppContext'
import { Login, Home, Favorites, Match } from './core'
import NotFound from "./NotFound"

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
          <Route path="/" element={<Home />} />
          <Route path="/favorites" element={<Favorites />} />
          <Route path="/match" element={<Match />} />
        </>
      )}
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
