import { useEffect, useState } from "react";
import { getDogs, getMatch } from "@/services/proxy";
import type { Dog } from "@/models";
import Header from "./Header";
import { DogCard } from ".";
import { useLikedDogs } from "../hooks";

export default function Matches() {

  const [matchDog, setMatchDog] = useState<Dog | null>(null);
  const { likedDogs } = useLikedDogs();

  useEffect(() => {
    getMatch(likedDogs).then((match) => {
      getDogs([match.match]).then((dogs) => {
        setMatchDog(dogs[0]); // getMatch only returns one dog.
      });
    });
  }, [likedDogs]);

  return (
    <div className="flex flex-col items-center gap-4 p-4">
      <Header 
      title="Matches"
      links={[
        {name: "Home", path: "/", className: "bg-black text-white"},
        {name: "Favorites", path: "/favorites", className: "bg-red-500 text-white"}
      ]} />
      {matchDog && <DogCard dog={matchDog} />}
    </div>
  );
}
