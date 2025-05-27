import { useEffect, useState } from "react";
import type { DogSearchOption, FilterOptions, ZipCodeSearchParams, SortableField, SortDirection, SearchResults } from "@/models";
import { getBreeds, getSearchResults, getFilteredLocations } from "@/services";
import { SortByOptions } from "@/models";

export const useSearch = () => {
  const [dogIds, setDogIds] = useState<string[]>([]);
  const [results, setResults] = useState<SearchResults>({ dogs: 0, zipCodes: 0 });
  const [breedSearchItems, setBreedSearchItems] = useState<DogSearchOption[]>([]);
  const [pageSize, setPageSize] = useState<number>(25);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [sortBy, setSortBy] = useState<SortByOptions>(SortByOptions.BREED_ASC);
  const [filters, setFilters] = useState<FilterOptions>({});

  const totalPages = Math.ceil(results.dogs / pageSize);
  const [sortField, sortDirection] = sortBy.split(":");
  const [dogResultsMessage, setDogResultsMessage] = useState<string>("");
  const [zipCodeResultsMessage, setZipCodeResultsMessage] = useState<string>("");
  const [zipCodeSize, setZipCodeSize] = useState<number>(25);
  const [zipCodeFrom, setZipCodeFrom] = useState<number>(0);
  const [zipCodeCoverage, setZipCodeCoverage] = useState<string>("");

  const handleSearch = () => {
    getSearchResults({
      ...filters,
      breeds: breedSearchItems.filter(item => item.isSelected).map(item => item.name),
      from: (currentPage - 1) * pageSize,
      size: pageSize,
      sort: {
        field: sortField as SortableField,
        direction: sortDirection as SortDirection
      }
    }).then(result => {
      setDogIds(result.resultIds);
      setResults({ ...results, dogs: result.total });
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
  }, [currentPage, pageSize, sortBy, filters, results.zipCodes]);

  useEffect(() => {
    setDogResultsMessage(`Showing ${(currentPage - 1) * pageSize + 1} - ${Math.min(currentPage * pageSize, results.dogs)} of ${results.dogs} dogs`);
  }, [currentPage, pageSize, results.dogs]);

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

  const handleFilterChange = (filter: FilterOptions) => {
    setFilters(prevFilters => ({
      ...prevFilters,
      ...filter
    }));
  };

  useEffect(() => {
    let message;
    const numZipCodes = results.zipCodes;

    if(numZipCodes > 0) {
      message = zipCodeSize < numZipCodes
        ? `Showing ${zipCodeFrom + 1} - ${Math.min(zipCodeFrom + zipCodeSize, numZipCodes)} of ${numZipCodes} zip codes`
        : `Showing ${numZipCodes > 1 ? "all " + numZipCodes : numZipCodes} zip code${numZipCodes > 1 ? "s" : ""}`;
      message += zipCodeCoverage ? `\n${zipCodeCoverage}` : "";
    }
    setZipCodeResultsMessage(message ?? "");
  }, [results.zipCodes, zipCodeFrom, zipCodeSize, zipCodeCoverage]);

  const handleZipCodeReset = () => {
    setZipCodeFrom(0);
    setZipCodeSize(25);
    setZipCodeCoverage("");
    setResults({ ...results, zipCodes: 0 });
    setFilters(prev => ({ ...prev, zipCodes: [] }));
    setZipCodeResultsMessage("");
  };

  const handleLocationFilterChange = async (location: ZipCodeSearchParams) => {
    try {
      const locations = await getFilteredLocations(location);
      setResults(prevResults => ({ 
        ...prevResults, 
        zipCodes: locations.total 
      }));

      if(location.from && location.from > results.zipCodes - 1) {
        setZipCodeFrom(0);
        setZipCodeSize(25);
      } else {
        setZipCodeFrom(location.from ?? 0);
        setZipCodeSize(location.size ?? 25);
      }

      if(locations.results.length > 0) {
        setFilters(prevFilters => ({
          ...prevFilters,
          zipCodes: locations.results.map(loc => loc.zip_code)
        }));

        setZipCodeCoverage(`(${locations.results[0].zip_code} - ${locations.results[locations.results.length - 1].zip_code})`);
      }
    } catch (error) {
      console.error("Error fetching filtered locations:", error);
    }
  };

  useEffect(() => {
  }, [zipCodeSize, results.zipCodes, zipCodeFrom]);

  return { dogIds, breedSearchItems, handleSearch, changeBreedAvailability, pageSize, setPageSize, currentPage, setCurrentPage, totalPages, sortBy, setSortBy, filters, handleFilterChange, handleLocationFilterChange, dogResultsMessage, zipCodeResultsMessage, zipCodeSize, results, zipCodeFrom, handleZipCodeReset };
};
