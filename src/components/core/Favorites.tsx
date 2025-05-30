import { cn } from "@/lib/utils";
import { DogCard, Header, NoFavorites } from ".";
import { useLikedDogs, useDog, useZipCodes } from "../hooks";
import { Link } from "react-router";
import { Button } from "../ui/button";
import { Home, Heart } from "lucide-react";

export default function Favorites() {
  const { likedDogs, handleLikeChange } = useLikedDogs();
  const { dogs, dogZipCodes } = useDog(likedDogs);
  const { dogLocations } = useZipCodes(dogZipCodes);

  const links = [
    {name: "Home", path: "/", className: "bg-black text-white"},
    {name: "Find a Match!", path: "/match", className: "bg-red-500 text-white"}
  ]

  return (
    <div className={cn("flex flex-col items-center gap-4 p-8", likedDogs.length === 0 ? "h-screen" : "h-auto")}>
      <Header title="Favorites">
        <div className="flex gap-2">
          {links.map((link) => (
            <Link to={link.path} key={link.name}>
              <Button variant="outline" className={cn(link.className, "cursor-pointer flex items-center gap-1")}>
                <span className="sm:hidden">
                  {link.name === "Home" ? <Home className="w-4 h-4" /> : <Heart className="w-4 h-4" />}
                </span>
                <span className="hidden sm:inline">{link.name}</span>
              </Button>
            </Link>
          ))}
        </div>
      </Header>
      {likedDogs.length === 0 ? (
        <NoFavorites />
      ) : (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 w-full">
        {likedDogs.map((dogId) => {
          const dog = dogs.find((dog) => dog.id === dogId);
            if (!dog) return null;
            return (
              <DogCard key={dogId} dog={dog} handleLikeChange={handleLikeChange} isLiked={true} location={dogLocations?.[dog.zip_code]}/>
            );
          })}
        </div>
      )}
        </div>
  );
}
