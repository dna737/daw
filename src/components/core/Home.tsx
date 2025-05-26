// Sets all the routes for the app.

import { useState, useRef, useEffect } from "react";
import { MainSearch, Header, DogCard, SortBy, Filters } from ".";
import { filterBreedSearchItems } from "../utils";
import { useBackToTop, useDog, useLikedDogs, useSearch, useZipCodes } from "../hooks";
import { PageControl } from "../Page";
import DogCardSkeleton from "./DogCardSkeleton";
import { Button } from "../ui/button";
import { ArrowUp, Heart, Star } from "lucide-react";
import { Link } from "react-router";
import { cn } from "@/lib/utils";

export default function Home() {
  const [isFocused, setIsFocused] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [searchValue, setSearchValue] = useState("");
  const { dogIds, breedSearchItems, handleSearch, changeBreedAvailability, currentPage, setCurrentPage, totalPages, sortBy, setSortBy, pageSize, setPageSize, handleFilterChange, handleLocationFilterChange, dogResultsMessage, zipCodeResultsMessage, results, zipCodeSize, zipCodeFrom, handleZipCodeReset } = useSearch();

  const { dogs, isLoading, dogZipCodes } = useDog(dogIds);
  const { dogLocations } = useZipCodes(dogZipCodes);
  const { isVisible, scrollToTop } = useBackToTop();
  const { likedDogs, handleLikeChange } = useLikedDogs();
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

  const links = [
    {name: "View Favorites", path: "/favorites", className: "bg-blue-500 text-white"},
    {name: "Find a Match!", path: "/match", className: "bg-red-500 text-white"}
  ]

  return (
    <div className="flex flex-col justify-between gap-4 p-4 h-full">
      {isVisible && (
        <Button 
          onClick={scrollToTop} 
          className="fixed bottom-4 right-4 aria-hidden:hidden bg-blue-500 text-white p-2 rounded-full hover:bg-blue-600 transition-colors"
          aria-label="Back to top"
        >
            <ArrowUp className="w-4 h-4" />
        </Button>
      )}
      <div className="flex flex-col items-center gap-4 p-4">
        <Header title="Home">
        <div className="flex gap-2">
          {links.map((link) => (
            <Link to={link.path} key={link.name}>
              <Button variant="outline" className={cn(link.className, "cursor-pointer flex items-center gap-1")}>
                <span className="sm:hidden">
                  {link.name === "View Favorites" ? <Star className="w-4 h-4" /> : <Heart className="w-4 h-4" />}
                </span>
                <span className="hidden sm:inline">{link.name}</span>
              </Button>
            </Link>
          ))}
        </div>
        </Header>
        <div className="flex w-full items-center">
          <div className="flex-1" />
          <MainSearch
            ref={containerRef}
            isFocused={isFocused}
            searchValue={searchValue}
            availableBreeds={availableBreeds}
            selectedBreeds={selectedBreeds}
            onFocus={() => setIsFocused(true)}
            onSearchValueChange={setSearchValue}
            onBreedSelection={changeBreedAvailability}
            handleSearch={handleSearch}
          />
          <div className="flex-1 flex justify-end">
            <SortBy currentValue={sortBy} setCurrentValue={setSortBy} />
          </div>
        </div>

        {!isLoading && results.dogs === 0 ? <div className="text-gray-500 text-center">No dogs found</div> :
        <>
          {!isLoading && dogResultsMessage && <div className="text-gray-500 text-center">{dogResultsMessage}</div>}
        </>
        }

      <PageControl currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} pageSize={pageSize} setPageSize={setPageSize} />

        <div className="w-full flex justify-start gap-2 flex-col md:max-md:flex-col lg:flex-row
">
          <div className="flex flex-col gap-2">
            <Filters handleFilterChange={handleFilterChange} handleLocationChange={handleLocationFilterChange} totalZipCodes={results.zipCodes} currentZipSize={zipCodeSize} zipCodeResultsMessage={zipCodeResultsMessage} zipCodeFrom={zipCodeFrom} handleZipCodeReset={handleZipCodeReset} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 w-full">
            {results.dogs > 0 && (
              <>
            {isLoading ? (
              Array.from({ length: 8 }).map((_, index) => (
                <DogCardSkeleton key={index} />
              ))
            ) : (
              dogs.map((dog) => (
                <DogCard key={dog.id} dog={dog} handleLikeChange={handleLikeChange} isLiked={likedDogs.includes(dog.id)} location={dogLocations?.[dog.zip_code]}/>
              ))
            )}
            </>
            )}
          </div>
        </div>
      </div>
      <PageControl currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} pageSize={pageSize} setPageSize={setPageSize} />
    </div>
  );
}
