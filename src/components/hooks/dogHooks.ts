import { use, useState } from 'react';
import { getSearchResults, getDogs } from '@/services/proxy';
import type { Dog, Result, DogSearchParams } from '@/models';

// Create a function that returns a promise for search results
const fetchSearchData = async (params?: DogSearchParams) => {
  const result = await getSearchResults(params);
  const dogs = await getDogs(result.resultIds);
  return { result, dogs };
};

export const useDogData = (searchParams?: DogSearchParams) => {
  const [searchParamsState, setSearchParamsState] = useState(searchParams);
  const { result, dogs } = use(fetchSearchData(searchParamsState));

  const fetchSearchResults = async (params?: DogSearchParams) => {
    setSearchParamsState(params);
  };

  return {
    dogs,
    resultIds: result.resultIds,
    total: result.total,
    next: result.next,
    prev: result.prev,
    fetchSearchResults
  };
}; 