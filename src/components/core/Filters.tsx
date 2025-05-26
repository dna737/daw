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
import { StateSearch } from "."
import { useState, useRef, useEffect, useMemo } from "react"
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
import _isEqual from 'lodash/isEqual'

const formSchema = z.object({
  ageMin: z.coerce.number().min(0).optional(),
  ageMax: z.coerce.number().min(0).optional(),
  city: z.string().optional(),
  zipCodeLoading: z.enum(["next", "previous", "custom"]).optional(),
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
}).superRefine((data, ctx) => {
  if (data.ageMin !== undefined && data.ageMax !== undefined && data.ageMax < data.ageMin) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Maximum age must be >= minimum age",
      path: ["ageMax"],
    });
  }

  if (data.boundingBoxType !== "none" && data.geoBoundingBox) {
    const { top, left, bottom, right, bottom_left, top_right, bottom_right, top_left } = data.geoBoundingBox;
    switch (data.boundingBoxType) {
      case "edges":
        if (top === undefined || left === undefined || bottom === undefined || right === undefined) {
          ctx.addIssue({ code: z.ZodIssueCode.custom, message: "All edge coordinates are required for 'edges' type.", path: ["geoBoundingBox"] });
        } else {
          if (bottom >= top) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Bottom lat must be < Top lat.", path: ["geoBoundingBox", "bottom"] });
            ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Top lat must be > Bottom lat.", path: ["geoBoundingBox", "top"] });
          }
          if (left >= right) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Left lon must be < Right lon.", path: ["geoBoundingBox", "left"] });
            ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Right lon must be > Left lon.", path: ["geoBoundingBox", "right"] });
          }
        }
        break;
      case "upper_diagonal":
        if (!bottom_left || !top_right) {
          ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Bottom-left and Top-right coordinates are required.", path: ["geoBoundingBox"] });
        } else {
          if (bottom_left.lat >= top_right.lat) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, message: "BL lat must be < TR lat.", path: ["geoBoundingBox", "bottom_left", "lat"] });
            ctx.addIssue({ code: z.ZodIssueCode.custom, message: "TR lat must be > BL lat.", path: ["geoBoundingBox", "top_right", "lat"] });
          }
          if (bottom_left.lon >= top_right.lon) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, message: "BL lon must be < TR lon.", path: ["geoBoundingBox", "bottom_left", "lon"] });
            ctx.addIssue({ code: z.ZodIssueCode.custom, message: "TR lon must be > BL lon.", path: ["geoBoundingBox", "top_right", "lon"] });
          }
        }
        break;
      case "lower_diagonal":
        if (!bottom_right || !top_left) {
          ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Bottom-right and Top-left coordinates are required.", path: ["geoBoundingBox"] });
        } else {
          if (bottom_right.lat >= top_left.lat) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, message: "BR lat must be < TL lat.", path: ["geoBoundingBox", "bottom_right", "lat"] });
            ctx.addIssue({ code: z.ZodIssueCode.custom, message: "TL lat must be > BR lat.", path: ["geoBoundingBox", "top_left", "lat"] });
          }
          if (bottom_right.lon >= top_left.lon) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, message: "BR lon must be < TL lon.", path: ["geoBoundingBox", "bottom_right", "lon"] });
            ctx.addIssue({ code: z.ZodIssueCode.custom, message: "TL lon must be > BR lon.", path: ["geoBoundingBox", "top_left", "lon"] });
          }
        }
        break;
    }
  }

  if (data.zipCodeLoading === "custom") {
    if(data.customZipSize === undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Custom ZIP size is required when using custom loading",
        path: ["customZipSize"],
      });
    } else if(data.customZipSize > 1000) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Custom ZIP size cannot exceed 1000", // The endpoint only supports 1000 ZIPs at a time
        path: ["customZipSize"],
      });
    }
  }
});

type FilterFormValues = z.infer<typeof formSchema>;

type TrackedFilterState = FilterFormValues & { selectedStateCodes: string[] };

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
              <div className="grid grid-cols-2 gap-2 mt-2 items-start">
                <FormField
                  control={form.control}
                  name="geoBoundingBox.top"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Top (Latitude)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="e.g. 49.0"
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
                      <FormLabel>Left (Longitude)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="e.g. -125.0"
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
                      <FormLabel>Bottom (Latitude)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="e.g. 25.0"
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
                      <FormLabel>Right (Longitude)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="e.g. -66.0"
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
                {form.formState.errors.geoBoundingBox && !form.formState.errors.geoBoundingBox.types && (
                   <p className="text-sm font-medium text-destructive">{form.formState.errors.geoBoundingBox.message}</p>
                )}
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
                      value={field.value}
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
                      max={totalZipCodes > 0 ? Math.min(totalZipCodes, 1000) : undefined }
                      placeholder={`Enter size (1-${totalZipCodes > 0 ? Math.min(totalZipCodes, 1000) : 'max'})`}
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
  const prevValuesRef = useRef<FilterFormValues>({});

  const initialFormValues: FilterFormValues = {
    ageMin: undefined,
    ageMax: undefined,
    city: "",
    zipCodeLoading: undefined,
    customZipSize: currentZipSize || 25,
    boundingBoxType: "none",
    geoBoundingBox: {
      top: 0, left: 0, bottom: 0, right: 0,
      bottom_left: { lat: 0, lon: 0 }, top_right: { lat: 0, lon: 0 }, bottom_right: { lat: 0, lon: 0 }, top_left: { lat: 0, lon: 0 },
    },
  };
  
  const getInitialTrackedState = (): TrackedFilterState => ({
    ...initialFormValues,
    selectedStateCodes: [],
  });

  const [lastAppliedFilters, setLastAppliedFilters] = useState<TrackedFilterState>(getInitialTrackedState());
  const [isChangedSinceLastApply, setIsChangedSinceLastApply] = useState(false);

  const form = useForm<FilterFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialFormValues,
  });

  const { availableStates, selectedStates } = useMemo(() => {
    return filterStateSearchItems(stateOptions, searchValue);
  }, [stateOptions, searchValue]);

  useEffect(() => {
    const currentValues = form.getValues();

    setIsChangedSinceLastApply(!_isEqual(currentValues, prevValuesRef.current));
  }, [form.watch()]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsFocused(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const onSubmit = (data: FilterFormValues) => {
    handleFilterChange({
      ageMin: data.ageMin,
      ageMax: data.ageMax,
    });

    const locationData: ZipCodeSearchParams = {};
    if(data.city) { 
      locationData.city = data.city;

      // if()
    };
    
    const currentSelectedStateCodes = selectedStates.map(state => state.code);
    if(currentSelectedStateCodes.length > 0) {
      locationData.states = currentSelectedStateCodes;
    }

    if(data.boundingBoxType !== "none" && data.geoBoundingBox) {
      const box = data.geoBoundingBox;
      if (data.boundingBoxType === "edges") {
        locationData.geoBoundingBox = { 
            top: box.top!, 
            left: box.left!, 
            bottom: box.bottom!, 
            right: box.right! 
        } as const;
      } else if (data.boundingBoxType === "upper_diagonal" && 
                 box.bottom_left && 
                 box.top_right) {
        if (box.bottom_left.lat < box.top_right.lat && box.bottom_left.lon < box.top_right.lon) {
          locationData.geoBoundingBox = { bottom_left: box.bottom_left, top_right: box.top_right } as const;
        } else {
          console.log("Upper diagonal selected, but coordinates are invalid/default. Not applying geoBoundingBox.");
        }
      } else if (data.boundingBoxType === "lower_diagonal" && 
                 box.bottom_right && 
                 box.top_left) {
        locationData.geoBoundingBox = { bottom_right: box.bottom_right, top_left: box.top_left } as const;
      }
    }

    switch (data.zipCodeLoading) {
      case "next":
        locationData.from = (zipCodeFrom + currentZipSize) > totalZipCodes ? 0 : zipCodeFrom + currentZipSize;
        locationData.size = currentZipSize;
        break;
      case "previous":
        locationData.from = zipCodeFrom - currentZipSize;
        locationData.size = currentZipSize;
        break;
      case "custom":
        if (data.customZipSize) {
          locationData.from = 0;
          locationData.size = Math.min(data.customZipSize ?? 25, 1000);
          console.log("location in custom", locationData);
        }
        break;
      default:
        locationData.from = 0;
        locationData.size = 25;
        break;
    }
    
    if(_isEqual(Object.keys(locationData), ["from", "size"])) {
      handleReset();
    } else {
      handleLocationChange(locationData);
    }

    setLastAppliedFilters({
      ...data,
      selectedStateCodes: currentSelectedStateCodes.sort(),
    });
    prevValuesRef.current = { ...data };
    setIsChangedSinceLastApply(false);
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
  
  const isButtonAreaVisible = form.formState.isDirty || selectedStates.length > 0 || isChangedSinceLastApply;

  const handleReset = () => {
    form.reset(initialFormValues);
    setStateOptions(getStateOptions());
    setSearchValue("");
    handleZipCodeReset();
    
    setLastAppliedFilters(getInitialTrackedState());
    setIsChangedSinceLastApply(false);
  };

  return (
    <div className={cn("flex flex-col gap-4 p-4 border rounded-lg shadow-sm min-w-[300px]")}>
      {totalZipCodes > 0 && (
        <div className="text-gray-500 text-center text-sm whitespace-pre-wrap">
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

          <div className="space-y-2">
            <BoundingBoxAccordion form={form} />
          </div>

          <div className={cn("flex", isButtonAreaVisible ? "justify-between" : "justify-center")}>
            {isButtonAreaVisible && <Button type="button" onClick={handleReset} variant="outline">Reset</Button>}
            <Button type="submit" disabled={!isChangedSinceLastApply}>Apply Filters</Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
