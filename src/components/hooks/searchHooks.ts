import { useEffect, useState } from "react";
import type { DogSearchOption } from "@/models";
import { getBreeds, getSearchResults } from "@/services";

export const useSearch = () => {
  const [dogIds, setDogIds] = useState<string[]>([]); // To store the dog ids.
  const [results, setResults] = useState<number>(0);
  const [breedSearchItems, setBreedSearchItems] = useState<DogSearchOption[]>([]);
  const [pageSize, setPageSize] = useState<number>(25); // Can be modified later.
  const [currentPage, setCurrentPage] = useState<number>(1);
  const numPages = Math.ceil(results / pageSize);

  // TODO: Check if it's easier to pass the link directly instead of using the from and size query params.
  const handleSearch = () => {
    getSearchResults({
      breeds: breedSearchItems.filter(item => item.isSelected).map(item => item.name),
      from: (currentPage - 1) * pageSize,
      size: pageSize,
      sort: { field: "breed", direction: "asc" } // TODO: Add state variable with this as the default value.
    }).then(result => {
      setDogIds(result.resultIds);
      setResults(result.total);
    }).catch(error => {
      console.error(error);
    });
  };

  // Responsible for initializing the breed search items.
  useEffect(() => {
    getBreeds().then(breeds => {
      console.log('Raw breeds from API:', breeds);
      
      // Sort breeds alphabetically first, using case-insensitive comparison
      const sortedBreedNames = [...breeds].sort((a, b) => {
        // Convert both strings to lowercase for comparison
        const aLower = a.toLowerCase().trim();
        const bLower = b.toLowerCase().trim();
        console.log(`Comparing: "${a}" (${aLower}) with "${b}" (${bLower})`);
        return aLower.localeCompare(bLower);
      });
      
      console.log('Sorted breed names:', sortedBreedNames);
      
      // Create search items maintaining the sorted order
      const sortedSearchItems = sortedBreedNames.map(breed => ({
        name: breed,
        isSelected: false
      }));
      
      console.log('Final sorted search items:', sortedSearchItems.map(item => item.name));
      setBreedSearchItems(sortedSearchItems);
    }).catch(error => {
      console.error(error);
    });
  }, []);

  // Responsible for updating results.
  useEffect(() => {
    handleSearch();
  }, [breedSearchItems, currentPage, pageSize]);

  // When a breed is selected, reset the page to 1 as the new results may have lesser results than before.
  useEffect(() => {
    setCurrentPage(1);
  }, [breedSearchItems]);

  const changeBreedAvailability = (breed: string) => {
    console.log('Changing availability for breed:', breed);
    console.log('Current items before change:', breedSearchItems.map(item => item.name));
    
    setBreedSearchItems(prevItems => {
      const newItems = prevItems.map(item => 
        item.name === breed 
          ? { ...item, isSelected: !item.isSelected }
          : item
      );
      console.log('Items after change:', newItems.map(item => item.name));
      return newItems;
    });
  };

  const handleNextPage = () => {
    if (currentPage < numPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  return { dogIds, breedSearchItems, handleSearch, changeBreedAvailability, setPageSize, currentPage, setCurrentPage, numPages, handleNextPage, handlePreviousPage };
};
