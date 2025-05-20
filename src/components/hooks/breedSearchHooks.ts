import { use, useState } from 'react';
import { getBreeds } from '@/services/proxy';
import type { DogSearchOption } from '@/models';

// Create a promise that we can reuse
const breedsPromise = getBreeds().then(names => 
  names.map(name => ({ name, isSelected: false }))
);

export const useBreedSearch = () => {
  // This will suspend if the data isn't ready
  const initialBreeds = use(breedsPromise);
  const [breeds, setBreeds] = useState<DogSearchOption[]>(initialBreeds);

  const toggleBreedSelection = (breedName: string) => {
    setBreeds(prevBreeds => 
      prevBreeds.map(breed => 
        breed.name === breedName 
          ? { ...breed, isSelected: !breed.isSelected }
          : breed
      )
    );
  };

  const filterBreeds = (searchValue: string) => {
    const filteredBreeds = breeds.filter(breed => 
      breed.name.toLowerCase().includes(searchValue.toLowerCase())
    );
    
    return {
      availableBreeds: filteredBreeds
        .filter(breed => !breed.isSelected)
        .sort((a, b) => a.name.localeCompare(b.name)),
      selectedBreeds: filteredBreeds
        .filter(breed => breed.isSelected)
        .sort((a, b) => a.name.localeCompare(b.name))
    };
  };

  return {
    breeds,
    filterBreeds,
    toggleBreedSelection,
    getSelectedBreedNames: () => breeds.filter(breed => breed.isSelected).map(breed => breed.name)
  };
}; 