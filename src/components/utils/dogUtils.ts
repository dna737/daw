import type { DogSearchOption } from "@/models";

export const filterBreedSearchItems = (breedSearchItems: DogSearchOption[], searchValue: string) => {
  const filteredBreeds = breedSearchItems.filter((b) => b.name.toLowerCase().includes(searchValue.toLowerCase()));
    const availableBreeds = filteredBreeds.filter((b) => !b.isSelected).sort((a, b) => a.name.localeCompare(b.name));
    const selectedBreeds = filteredBreeds.filter((b) => b.isSelected).sort((a, b) => a.name.localeCompare(b.name));
    return { availableBreeds, selectedBreeds };
};