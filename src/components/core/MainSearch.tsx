import { forwardRef } from "react";
import type { DogSearchOption } from "@/models";
import { Button } from "../ui/button";
import { MultiSelectCommand } from ".";

interface MainSearchProps {
  isFocused: boolean;
  searchValue: string;
  availableBreeds: DogSearchOption[];
  selectedBreeds: DogSearchOption[];
  onFocus: () => void;
  onSearchValueChange: (value: string) => void;
  onBreedSelection: (name: string) => void;
  handleSearch: () => void;
}

const MainSearch = forwardRef<HTMLDivElement, MainSearchProps>(
  (
    {
      isFocused,
      searchValue,
      availableBreeds,
      selectedBreeds,
      onFocus,
      onSearchValueChange,
      onBreedSelection,
      handleSearch
    },
    ref
  ) => {
    const onSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      handleSearch();
    };

    const handleItemToggle = (item: DogSearchOption) => {
      onBreedSelection(item.name);
    };

    return (
      <form onSubmit={onSubmit} className="flex gap-2 relative">
        <MultiSelectCommand<DogSearchOption>
          ref={ref}
          commandClassName="md:min-w-[450px]"
          isFocused={isFocused}
          searchValue={searchValue}
          availableItems={availableBreeds}
          selectedItems={selectedBreeds}
          getItemKey={(breed) => breed.name}
          getItemDisplayValue={(breed) => breed.name}
          onFocus={onFocus}
          onSearchValueChange={onSearchValueChange}
          onItemToggle={handleItemToggle}
          placeholder="Select the breeds you want to search for..."
          headingSelected="Selected Breeds"
          headingAvailable="Available Breeds"
          emptyText="No breeds found."
        />
        <Button type="submit">Search</Button>
      </form>
    );
  }
);

export default MainSearch;
