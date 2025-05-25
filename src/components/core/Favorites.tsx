import { cn } from "@/lib/utils";
import { DogCard, Header, NoFavorites } from ".";
import { useLikedDogs, useDog } from "../hooks";
import { Link } from "react-router";
import { Button } from "../ui/button";

export default function Favorites() {
  const { likedDogs, handleLikeChange } = useLikedDogs();
  const { dogs } = useDog(likedDogs);

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
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 w-full">
        {likedDogs.map((dogId) => {
          const dog = dogs.find((dog) => dog.id === dogId);
            if (!dog) return null;
            return (
              <DogCard key={dogId} dog={dog} handleLikeChange={handleLikeChange} isLiked={true} />
            );
          })}
        </div>
      )}
        </div>
  );
}
