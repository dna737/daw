import { TriangleAlert } from "lucide-react";
import { DogCard } from ".";
import { useDog } from "../hooks/dogHooks";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import Header from "./Header";
import { useEffect, useState } from "react";
import { getDogs } from "@/services/proxy";
import type { Dog } from "@/models";

export default function Favorites() {

  const { likedDogs, handleLikeChange } = useDog();
  const [dogs, setDogs] = useState<Dog[]>([]);

  useEffect(() => {
    getDogs(likedDogs).then((dogs: Dog[]) => {
      setDogs(dogs);
    });
  }, [likedDogs]);

  return (
    <div className="flex flex-col items-center gap-4 p-4">
      <Header 
      title="Favorites"
      links={[
        {name: "Home", path: "/", className: "bg-black text-white"},
        {name: "Find a Match!", path: "/match", className: "bg-red-500 text-white"}
      ]} />
      {likedDogs.length === 0 ? (
        <div className="flex flex-col items-center gap-2">
        <Alert className="flex flex-col items-center gap-2">
          <AlertTitle className="flex items-center gap-2">
            <TriangleAlert className="h-4 w-4 stroke-red-600" />
            {"No favorite dogs yet!"}
          </AlertTitle>
          <AlertDescription>
            {"Click on the 🤍 icon on a dog's card to mark as a favorite. ❤"}
          </AlertDescription>
        </Alert>
        </div>
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
