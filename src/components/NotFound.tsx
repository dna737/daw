import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "./hooks";

export default function NotFound() {
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(3);
  const { isLoggedIn } = useAuth();

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          navigate("/");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [navigate]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-2xl font-bold mb-4">Sorry, the page you are looking for does not exist.</h1>
      <p className="text-gray-600">Redirecting to {isLoggedIn ? "Home" : "Login"} page{countdown > 0 && (" in " + countdown)}...</p>
    </div>
  );
}
