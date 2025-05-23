import { useState, useRef, useEffect } from "react"
import { Button } from "../ui/button"
import { Form } from "../ui/form"
import { FormLabel } from "../ui/form"
import { StateSearch } from "./StateSearch"
import { states, filterStateSearchItems } from "../utils"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import type { ZipCodeSearchParams } from "@/models"

const formSchema = z.object({});

type LocationFormValues = z.infer<typeof formSchema>;

interface LocationFiltersProps {
  handleLocationChange: (location: ZipCodeSearchParams) => void;
}

export default function LocationFilters({ handleLocationChange }: LocationFiltersProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [stateOptions, setStateOptions] = useState(states);
  const containerRef = useRef<HTMLDivElement>(null);

  const form = useForm<LocationFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {},
  });

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsFocused(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const { availableStates, selectedStates } = filterStateSearchItems(stateOptions, searchValue);

  const onSubmit = () => {
    handleLocationChange({
      states: selectedStates.map(state => state.code)
    });
  };

  const handleStateSelection = (code: string) => {
    setStateOptions(prevOptions => 
      prevOptions.map(state => 
        state.code === code 
          ? { ...state, isSelected: !state.isSelected }
          : state
      )
    );
  };

  return (
    <div className="flex flex-col gap-4 p-4 border rounded-lg shadow-sm">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <FormLabel>States</FormLabel>
            <div ref={containerRef} className="relative">
              <StateSearch
                isFocused={isFocused}
                searchValue={searchValue}
                availableStates={availableStates}
                selectedStates={selectedStates}
                onFocus={() => setIsFocused(true)}
                onSearchValueChange={setSearchValue}
                onStateSelection={handleStateSelection}
              />
            </div>
          </div>

          <Button type="submit">Apply Location Filters</Button>
        </form>
      </Form>
    </div>
  );
} 
