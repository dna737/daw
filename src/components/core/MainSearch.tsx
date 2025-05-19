import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command"
import { Checkbox } from "@/components/ui/checkbox";
import { useRef, useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import type { DogSearchOption } from "@/models";

function DogSearchResult(props: {dog: DogSearchOption, onCheckedChange: (name: string) => void}) {

  const [checked, setChecked] = useState(props.dog.available);
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

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsFocused(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const breedNames = ["Doberman", "Poodle", "Labrador", "Chihuahua", "Pitbull"]; //list of breeds
  const breedData = breedNames.map((breed, i) => ({
    name: breed,
    available: i % 2 === 0,
  }));
  console.log("breedData", breedData);
  const [breeds, setBreeds] = useState(breedData);
  
  const changeBreedAvailability = (breed: string) => {
    const remainingBreeds = breeds.filter(b => b.name !== breed);
    const udpatedBreedData = breeds.find(b => b.name === breed);
    if (udpatedBreedData) {
      udpatedBreedData.available = !udpatedBreedData.available;
      setBreeds([...remainingBreeds, udpatedBreedData]);
    }
  };

  return (
    <Command ref={containerRef}>
      <CommandInput placeholder="Search for a breed..." onFocus={() => setIsFocused(true)} />
      <div className={cn(
        "transition-all duration-200 ease-in-out",
        isFocused ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2 pointer-events-none"
      )}>
        <CommandList>
          <CommandEmpty>{"No results found."}</CommandEmpty>
          <CommandGroup heading="Selected Breeds">
            {breeds.filter((b) => b.available).map((breed) => (
              <DogSearchResult key={breed.name} dog={breed} onCheckedChange={changeBreedAvailability} />
            ))}
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Available Breeds">
            {breeds.filter((b) => !b.available).map((breed) => (
              <DogSearchResult key={breed.name} dog={breed} onCheckedChange={changeBreedAvailability} />
            ))}
          </CommandGroup>
        </CommandList>
      </div>
    </Command>
  )
}
