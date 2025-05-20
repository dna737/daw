// Sets all the routes for the app.

import { useState, useRef, useEffect } from "react";
import MainSearch from "./MainSearch";
import { Button } from "../ui/button";
import { useDog } from "../hooks/dogHooks";
import { filterBreedSearchItems } from "../utils";
import type { DogSearchOption } from "@/models";

export default function Home() {
  const [isFocused, setIsFocused] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [searchValue, setSearchValue] = useState("");
  const { handleSearch, changeBreedAvailability, breedSearchItems } = useDog();
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
      <div className="flex flex-col items-center gap-2">
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
    </div>
  );
}
