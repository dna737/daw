import type { CardinalBoundingBox, DiagonalBoxBLTR, DiagonalBoxBRTL, DogSearchOption, GeoBoundingBox, StateOption } from "@/models";
import { State } from "@/models";

// Helper function to get state name from code
export function getStateName(code: string): string {
  return Object.entries(State)
    .find(([_, value]) => value === code)?.[0]
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, l => l.toUpperCase()) || '';
}

// Helper function to get all states as options
export function getStateOptions(): StateOption[] {
  return Object.entries(State).map(([name, code]) => ({
    name: name.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase()),
    code,
    isSelected: false
  }));
}

export const filterBreedSearchItems = (breedSearchItems: DogSearchOption[], searchValue: string) => {
  const sortedItems = [...breedSearchItems].sort((a, b) => a.name.localeCompare(b.name));
  const filteredBreeds = sortedItems.filter((b) => b.name.toLowerCase().includes(searchValue.toLowerCase()));
  const availableBreeds = filteredBreeds.filter((b) => !b.isSelected);
  const selectedBreeds = filteredBreeds.filter((b) => b.isSelected);
  return { availableBreeds, selectedBreeds };
};

export const filterStateSearchItems = (stateOptions: StateOption[], searchValue: string) => {
  const filteredStates = stateOptions.filter((state) => 
    state.name.toLowerCase().includes(searchValue.toLowerCase()) || 
    state.code.toLowerCase().includes(searchValue.toLowerCase())
  );
  const availableStates = filteredStates.filter((state) => !state.isSelected).sort((a, b) => a.name.localeCompare(b.name));
  const selectedStates = filteredStates.filter((state) => state.isSelected).sort((a, b) => a.name.localeCompare(b.name));
  return { availableStates, selectedStates };
}

export function isCardinalBoundingBox(box: GeoBoundingBox): box is CardinalBoundingBox {
  return 'top' in box && 'left' in box && 'bottom' in box && 'right' in box;
}

export function isDiagonalBoundingBox(box: GeoBoundingBox): box is DiagonalBoxBLTR | DiagonalBoxBRTL {
  return 'bottom_left' in box && 'top_right' in box || 'bottom_right' in box && 'top_left' in box;
}
