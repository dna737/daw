import React, { forwardRef } from 'react';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

type BaseItem = { name: string } | { code: string; name: string };

export interface MultiSelectCommandProps<TItem extends BaseItem> {
  // Data
  availableItems: TItem[];
  selectedItems: TItem[];
  getItemKey: (item: TItem) => string;
  getItemDisplayValue: (item: TItem) => string;

  // Search and Focus
  isFocused: boolean;
  searchValue: string;
  onSearchValueChange: (value: string) => void;
  onFocus: () => void;
  placeholder: string;

  // Headings & Empty Text
  headingSelected: string;
  headingAvailable: string;
  emptyText: string;

  // Callbacks
  onItemToggle: (item: TItem) => void;

  // Styling & Ref
  commandClassName?: string;
  dropdownContainerClassName?: string;
  ref?: React.ForwardedRef<HTMLDivElement>;
  id: string;
}

function MultiSelectCommandInner<TItem extends BaseItem>(
  props: MultiSelectCommandProps<TItem>,
  ref: React.ForwardedRef<HTMLDivElement>
) {
  const {
    availableItems,
    selectedItems,
    getItemKey,
    getItemDisplayValue,
    isFocused,
    searchValue,
    onSearchValueChange,
    onFocus,
    placeholder,
    headingSelected,
    headingAvailable,
    emptyText,
    onItemToggle,
    commandClassName,
    dropdownContainerClassName,
    id,
  } = props;

  const renderItems = (items: TItem[], isSelectedGroup: boolean) => {
    return items.map((item) => {
      const key = getItemKey(item);
      const displayValue = getItemDisplayValue(item);
      const isCurrentlySelected = isSelectedGroup || selectedItems.some(selItem => getItemKey(selItem) === key);

      return (
        <div
          key={key}
          className="flex items-center space-x-2 cursor-pointer"
        >
          <Checkbox id={key} checked={isCurrentlySelected} className="cursor-pointer" />
          <label htmlFor={key} className="flex-1">
            <CommandItem
              key={key}
              className="hover:bg-transparent data-[selected=true]:bg-transparent cursor-pointer"
              onSelect={() => {
                onItemToggle(item);
              }}
            >
              {displayValue}
            </CommandItem>
          </label>
        </div>
      );
    });
  };

  return (
    <Command
      ref={ref}
      className={cn(
        "transition-all duration-200 border rounded-lg",
        isFocused ? "h-max" : "h-9",
        commandClassName
      )}
      shouldFilter={false} // Causes issues with sorting when enabled.
    >
      <CommandInput
        id={id}
        placeholder={placeholder}
        onFocus={onFocus}
        value={searchValue}
        onValueChange={onSearchValueChange}
      />
      {isFocused && (
        <div 
          className={cn(
            "absolute top-full left-0 right-0 mt-1 bg-white border rounded-md shadow-lg z-50",
            dropdownContainerClassName
          )}
        >
          <CommandList className="h-min p-2">
            {selectedItems.length > 0 && (
              <CommandGroup heading={headingSelected}>
                {renderItems(selectedItems, true)}
              </CommandGroup>
            )}
            {selectedItems.length > 0 && availableItems.length > 0 && (
              <Separator className="my-2" />
            )}
            {availableItems.length > 0 && (
              <CommandGroup heading={headingAvailable}>
                {renderItems(availableItems, false)}
              </CommandGroup>
            )}
            {selectedItems.length === 0 && availableItems.length === 0 && (
              <CommandEmpty>{emptyText}</CommandEmpty>
            )}
          </CommandList>
        </div>
      )}
    </Command>
  );
}

const MultiSelectCommand = forwardRef(MultiSelectCommandInner) as <TItem extends BaseItem>(
  props: MultiSelectCommandProps<TItem> & { ref?: React.ForwardedRef<HTMLDivElement> }
) => ReturnType<typeof MultiSelectCommandInner>;

export default MultiSelectCommand;
