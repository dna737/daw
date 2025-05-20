import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { Checkbox } from "@/components/ui/checkbox";
import { useRef, useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import type { DogSearchOption } from "@/models";
import { Separator } from "../ui/separator";
import { Button } from "../ui/button";
import { useDog } from "../hooks/dogHooks";
import { filterBreedSearchItems } from "../utils";

function DogSearchResult(props: {dog: DogSearchOption, onCheckedChange: (name: string) => void}) {

  const [checked, setChecked] = useState(props.dog.isSelected);
  const { name } = props.dog;

  return (
    <div className="flex items-center space-x-2">
      <Checkbox id={name} checked={checked} onCheckedChange={() => {props.onCheckedChange(name); setChecked(!checked)}} />
      <label htmlFor={name} className="flex-1">
        <CommandItem key={name} className="hover:bg-transparent data-[selected=true]:bg-transparent cursor-pointer">{name}</CommandItem>
      </label>
    </div>
  )
}

export default function MainSearch() {
  const [isFocused, setIsFocused] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [searchValue, setSearchValue] = useState("");
  const { handleSearch, changeBreedAvailability, breedSearchItems } = useDog();
  const { availableBreeds, selectedBreeds } = filterBreedSearchItems(breedSearchItems, searchValue);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsFocused(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);


  return (
    <>
    <Command ref={containerRef} className={cn(
      "md:min-w-[450px] transition-all duration-200 border shadow-md rounded-lg",
    )}>
      <CommandInput 
        placeholder="Select the breeds you want to search for..." 
        onFocus={() => setIsFocused(true)} 
        value={searchValue}
        onValueChange={setSearchValue}
      />
      <div className={cn(
        "transition-all duration-200 ease-in-out",
        isFocused ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2 pointer-events-none"
      )}>
        <CommandList className="h-min p-2 rounded-lg ">
          {selectedBreeds.length > 0 && (
            <CommandGroup heading="Selected Breeds">
              {selectedBreeds.map((breed: DogSearchOption) => (
                <DogSearchResult key={breed.name} dog={breed} onCheckedChange={changeBreedAvailability} />
              ))}
            </CommandGroup>
          )}
          {selectedBreeds.length > 0 && availableBreeds.length > 0 && <Separator className="my-2" />}
          {availableBreeds.length > 0 && (
            <>
              <CommandGroup heading="Available Breeds">
                {availableBreeds.map((breed: DogSearchOption) => (
                  <DogSearchResult key={breed.name} dog={breed} onCheckedChange={changeBreedAvailability} />
                ))}
              </CommandGroup>
            </>
          )}
          {selectedBreeds.length === 0 && availableBreeds.length === 0 && (
            <CommandEmpty>{"No breeds found."}</CommandEmpty>
          )}
        </CommandList>
      </div>
    </Command>
    <Button onClick={() => {
      handleSearch();
    }}>Search</Button>
    </>
  )
}
