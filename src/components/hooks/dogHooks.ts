import type { Dog, DogLocation } from "@/models";
import { getDogs } from "@/services/proxy";
import { useEffect, useState } from "react";
import { useStorage, useZipCodes } from ".";

/*
  Handles liked dogs state management
*/
export const useLikedDogs = () => {
  const { getItem, setItem } = useStorage();
  const [likedDogs, setLikedDogs] = useState<string[]>(getItem("likedDogs") || []);

  useEffect(() => {
    setItem("likedDogs", likedDogs);
  }, [likedDogs, setItem]);

  const handleLikeChange = (dogId: string) => {
    if (likedDogs.includes(dogId)) {
      setLikedDogs([...likedDogs.filter(id => id !== dogId)]);
    } else {
      setLikedDogs([...likedDogs, dogId]);
    }
  };

  return { likedDogs, handleLikeChange };
};

/*
  Handles fetching and managing dog data
*/
export const useDog = (ids: string[]) => {
  const [dogs, setDogs] = useState<Dog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Responsible for fetching the dogs that show up as cards.
  useEffect(() => {
    setIsLoading(true);
    getDogs(ids).then((dogs: Dog[]) => {
      setDogs(dogs);
      setIsLoading(false);
    }).catch(error => {
      console.error(error);
      setIsLoading(false);
    });
  }, [JSON.stringify(ids)]);

  return { dogs, isLoading };
};
