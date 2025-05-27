import { useEffect, useState } from "react";
import { MATCH_PAGE_VISITED_KEY } from "../utils";


export const useMatch = (likedDogsLength: number) => {
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    const hasVisited = localStorage.getItem(MATCH_PAGE_VISITED_KEY);
    console.log("if condition", !hasVisited && likedDogsLength > 0);
    if (!hasVisited && likedDogsLength > 0) {
      setShowConfetti(true);
      localStorage.setItem(MATCH_PAGE_VISITED_KEY, 'true');
      setTimeout(() => setShowConfetti(false), 5000);
    }
  }, []);

  return { showConfetti };
}
