import { useEffect, useState } from "react";
import { MATCH_PAGE_VISITED_KEY } from "../utils";


export const useMatch = () => {
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    const hasVisited = localStorage.getItem(MATCH_PAGE_VISITED_KEY);
    if (!hasVisited) {
      setShowConfetti(true);
      localStorage.setItem(MATCH_PAGE_VISITED_KEY, 'true');
      setTimeout(() => setShowConfetti(false), 5000);
    }
  }, []);

  return { showConfetti };
}
