import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "./hooks";

export default function NotFound() {
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(3);
  const { isLoggedIn } = useAuth();

  useEffect(() => {
    if (countdown <= 0) {
      navigate(isLoggedIn ? "/" : "/login");
      return;
    }

    const timer = setInterval(() => {
      setCountdown(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [countdown, navigate, isLoggedIn]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-2xl font-bold mb-4">Sorry, the page you are looking for does not exist.</h1>
      <p className="text-gray-600">Redirecting to {isLoggedIn ? "Home" : "Login"} page{countdown > 0 && (" in " + countdown)}...</p>
    </div>
  );
}
