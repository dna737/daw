import type { DogSearchOption, StateOption  } from "@/models";

export const states: StateOption[] = [
  { name: "Alabama", code: "AL", isSelected: false },
  { name: "Alaska", code: "AK", isSelected: false },
  { name: "Arizona", code: "AZ", isSelected: false },
  { name: "Arkansas", code: "AR", isSelected: false },
  { name: "California", code: "CA", isSelected: false },
  { name: "Colorado", code: "CO", isSelected: false },
  { name: "Connecticut", code: "CT", isSelected: false },
  { name: "Delaware", code: "DE", isSelected: false },
  { name: "District of Columbia", code: "DC", isSelected: false },
  { name: "Florida", code: "FL", isSelected: false },
  { name: "Georgia", code: "GA", isSelected: false },
  { name: "Hawaii", code: "HI", isSelected: false },
  { name: "Idaho", code: "ID", isSelected: false },
  { name: "Illinois", code: "IL", isSelected: false },
  { name: "Indiana", code: "IN", isSelected: false },
  { name: "Iowa", code: "IA", isSelected: false },
  { name: "Kansas", code: "KS", isSelected: false },
  { name: "Kentucky", code: "KY", isSelected: false },
  { name: "Louisiana", code: "LA", isSelected: false },
  { name: "Maine", code: "ME", isSelected: false },
  { name: "Maryland", code: "MD", isSelected: false },
  { name: "Massachusetts", code: "MA", isSelected: false },
  { name: "Michigan", code: "MI", isSelected: false },
  { name: "Minnesota", code: "MN", isSelected: false },
  { name: "Mississippi", code: "MS", isSelected: false },
  { name: "Missouri", code: "MO", isSelected: false },
  { name: "Montana", code: "MT", isSelected: false },
  { name: "Nebraska", code: "NE", isSelected: false },
  { name: "Nevada", code: "NV", isSelected: false },
  { name: "New Hampshire", code: "NH", isSelected: false },
  { name: "New Jersey", code: "NJ", isSelected: false },
  { name: "New Mexico", code: "NM", isSelected: false },
  { name: "New York", code: "NY", isSelected: false },
  { name: "North Carolina", code: "NC", isSelected: false },
  { name: "North Dakota", code: "ND", isSelected: false },
  { name: "Ohio", code: "OH", isSelected: false },
  { name: "Oklahoma", code: "OK", isSelected: false },
  { name: "Oregon", code: "OR", isSelected: false },
  { name: "Pennsylvania", code: "PA", isSelected: false },
  { name: "Rhode Island", code: "RI", isSelected: false },
  { name: "South Carolina", code: "SC", isSelected: false },
  { name: "South Dakota", code: "SD", isSelected: false },
  { name: "Tennessee", code: "TN", isSelected: false },
  { name: "Texas", code: "TX", isSelected: false },
  { name: "Utah", code: "UT", isSelected: false },
  { name: "Vermont", code: "VT", isSelected: false },
  { name: "Virginia", code: "VA", isSelected: false },
  { name: "Washington", code: "WA", isSelected: false },
  { name: "West Virginia", code: "WV", isSelected: false },
  { name: "Wisconsin", code: "WI", isSelected: false },
  { name: "Wyoming", code: "WY", isSelected: false },
];

export const filterBreedSearchItems = (breedSearchItems: DogSearchOption[], searchValue: string) => {
  const filteredBreeds = breedSearchItems.filter((b) => b.name.toLowerCase().includes(searchValue.toLowerCase()));
    const availableBreeds = filteredBreeds.filter((b) => !b.isSelected).sort((a, b) => a.name.localeCompare(b.name));
    const selectedBreeds = filteredBreeds.filter((b) => b.isSelected).sort((a, b) => a.name.localeCompare(b.name));
    return { availableBreeds, selectedBreeds };
};

export const filterStateSearchItems = (stateOptions: typeof states, searchValue: string) => {
  const filteredStates = stateOptions.filter((state) => 
    state.name.toLowerCase().includes(searchValue.toLowerCase()) || 
    state.code.toLowerCase().includes(searchValue.toLowerCase())
  );
  const availableStates = filteredStates.filter((state) => !state.isSelected).sort((a, b) => a.name.localeCompare(b.name));
  const selectedStates = filteredStates.filter((state) => state.isSelected).sort((a, b) => a.name.localeCompare(b.name));
  return { availableStates, selectedStates };
}
