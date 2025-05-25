import { useEffect, useState } from "react";
import { getDogs, getMatch } from "@/services/proxy";
import type { Dog } from "@/models";
import { DogCard, NoFavorites, Header  } from ".";
import { useLikedDogs } from "../hooks";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
import { Link } from "react-router";

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

  const links = [
    {name: "Home", path: "/", className: "bg-black text-white"},
    {name: "Favorites", path: "/favorites", className: "bg-blue-500 text-white"}
  ]

  return (
    <div className={cn("flex flex-col items-center gap-4 p-8", likedDogs.length === 0 ? "h-screen" : "h-auto")}>
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
        matchDog && <DogCard dog={matchDog} />
      )}
    </div>
  );
}
