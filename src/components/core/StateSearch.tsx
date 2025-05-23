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
import type { StateOption } from "@/models";

interface StateSearchProps {
  isFocused: boolean;
  searchValue: string;
  availableStates: StateOption[];
  selectedStates: StateOption[];
  onFocus: () => void;
  onSearchValueChange: (value: string) => void;
  onStateSelection: (code: string) => void;
}


interface StateSearchResultProps {
  state: StateOption;
  onCheckedChange: (code: string) => void;
}

function StateSearchResult({ state, onCheckedChange }: StateSearchResultProps) {
  const { name, code, isSelected } = state;

  return (
    <div className="flex items-center space-x-2 cursor-pointer" onClick={() => onCheckedChange(code)}>
      <Checkbox id={code} checked={isSelected} className="cursor-pointer" />
      <label htmlFor={code} className="flex-1">
        <CommandItem key={code} className="hover:bg-transparent data-[selected=true]:bg-transparent cursor-pointer">
          {name} ({code})
        </CommandItem>
      </label>
    </div>
  )
}

const StateSearch = forwardRef<HTMLDivElement, StateSearchProps>(({
  isFocused,
  searchValue,
  availableStates,
  selectedStates,
  onFocus,
  onSearchValueChange,
  onStateSelection,
}, ref) => {
  return (
    <Command ref={ref} className={cn(
      "md:min-w-[450px] transition-all duration-200 border shadow-md rounded-lg",
      isFocused ? "h-max" : "h-9"
    )}>
      <CommandInput 
        placeholder="Search for states..." 
        onFocus={onFocus}
        value={searchValue}
        onValueChange={onSearchValueChange}
      />
      {isFocused && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border rounded-md shadow-lg z-50">
          <CommandList className="h-min p-2">
            {selectedStates.length > 0 && (
              <CommandGroup heading="Selected States">
                {selectedStates.map((state) => (
                  <StateSearchResult key={state.code} state={state} onCheckedChange={onStateSelection} />
                ))}
              </CommandGroup>
            )}
            {selectedStates.length > 0 && availableStates.length > 0 && <Separator className="my-2" />}
            {availableStates.length > 0 && (
              <>
                <CommandGroup heading="Available States">
                  {availableStates.map((state) => (
                    <StateSearchResult key={state.code} state={state} onCheckedChange={onStateSelection} />
                  ))}
                </CommandGroup>
              </>
            )}
            {selectedStates.length === 0 && availableStates.length === 0 && (
              <CommandEmpty>{"No states found."}</CommandEmpty>
            )}
          </CommandList>
        </div>
      )}
    </Command>
  );
});

export { StateSearch }; 
