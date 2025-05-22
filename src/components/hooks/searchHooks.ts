import { useEffect, useState } from "react";
import type { DogSearchOption, SortableField, SortDirection } from "@/models";
import { getBreeds, getSearchResults } from "@/services";
import { SortByOptions } from "@/models";

export const useSearch = () => {
  const [dogIds, setDogIds] = useState<string[]>([]); // To store the dog ids.
  const [results, setResults] = useState<number>(0);
  const [breedSearchItems, setBreedSearchItems] = useState<DogSearchOption[]>([]);
  const [pageSize, setPageSize] = useState<number>(25); // Can be modified later.
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [sortBy, setSortBy] = useState<SortByOptions>(SortByOptions.BREED_ASC);

  const totalPages = Math.ceil(results / pageSize);
  const [sortField, sortDirection] = sortBy.split(":");
  console.log("sortField", sortField);
  console.log("sortDirection", sortDirection);

  // TODO: Check if it's easier to pass the link directly instead of using the from and size query params.
  const handleSearch = () => {
    getSearchResults({
      breeds: breedSearchItems.filter(item => item.isSelected).map(item => item.name),
      from: (currentPage - 1) * pageSize,
      size: pageSize,
      sort: {
        field: sortField as SortableField,
        direction: sortDirection as SortDirection
      }
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
  }, [breedSearchItems, currentPage, pageSize, sortBy]);

  // When a breed is selected, reset the page to 1 as the new results may have lesser results than before.
  useEffect(() => {
    setCurrentPage(1);
  }, [breedSearchItems, sortBy, pageSize]);

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
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  return { dogIds, breedSearchItems, handleSearch, changeBreedAvailability, pageSize, setPageSize, currentPage, setCurrentPage, totalPages, handleNextPage, handlePreviousPage, sortBy, setSortBy };
};
