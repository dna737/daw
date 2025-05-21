import { TriangleAlert } from "lucide-react";
import { DogCard } from ".";
import { useDog } from "../hooks/dogHooks";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import Header from "./Header";

export default function Favorites() {

  const { likedDogs, dogs, handleLikeChange } = useDog();

  console.log("likedDogs:", likedDogs);

  return (
    <div className="flex flex-col items-center gap-4 p-4">
      <Header 
      title="Favorites"
      links={[
        {name: "Home", path: "/", className: "bg-black text-white"},
        {name: "Find a Match!", path: "/matches", className: "bg-red-500 text-white"}
      ]} />
      {likedDogs.length === 0 ? (
        <Alert className="w-full flex flex-col items-center gap-2">
          <AlertTitle className="flex items-center gap-2">
            <TriangleAlert className="h-4 w-4 stroke-red-600" />
            {"No favorite dogs yet!"}
          </AlertTitle>
          <AlertDescription>
            Click the button below to head back to the home page and add some dogs to your favorites!
          </AlertDescription>
        </Alert>
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
