import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import goodbyeGif from "@/assets/goodbye-animated-gif-sped-up.gif";

export default function Logout() {
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    if (countdown <= 0) {
      navigate("/");
      return;
    }

    const timer = setInterval(() => {
      setCountdown(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [countdown, navigate]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h3>Thanks for using the app -- see you soon!</h3>
      <img 
        src={goodbyeGif}
        alt="Goodbye animation" 
        className="mt-4 w-32 h-32 object-contain"
      />
    </div>
  )
   
}
