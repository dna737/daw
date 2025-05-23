import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { Checkbox } from "@/components/ui/checkbox";
import { forwardRef } from "react";
import { cn } from "@/lib/utils";
import { Separator } from "../ui/separator";
import type { DogSearchOption } from "@/models";
import { Button } from "../ui/button";

interface DogSearchResultProps {
  dog: DogSearchOption;
  onCheckedChange: (name: string) => void;
}

function DogSearchResult({ dog, onCheckedChange }: DogSearchResultProps) {
  const { name, isSelected } = dog;

  return (
    <div className="flex items-center space-x-2 cursor-pointer" onClick={() => onCheckedChange(name)}>
      <Checkbox id={name} checked={isSelected} className="cursor-pointer" />
      <label htmlFor={name} className="flex-1">
        <CommandItem key={name} className="hover:bg-transparent data-[selected=true]:bg-transparent cursor-pointer">{name}</CommandItem>
      </label>
    </div>
  )
}

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

// Using forwardRef here to know when the input is focused
const MainSearch = forwardRef<HTMLDivElement, MainSearchProps>(({
  isFocused,
  searchValue,
  availableBreeds,
  selectedBreeds,
  onFocus,
  onSearchValueChange,
  onBreedSelection,
  handleSearch
}, ref) => {
  return (
    <div className="flex gap-2 relative">

    <Command ref={ref} className={cn(
      "md:min-w-[450px] transition-all duration-200 border shadow-md rounded-lg",
      isFocused ? "h-max" : "h-9"
    )}>
      <CommandInput 
        placeholder="Select the breeds you want to search for..." 
        onFocus={onFocus}
        value={searchValue}
        onValueChange={onSearchValueChange}
      />
      {isFocused && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border rounded-md shadow-lg z-50">
          <CommandList className="h-min p-2">
            {selectedBreeds.length > 0 && (
              <CommandGroup heading="Selected Breeds">
                {selectedBreeds.map((breed) => (
                  <DogSearchResult key={breed.name} dog={breed} onCheckedChange={onBreedSelection} />
                ))}
              </CommandGroup>
            )}
            {selectedBreeds.length > 0 && availableBreeds.length > 0 && <Separator className="my-2" />}
            {availableBreeds.length > 0 && (
              <>
                <CommandGroup heading="Available Breeds">
                  {availableBreeds.map((breed) => (
                    <DogSearchResult key={breed.name} dog={breed} onCheckedChange={onBreedSelection} />
                  ))}
                </CommandGroup>
              </>
            )}
            {selectedBreeds.length === 0 && availableBreeds.length === 0 && (
              <CommandEmpty>{"No breeds found."}</CommandEmpty>
            )}
          </CommandList>
        </div>
      )}
    </Command>
    <Button onClick={handleSearch}>Search</Button>
    </div>
  );
});

export default MainSearch;
