import { useEffect, useState } from "react";
import { getDogs, getMatch } from "@/services/proxy";
import type { Dog } from "@/models";
import { DogCard, NoFavorites, Header  } from ".";
import { useDog, useLikedDogs, useZipCodes } from "../hooks";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
import { Link } from "react-router";
import ReactConfetti from 'react-confetti';
import { useMatch } from "../hooks";

export default function Matches() {

  const [matchDog, setMatchDog] = useState<Dog | null>(null);
  const { likedDogs } = useLikedDogs();
  const { dogZipCodes } = useDog(likedDogs);
  const { dogLocations } = useZipCodes(dogZipCodes);
  const { showConfetti } = useMatch();

  useEffect(() => {
    if (likedDogs.length > 0) {
      getMatch(likedDogs).then((match) => {
        if (match && match.match) {
          getDogs([match.match]).then((dogs) => {
            if (dogs && dogs.length > 0) {
              setMatchDog(dogs[0]); 
            }
          });
        }
      }).catch(error => {
        console.error("Error fetching match:", error);
        setMatchDog(null);
      });
    } else {
      setMatchDog(null);
    }
  }, [likedDogs]);

  const links = [
    {name: "Home", path: "/", className: "bg-black text-white"},
    {name: "Favorites", path: "/favorites", className: "bg-blue-500 text-white"}
  ]

  return (
    <div className={cn("flex flex-col items-center gap-4 p-8", likedDogs.length === 0 ? "h-screen" : "h-auto")}>
      {showConfetti && <ReactConfetti />}
      <Header title="Matches">
        <div className="flex gap-2">
          {links.map((link) => (
            <Link to={link.path} key={link.name}>
              <Button variant="outline" className={cn(link.className, "cursor-pointer")}>
                {link.name}
              </Button>
            </Link>
          ))}
        </div>
      </Header>
      {likedDogs.length === 0 ? (
        <NoFavorites />
      ) : (
        matchDog ? (
          <DogCard dog={matchDog} location={dogLocations?.[matchDog.zip_code]}/>
        ) : (
          <p>Loading your match...</p> 
        )
      )}
    </div>
  );
}
