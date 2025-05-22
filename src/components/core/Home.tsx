// Sets all the routes for the app.

import { useState, useRef, useEffect } from "react";
import { MainSearch, Pagination, Header } from ".";
import { Button } from "../ui/button";
import { filterBreedSearchItems } from "../utils";
import { DogCard } from ".";
import { useDog } from "../hooks";
import { useSearch } from "../hooks/searchHooks";

export default function Home() {
  const [isFocused, setIsFocused] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [searchValue, setSearchValue] = useState("");
  const { dogIds, breedSearchItems, handleSearch, changeBreedAvailability, currentPage, setCurrentPage, numPages } = useSearch();
  const { dogs, likedDogs, handleLikeChange } = useDog(dogIds);
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

  return (
    <>
      <div className="flex flex-col items-center gap-4 p-4">
        <Header 
          title="Home"
        links={[
          {name: "View Favorites", path: "/favorites", className: "bg-blue-500 text-white", state: {likedDogs}},
          {name: "Find a Match!", path: "/match", className: "bg-red-500 text-white", state: {likedDogs}}
        ]}
      />
      <div className="relative w-full max-w-[450px]">
        <div className="flex gap-2">
          <MainSearch
            ref={containerRef}
            isFocused={isFocused}
            searchValue={searchValue}
            availableBreeds={availableBreeds}
            selectedBreeds={selectedBreeds}
            onFocus={() => setIsFocused(true)}
            onSearchValueChange={setSearchValue}
            onBreedSelection={changeBreedAvailability}
          />
          <Button onClick={handleSearch}>Search</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 w-full">
        {dogs.map((dog) => (
          <DogCard key={dog.id} dog={dog} handleLikeChange={handleLikeChange} isLiked={likedDogs.includes(dog.id)}/>
        ))}
      </div>
      </div>
      <Pagination currentPage={currentPage} totalPages={numPages} onPageChange={setCurrentPage} />
    </>
  );
}
