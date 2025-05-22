import type { Dog } from "@/models";
import { getDogs } from "@/services/proxy";
import { useEffect, useState } from "react";
import { useStorage } from ".";

/*
  Handles the following:

  1. Dog objects
  2. Liked dogs
*/
export const useDog = (ids: string[]) => {

  const [dogs, setDogs] = useState<Dog[]>([]);
  const { getItem, setItem } = useStorage();
  const [likedDogs, setLikedDogs] = useState<string[]>(getItem("likedDogs") || []);

  // Responsible for fetching the dogs that show up as cards.
  useEffect(() => {
    getDogs(ids).then((dogs: Dog[]) => {
      setDogs(dogs);
    }).catch(error => {
      console.error(error);
    });
  }, [JSON.stringify(ids)]);

  // Save liked dogs to localStorage whenever they change
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

  return { dogs, likedDogs, handleLikeChange };
}
