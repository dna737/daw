import { forwardRef } from "react";
import type { StateOption } from "@/models";
import { Badge } from "../ui/badge";
import { X } from "lucide-react";
import { MultiSelectCommand } from "." 

interface StateSearchProps {
  isFocused: boolean;
  searchValue: string;
  availableStates: StateOption[];
  selectedStates: StateOption[];
  onFocus: () => void;
  onSearchValueChange: (value: string) => void;
  onStateSelection: (code: string) => void;
}

const StateSearch = forwardRef<HTMLDivElement, StateSearchProps>(
  (
    {
      isFocused,
      searchValue,
      availableStates,
      selectedStates,
      onFocus,
      onSearchValueChange,
      onStateSelection,
    },
    ref
  ) => {

    const handleItemToggle = (item: StateOption) => {
      onStateSelection(item.code);
      // Clear search input when state is selected
      const isNewlySelected = !selectedStates.some(s => s.code === item.code);
      if (isNewlySelected) { 
        onSearchValueChange("");
      }
    };

    return (
      <div>
        <MultiSelectCommand<StateOption>
          ref={ref}
          isFocused={isFocused}
          searchValue={searchValue}
          availableItems={availableStates}
          selectedItems={selectedStates}
          getItemKey={(state) => state.code}
          getItemDisplayValue={(state) => `${state.name} (${state.code})`}
          onFocus={onFocus}
          onSearchValueChange={onSearchValueChange}
          onItemToggle={handleItemToggle}
          placeholder="Search for states..."
          headingSelected="Selected States"
          headingAvailable="Available States"
          emptyText="No states found."
        />
        <div className="grid grid-cols-[repeat(auto-fill,minmax(45px,1fr))] gap-1 mt-2 justify-start">
          {selectedStates.map((state) => (
            <Badge 
              key={state.code} 
              variant="outline" 
              className="cursor-pointer text-center flex items-center justify-center p-1" 
              onClick={() => onStateSelection(state.code)}
            >
              {state.code}
              <X 
                className="w-3 h-3 ml-1 cursor-pointer hover:text-red-500"
                onClick={(e) => { 
                  e.stopPropagation();
                  onStateSelection(state.code);
                }}/>
            </Badge>
          ))}
        </div>
      </div>
    );
  }
);

export default StateSearch;
