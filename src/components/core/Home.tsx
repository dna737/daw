// Sets all the routes for the app.

import { useState, useRef, useEffect } from "react";
import MainSearch from "./MainSearch";
import { Button } from "../ui/button";
import { useDog } from "../hooks/dogHooks";
import { filterBreedSearchItems } from "../utils";
import { DogCard } from ".";

export default function Home() {
  const [isFocused, setIsFocused] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [searchValue, setSearchValue] = useState("");
  const { handleSearch, changeBreedAvailability, breedSearchItems, dogs, likedDogs, handleLikeChange } = useDog();
  const { availableBreeds, selectedBreeds } = filterBreedSearchItems(breedSearchItems, searchValue);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsFocused(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleBreedSelection = (breedName: string) => {
    changeBreedAvailability(breedName);
  };

  return (
    <div className="flex flex-col items-center gap-4 p-4">
      <h1 className="text-2xl font-bold">Dog Search</h1>
      <div className="flex gap-2">
        <MainSearch
          ref={containerRef}
          isFocused={isFocused}
          searchValue={searchValue}
          availableBreeds={availableBreeds}
          selectedBreeds={selectedBreeds}
          onFocus={() => setIsFocused(true)}
          onSearchValueChange={setSearchValue}
          onBreedSelection={handleBreedSelection}
        />
        <Button onClick={handleSearch}>Search</Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 w-full">
        {dogs.map((dog) => (
          <DogCard key={dog.id} dog={dog} handleLikeChange={handleLikeChange} isLiked={likedDogs.includes(dog.id)}/>
        ))}
      </div>
    </div>
  );
}
