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
import { cn } from "@/lib/utils"
  import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../ui/accordion"
import { Separator } from "../ui/separator"

const formSchema = z.object({
  ageMin: z.coerce.number().min(0).optional(),
  ageMax: z.coerce.number().min(0).optional(),
  states: z.array(z.string()).optional(),
  city: z.string().optional(),
  zipCodeLoading: z.enum(["next", "previous", "all", "custom"]).optional(),
  customZipSize: z.coerce.number().min(1).optional(),
  boundingBoxType: z.enum(["none", "edges", "upper_diagonal", "lower_diagonal"]).optional(),
  geoBoundingBox: z.object({
    top: z.coerce.number().min(-90).max(90).optional(),
    left: z.coerce.number().min(-180).max(180).optional(),
    bottom: z.coerce.number().min(-90).max(90).optional(),
    right: z.coerce.number().min(-180).max(180).optional(),
    bottom_left: z.object({
      lat: z.coerce.number().min(-90).max(90),
      lon: z.coerce.number().min(-180).max(180)
    }).optional(),
    top_right: z.object({
      lat: z.coerce.number().min(-90).max(90),
      lon: z.coerce.number().min(-180).max(180)
    }).optional(),
    bottom_right: z.object({
      lat: z.coerce.number().min(-90).max(90),
      lon: z.coerce.number().min(-180).max(180)
    }).optional(),
    top_left: z.object({
      lat: z.coerce.number().min(-90).max(90),
      lon: z.coerce.number().min(-180).max(180)
    }).optional(),
  }).optional(),
}).refine((data) => {
  if (data.ageMin === undefined || data.ageMax === undefined) return true;
  return data.ageMax >= data.ageMin;
}, {
  message: "Maximum age must be >= minimum age",
  path: ["ageMax"],
}).refine((data) => {
  if (data.zipCodeLoading !== "custom") return true;
  return data.customZipSize !== undefined;
}, {
  message: "Custom ZIP size is required when using custom loading",
  path: ["customZipSize"],
}).refine((data) => {
  if (data.boundingBoxType === "none" || !data.geoBoundingBox) return true;
  
  const { top, left, bottom, right, bottom_left, top_right, bottom_right, top_left } = data.geoBoundingBox;
  
  switch (data.boundingBoxType) {
    case "edges":
      if (top === undefined || left === undefined || bottom === undefined || right === undefined) return false;
      // (south < north)
      if (bottom >= top) return false;
      // (west < east)
      if (left >= right) return false;
      return true;
    case "upper_diagonal":
      if (!bottom_left || !top_right) return false;
      // (south < north)
      if (bottom_left.lat >= top_right.lat) return false;
      // (west < east)
      if (bottom_left.lon >= top_right.lon) return false;
      return true;
    case "lower_diagonal":
      if (!bottom_right || !top_left) return false;
      // (south < north)
      if (bottom_right.lat >= top_left.lat) return false;
      // (west < east)
      if (bottom_right.lon >= top_left.lon) return false;
      return true;
    default:
      return true;
  }
}, {
  message: "Invalid geographic bounding box: coordinates must form a valid box with non-zero width and height",
  path: ["geoBoundingBox"],
});

type FilterFormValues = z.infer<typeof formSchema>;

interface FiltersProps {
  handleFilterChange: (filter: { ageMin?: number; ageMax?: number; }) => void;
  handleLocationChange: (location: ZipCodeSearchParams) => void;
  totalZipCodes: number;
  currentZipSize: number;
  zipCodeResultsMessage: string;
  zipCodeFrom: number;
  handleZipCodeReset: () => void;
}

function BoundingBoxAccordion({ form }: { form: UseFormReturn<FilterFormValues> }) {
  const boundingBoxType = form.watch("boundingBoxType");

  return (
    <Accordion 
      type="single" 
      collapsible 
      className="w-full" 
    >
      <AccordionItem value={"item-1"}>
        <AccordionTrigger>Geographic Bounding Box</AccordionTrigger>
        <AccordionContent>
            <FormField
              control={form.control}
              name="boundingBoxType"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      value={field.value}
                      className="space-y-2"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="none" id="none" />
                        <Label htmlFor="none">None</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="edges" id="edges" />
                        <Label htmlFor="edges" className="text-left">Edges</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="upper_diagonal" id="upper_diagonal" />
                        <Label htmlFor="upper_diagonal" className="text-left">Top Diagonal</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="lower_diagonal" id="lower_diagonal" />
                        <Label htmlFor="lower_diagonal" className="text-left">Bottom Diagonal</Label>
                      </div>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {boundingBoxType === "edges" && (
              <>
              <Separator className="my-4" />
              <div className="grid grid-cols-2 gap-2 mt-2">
                <FormField
                  control={form.control}
                  name="geoBoundingBox.top"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="Top (lat.)" 
                          min={-90} 
                          max={90} 
                          step="any"
                          {...field} 
                          className="text-sm" 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="geoBoundingBox.left"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="Left (lon.)" 
                          min={-180} 
                          max={180} 
                          step="any"
                          {...field} 
                          className="text-sm" 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="geoBoundingBox.bottom"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="Bottom (lat.)" 
                          min={-90} 
                          max={90} 
                          step="any"
                          {...field} 
                          className="text-sm" 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="geoBoundingBox.right"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="Right (lon.)" 
                          min={-180} 
                          max={180} 
                          step="any"
                          {...field} 
                          className="text-sm" 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="mt-2">
                <FormMessage />
              </div>
              </>
            )}

            {boundingBoxType === "upper_diagonal" && (
              <>
              <Separator className="my-4" />
              <div className="grid grid-cols-2 gap-2 mt-2">
                <div className="space-y-2">
                  <Label>Bottom Left</Label>
                  <div className="grid grid-rows-2 gap-2 w-25">
                    <FormField
                      control={form.control}
                      name="geoBoundingBox.bottom_left.lat"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="Latitude" 
                              min={-90} 
                              max={90} 
                              step="any"
                              {...field} 
                              className="text-sm" 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="geoBoundingBox.bottom_left.lon"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="Longitude" 
                              min={-180} 
                              max={180} 
                              step="any"
                              {...field} 
                              className="text-sm" 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Top Right</Label>
                  <div className="grid grid-rows-2 gap-2 w-25">
                    <FormField
                      control={form.control}
                      name="geoBoundingBox.top_right.lat"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="Latitude" 
                              min={-90} 
                              max={90} 
                              step="any"
                              {...field} 
                              className="text-sm" 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="geoBoundingBox.top_right.lon"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="Longitude" 
                              min={-180} 
                              max={180} 
                              step="any"
                              {...field} 
                              className="text-sm" 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </div>
              <div className="mt-2">
                <FormMessage />
              </div>
              </>
            )}

            {boundingBoxType === "lower_diagonal" && (
              <>
              <Separator className="my-4" />
              <div className="grid grid-cols-2 gap-2 mt-2">
                <div className="space-y-2">
                  <Label>Bottom Right</Label>
                  <div className="grid grid-rows-2 gap-2 w-25">
                    <FormField
                      control={form.control}
                      name="geoBoundingBox.bottom_right.lat"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="Latitude" 
                              min={-90} 
                              max={90} 
                              step="any"
                              {...field} 
                              className="text-sm" 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="geoBoundingBox.bottom_right.lon"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="Longitude" 
                              min={-180} 
                              max={180} 
                              step="any"
                              {...field} 
                              className="text-sm" 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Top Left</Label>
                  <div className="grid grid-rows-2 gap-2 w-25">
                    <FormField
                      control={form.control}
                      name="geoBoundingBox.top_left.lat"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="Latitude" 
                              min={-90} 
                              max={90} 
                              step="any"
                              {...field} 
                              className="text-sm" 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="geoBoundingBox.top_left.lon"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="Longitude" 
                              min={-180} 
                              max={180} 
                              step="any"
                              {...field} 
                              className="text-sm" 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </div>
              <div className="mt-2">
                <FormMessage />
              </div>
              </>
            )}
          </AccordionContent>
      </AccordionItem>
    </Accordion>
  )
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
                          <Label htmlFor="next">Load next {Math.min(currentZipSize, totalZipCodes - (zipCodeFrom + currentZipSize))} ZIPs</Label>
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

export default function Filters({ handleFilterChange, handleLocationChange, totalZipCodes, currentZipSize, zipCodeResultsMessage, zipCodeFrom, handleZipCodeReset }: FiltersProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [stateOptions, setStateOptions] = useState(getStateOptions());
  const containerRef = useRef<HTMLDivElement>(null);
  const [isZipCodeAllowed, setIsZipCodeAllowed] = useState(false);

  const form = useForm<FilterFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      ageMin: undefined,
      ageMax: undefined,
      states: [],
      city: "",
      zipCodeLoading: undefined,
      customZipSize: currentZipSize,
      boundingBoxType: "none",
      geoBoundingBox: {
        top: undefined,
        left: undefined,
        bottom: undefined,
        right: undefined,
        bottom_left: undefined,
        top_right: undefined,
        bottom_right: undefined,
        top_left: undefined,
      },
    },
  });

  useEffect(() => {
    setIsZipCodeAllowed(form.formState.isDirty);
  }, [form.formState.isDirty]);

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
    console.log('oof')
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
    if(parsedData.boundingBoxType !== "none" && parsedData.geoBoundingBox) {
      const box = parsedData.geoBoundingBox;
      if (parsedData.boundingBoxType === "edges" && 
          box.top !== undefined && 
          box.left !== undefined && 
          box.bottom !== undefined && 
          box.right !== undefined) {
        locationData.geoBoundingBox = {
          top: box.top,
          left: box.left,
          bottom: box.bottom,
          right: box.right
        } as const;
      } else if (parsedData.boundingBoxType === "upper_diagonal" && 
                 box.bottom_left && 
                 box.top_right) {
        locationData.geoBoundingBox = {
          bottom_left: box.bottom_left,
          top_right: box.top_right
        } as const;
      } else if (parsedData.boundingBoxType === "lower_diagonal" && 
                 box.bottom_right && 
                 box.top_left) {
        locationData.geoBoundingBox = {
          bottom_left: box.bottom_right,
          top_right: box.top_left
        } as const;
      }
    }

    // Handle ZIP code loading options
    switch (parsedData.zipCodeLoading) {
      case "next":
        locationData.from = (zipCodeFrom + currentZipSize) > totalZipCodes ? 0 : zipCodeFrom + currentZipSize;
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
          locationData.size = Math.min(parsedData.customZipSize ?? 25, totalZipCodes);
        }
        break;
      default:
        locationData.from = 0;
        locationData.size = 25;
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

  const isDirty = form.formState.isDirty || selectedStates.length > 0;

  const handleReset = () => {
    form.reset({
      ageMin: undefined,
      ageMax: undefined,
      states: [],
      city: "",
      zipCodeLoading: "all",
      customZipSize: 25,
      boundingBoxType: "none",
      geoBoundingBox: {
        top: undefined,
        left: undefined,
        bottom: undefined,
        right: undefined,
        bottom_left: undefined,
        top_right: undefined,
        bottom_right: undefined,
        top_left: undefined,
      },
    });
    setStateOptions(getStateOptions());
    setSearchValue("");
    handleZipCodeReset();
  };

  return (
    <div className="flex flex-col gap-4 p-4 border rounded-lg shadow-sm">
      {totalZipCodes > 0 && isZipCodeAllowed && (
        <div className="text-gray-500 text-center text-sm whitespace-pre-wrap">
          {zipCodeResultsMessage}
        </div>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {totalZipCodes > 0 && isZipCodeAllowed && <ZipCodeLoadingRadioGroup currentZipSize={currentZipSize} totalZipCodes={totalZipCodes} form={form} zipCodeFrom={zipCodeFrom} />}

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

          <div className="space-y-2">
            <BoundingBoxAccordion form={form} />
          </div>

          <div className={cn("flex", isDirty ? "justify-between" : "justify-center")}>
            {isDirty && <Button type="button" onClick={handleReset} variant="outline">Reset</Button>}
            <Button type="submit" disabled={!isDirty}>Apply Filters</Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
