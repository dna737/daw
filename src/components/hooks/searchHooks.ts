import { useEffect, useState } from "react";
import type { DogSearchOption, FilterOptions, SortableField, SortDirection } from "@/models";
import { getBreeds, getSearchResults } from "@/services";
import { SortByOptions } from "@/models";

export const useSearch = () => {
  const [dogIds, setDogIds] = useState<string[]>([]); // To store the dog ids.
  const [results, setResults] = useState<number>(0);
  const [breedSearchItems, setBreedSearchItems] = useState<DogSearchOption[]>([]);
  const [pageSize, setPageSize] = useState<number>(25); // Can be modified later.
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [sortBy, setSortBy] = useState<SortByOptions>(SortByOptions.BREED_ASC);
  const [filters, setFilters] = useState<FilterOptions>({});

  const totalPages = Math.ceil(results / pageSize);
  const [sortField, sortDirection] = sortBy.split(":");

  // TODO: Check if it's easier to pass the link directly instead of using the from and size query params.
  const handleSearch = () => {
    getSearchResults({
      ...filters,
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
      setBreedSearchItems(breeds.map(breed => ({ name: breed, isSelected: false })));
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
    setBreedSearchItems(prevItems => {
      const newItems = prevItems.map(item => 
        item.name === breed 
          ? { ...item, isSelected: !item.isSelected }
          : item
      );
      return newItems;
    });
  };

  useEffect(() => {
    setFilters({
      ...filters,
      breeds: breedSearchItems.filter(item => item.isSelected).map(item => item.name),
    });
  }, [breedSearchItems]);

  return { dogIds, breedSearchItems, handleSearch, changeBreedAvailability, pageSize, setPageSize, currentPage, setCurrentPage, totalPages, sortBy, setSortBy, filters, setFilters };
};
