import type { Dog, DogSearchOption } from "@/models";
import { getBreeds, getDogs, getSearchResults } from "@/services/proxy";
import { useEffect, useState } from "react";

export const useDog = () => {
  const [dogs, setDogs] = useState<Dog[]>([]);
  const [breedSearchItems, setBreedSearchItems] = useState<DogSearchOption[]>([]);
  const [displayedIds, setDisplayedIds] = useState<string[]>([]); // To store the dog ids.

  // Responsible for initializing the breed search items.
  useEffect(() => {
    getBreeds().then(breeds => {
      setBreedSearchItems(breeds.map(breed => ({ name: breed, isSelected: false })));
    }).catch(error => {
      console.error(error);
    });
  }, []);

  // Filters the search results based on user input.
  useEffect(() => {
    getSearchResults({
      breeds: breedSearchItems.filter(item => item.isSelected).map(item => item.name),
    }).then(result => {
      setDisplayedIds(result.resultIds);
    }).catch(error => {
      console.error(error);
    });
  }, [breedSearchItems]);

  // Responsible for fetching the dogs that show up as cards.
  useEffect(() => {
    getDogs(displayedIds).then((dogs: Dog[]) => {
      setDogs(dogs);
    }).catch(error => {
      console.error(error);
    });
  }, [displayedIds]);

  const changeBreedAvailability = (breed: string) => {
    const remainingBreeds = breedSearchItems.filter(b => b.name !== breed);
    const udpatedBreedData = breedSearchItems.find(b => b.name === breed);
    if (udpatedBreedData) {
      udpatedBreedData.isSelected = !udpatedBreedData.isSelected;
      setBreedSearchItems([...remainingBreeds, udpatedBreedData]);
    }
  };

  const filterBreedSearchItems = (searchValue: string) => {
    const filteredBreeds = breedSearchItems.filter((b) => b.name.toLowerCase().includes(searchValue.toLowerCase()));
    const availableBreeds = filteredBreeds.filter((b) => !b.isSelected).sort((a, b) => a.name.localeCompare(b.name));
    const selectedBreeds = filteredBreeds.filter((b) => b.isSelected).sort((a, b) => a.name.localeCompare(b.name));
    return { availableBreeds, selectedBreeds };
  };

  return { dogs, breedSearchItems, displayedIds, changeBreedAvailability, filterBreedSearchItems };
}
