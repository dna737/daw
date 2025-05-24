import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, type UseFormReturn } from "react-hook-form"
import { z } from "zod"
import { Button } from "../ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form"
import { Input } from "../ui/input"
import { StateSearch } from "./StateSearch"
import { useState, useRef, useEffect } from "react"
import type { ZipCodeSearchParams } from "@/models"
import { filterStateSearchItems, getStateOptions } from "../utils"
import { Label } from "../ui/label"
import { RadioGroup, RadioGroupItem } from "../ui/radio-group"

const formSchema = z.object({
  ageMin: z.coerce.number().min(0).optional(),
  ageMax: z.coerce.number().min(0).optional(),
  states: z.array(z.string()).optional(),
  city: z.string().optional(),
  zipCodeLoading: z.enum(["next", "previous", "all", "custom"]).optional(),
  customZipSize: z.coerce.number().min(1).optional(),
}).refine((data) => {
  if (data.ageMin === undefined || data.ageMax === undefined) return true;
  return data.ageMax >= data.ageMin;
}, {
  message: "Maximum age must be greater than or equal to minimum age",
  path: ["ageMax"],
}).refine((data) => {
  if (data.zipCodeLoading !== "custom") return true;
  return data.customZipSize !== undefined;
}, {
  message: "Custom ZIP size is required when using custom loading",
  path: ["customZipSize"],
});

type FilterFormValues = z.infer<typeof formSchema>;

interface FiltersProps {
  handleFilterChange: (filter: { ageMin?: number; ageMax?: number; }) => void;
  handleLocationChange: (location: ZipCodeSearchParams) => void;
  totalZipCodes: number;
  currentZipSize: number;
  zipCodeResultsMessage: string;
  zipCodeFrom: number;
}

function ZipCodeLoadingRadioGroup({ currentZipSize, totalZipCodes, form, zipCodeFrom }: { currentZipSize: number; totalZipCodes: number; form: UseFormReturn<FilterFormValues>; zipCodeFrom: number }) {
  return (
          <div className="space-y-2">
            <FormLabel>ZIP Code Loading</FormLabel>
            <FormField
              control={form.control}
              name="zipCodeLoading"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="space-y-2"
                    >
                      {zipCodeFrom + currentZipSize < totalZipCodes && (
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="next" id="next" />
                          <Label htmlFor="next">Load next {currentZipSize} ZIPs</Label>
                        </div>
                      )}
                      {zipCodeFrom > 0 && (
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="previous" id="previous" />
                          <Label htmlFor="previous">Load previous {currentZipSize} ZIPs</Label>
                        </div>
                      )}
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="all" id="all" />
                        <Label htmlFor="all">Load all ZIPs ({totalZipCodes})</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="custom" id="custom" />
                        <Label htmlFor="custom">Set custom ZIP size</Label>
                      </div>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="customZipSize"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      type="number"
                      min={1}
                      max={totalZipCodes}
                      placeholder={`Enter size (1-${totalZipCodes})`}
                      {...field}
                      className="text-sm"
                      disabled={form.watch("zipCodeLoading") !== "custom"}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
  );
}

export default function Filters({ handleFilterChange, handleLocationChange, totalZipCodes, currentZipSize, zipCodeResultsMessage, zipCodeFrom }: FiltersProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [stateOptions, setStateOptions] = useState(getStateOptions());
  const containerRef = useRef<HTMLDivElement>(null);

  const form = useForm<FilterFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      ageMin: undefined,
      ageMax: undefined,
      states: [],
      city: "",
      zipCodeLoading: undefined,
      customZipSize: currentZipSize,
    },
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

  const onSubmit = (data: FilterFormValues) => {
    const parsedData = formSchema.parse(data);
    
    // Handle age filters
    handleFilterChange({
      ageMin: parsedData.ageMin,
      ageMax: parsedData.ageMax,
    });

    // Handle location filters
    const locationData: ZipCodeSearchParams = {};
    if(parsedData.city) {
      locationData.city = parsedData.city;
    }
    if(selectedStates.length > 0) {
      locationData.states = selectedStates.map(state => state.code);
    }

    // Handle ZIP code loading options
    switch (parsedData.zipCodeLoading) {
      case "next":
        locationData.from = zipCodeFrom + currentZipSize;
        locationData.size = currentZipSize;
        break;
      case "previous":
        locationData.from = zipCodeFrom - currentZipSize;
        locationData.size = currentZipSize;
        break;
      case "all":
        locationData.from = 0;
        locationData.size = totalZipCodes;
        break;
      case "custom":
        if (parsedData.customZipSize) {
          locationData.from = 0;
          locationData.size = Math.min(parsedData.customZipSize, totalZipCodes);
        }
        break;
    }

    handleLocationChange(locationData);
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
      {totalZipCodes > 0 && (
        <div className="text-gray-500 text-left text-sm">
          {zipCodeResultsMessage}
        </div>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {totalZipCodes > 0 && <ZipCodeLoadingRadioGroup currentZipSize={currentZipSize} totalZipCodes={totalZipCodes} form={form} zipCodeFrom={zipCodeFrom} />}

          <div className="space-y-2">
            <FormLabel>City</FormLabel>
            <FormField
              control={form.control}
              name="city"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input placeholder="Enter city name" {...field} className="text-sm" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

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

          <div className="space-y-2">
            <FormLabel>Age Range</FormLabel>
            <div className="flex gap-2">
              <FormField
                control={form.control}
                name="ageMin"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormControl>
                      <Input type="number" placeholder="Min" {...field} className="text-sm" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="ageMax"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormControl>
                      <Input type="number" placeholder="Max" {...field} className="text-sm" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          <Button type="submit">Apply Filters</Button>
        </form>
      </Form>
    </div>
  );
}

