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
  }, [breedSearchItems, currentPage, pageSize]);

  // When a breed is selected, reset the page to 1 as the new results may have lesser results than before.
  useEffect(() => {
    setCurrentPage(1);
  }, [breedSearchItems]);

  const changeBreedAvailability = (breed: string) => {
    const remainingBreeds = breedSearchItems.filter(b => b.name !== breed);
    const udpatedBreedData = breedSearchItems.find(b => b.name === breed);
    if (udpatedBreedData) {
      udpatedBreedData.isSelected = !udpatedBreedData.isSelected;
      setBreedSearchItems([...remainingBreeds, udpatedBreedData]);
    }
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
