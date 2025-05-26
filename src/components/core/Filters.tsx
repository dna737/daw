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
import type { FilterOptions, GeoBoundingBox, ZipCodeSearchParams } from "@/models"
import { castToNumbers, filterStateSearchItems, getStateOptions } from "../utils"
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
import { MapIndicator } from "."
import _isEqual from 'lodash/isEqual'
import {
  MIN_LATITUDE, MAX_LATITUDE, MIN_LONGITUDE, MAX_LONGITUDE,
  MAX_CUSTOM_ZIP_SIZE, DEFAULT_ZIP_PAGE_SIZE
} from "../utils"

const formSchema = z.object({
  ageMin: z.coerce.number().min(0).optional(),
  ageMax: z.coerce.number().min(0).optional(),
  city: z.string().optional(),
  zipCodeLoading: z.enum(["next", "previous", "custom"]).optional(),
  customZipSize: z.coerce.number().min(1).optional(),
  boundingBoxType: z.enum(["none", "edges", "corners"]).optional(),
  geoBoundingBox: z.object({
    top: z.coerce.number().min(MIN_LATITUDE).max(MAX_LATITUDE).optional(),
    left: z.coerce.number().min(MIN_LONGITUDE).max(MAX_LONGITUDE).optional(),
    bottom: z.coerce.number().min(MIN_LATITUDE).max(MAX_LATITUDE).optional(),
    right: z.coerce.number().min(MIN_LONGITUDE).max(MAX_LONGITUDE).optional(),
    point1: z.object({
      lat: z.coerce.number().min(MIN_LATITUDE).max(MAX_LATITUDE),
      lon: z.coerce.number().min(MIN_LONGITUDE).max(MAX_LONGITUDE)
    }).optional(),
    point2: z.object({
      lat: z.coerce.number().min(MIN_LATITUDE).max(MAX_LATITUDE),
      lon: z.coerce.number().min(MIN_LONGITUDE).max(MAX_LONGITUDE)
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
    const { top, left, bottom, right, point1, point2 } = data.geoBoundingBox;
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
      case "corners":
        if (!point1 || !point2) {
          ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Point 1 and Point 2 coordinates are required for 'corners' type.", path: ["geoBoundingBox"] });
        } else {
          if (point1.lat === point2.lat) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Latitudes must differ", path: ["geoBoundingBox", "point1", "lat"] });
            ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Latitudes must differ", path: ["geoBoundingBox", "point2", "lat"] });
          }
          if (point1.lon === point2.lon) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Longitudes must differ", path: ["geoBoundingBox", "point1", "lon"] });
            ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Longitudes must differ", path: ["geoBoundingBox", "point2", "lon"] });
          }
          if (Math.abs(point1.lat - point2.lat) <= 1) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Lat. diff. must be > 1", path: ["geoBoundingBox", "point1", "lat"] });
            ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Lat. diff. must be > 1", path: ["geoBoundingBox", "point2", "lat"] });
          }
          if (Math.abs(point1.lon - point2.lon) <= 1) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Lon. diff. must be > 1", path: ["geoBoundingBox", "point1", "lon"] });
            ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Lon. diff. must be > 1", path: ["geoBoundingBox", "point2", "lon"] });
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
    } else if(data.customZipSize > MAX_CUSTOM_ZIP_SIZE) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Custom ZIP size cannot exceed ${MAX_CUSTOM_ZIP_SIZE}`,
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
  const geoBoundingBoxValue = form.watch("geoBoundingBox");

  const hasErrors = (type: typeof boundingBoxType): boolean => {
    const errors = form.formState.errors;
    if (!errors || !errors.geoBoundingBox) {
      return false;
    }

    const geoBoundingBoxErrors = errors.geoBoundingBox;
    let result = false;

    if (type === "edges") {
      result = !!(geoBoundingBoxErrors.message || geoBoundingBoxErrors.top || geoBoundingBoxErrors.left || geoBoundingBoxErrors.bottom || geoBoundingBoxErrors.right);
    } else if (type === "corners") {
      result = !!(geoBoundingBoxErrors.message || 
                  geoBoundingBoxErrors.point1 || 
                  (geoBoundingBoxErrors.point1 as any)?.lat || 
                  (geoBoundingBoxErrors.point1 as any)?.lon || 
                  geoBoundingBoxErrors.point2 || 
                  (geoBoundingBoxErrors.point2 as any)?.lat || 
                  (geoBoundingBoxErrors.point2 as any)?.lon);
    }
    return result;
  }

  const castedGeoBoundingBox = castToNumbers(geoBoundingBoxValue);
  let mapIndicatorGeoBoundingBox: GeoBoundingBox | undefined = undefined;
  let mapIndicatorType: string | undefined = boundingBoxType;

  if (castedGeoBoundingBox && boundingBoxType === "corners" && castedGeoBoundingBox.point1 && castedGeoBoundingBox.point2) {
    if (!hasErrors("corners")) {
      const { point1, point2 } = castedGeoBoundingBox;
      if (point1.lat !== point2.lat && point1.lon !== point2.lon) {
        if (point1.lat < point2.lat && point1.lon < point2.lon) { // P1=BL, P2=TR
          mapIndicatorGeoBoundingBox = { bottom_left: point1, top_right: point2 };
          mapIndicatorType = "upper_diagonal";
        } else if (point1.lat > point2.lat && point1.lon > point2.lon) { // P1=TR, P2=BL
          mapIndicatorGeoBoundingBox = { bottom_left: point2, top_right: point1 };
          mapIndicatorType = "upper_diagonal";
        } else if (point1.lat > point2.lat && point1.lon < point2.lon) { // P1=TL, P2=BR
          mapIndicatorGeoBoundingBox = { top_left: point1, bottom_right: point2 };
          mapIndicatorType = "lower_diagonal";
        } else if (point1.lat < point2.lat && point1.lon > point2.lon) { // P1=BR, P2=TL
          mapIndicatorGeoBoundingBox = { top_left: point2, bottom_right: point1 };
          mapIndicatorType = "lower_diagonal";
        } else {
          mapIndicatorType = "none"; // Invalid corner combination for diagonal
        }
      } else {
        mapIndicatorType = "none"; // Lat or Lon are the same, not valid for preview
      }
    } else {
      mapIndicatorType = "none";
    }
  } else if (castedGeoBoundingBox && boundingBoxType === "edges") {
    if (!hasErrors("edges")) {
      const { top, left, bottom, right } = castedGeoBoundingBox;
      if (
        (top === 0 && left === 0 && bottom === 0 && right === 0) || // Default values.  API doesn't support this.
        bottom >= top ||
        left >= right
      ) {
        mapIndicatorType = "none"; // Don't render map for these invalid states
      } else {
        mapIndicatorGeoBoundingBox = castedGeoBoundingBox as GeoBoundingBox;
      }
    } else {
      mapIndicatorType = "none";
    }
  } else {
    mapIndicatorType = "none";
  }

  const canRenderMap = mapIndicatorGeoBoundingBox && mapIndicatorType !== "none" && mapIndicatorType !== undefined;

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
                        <RadioGroupItem value="corners" id="corners" />
                        <Label htmlFor="corners" className="text-left">Corners</Label>
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
                          min={MIN_LATITUDE} 
                          max={MAX_LATITUDE} 
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
                          min={MIN_LONGITUDE} 
                          max={MAX_LONGITUDE} 
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
                          min={MIN_LATITUDE} 
                          max={MAX_LATITUDE} 
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
                          min={MIN_LONGITUDE} 
                          max={MAX_LONGITUDE} 
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
                <FormField
                  control={form.control}
                  name="geoBoundingBox"
                  render={() => <FormMessage />}
                />
              </div>
              </>
            )}

            {boundingBoxType === "corners" && (
              <>
              <Separator className="my-4" />
              <div className="grid grid-cols-2 gap-2 mt-2 items-start">
                {/* P1 Latitude */}
                <FormField
                  control={form.control}
                  name="geoBoundingBox.point1.lat"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>P1 (Latitude)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="e.g. 40.0"
                          min={MIN_LATITUDE} 
                          max={MAX_LATITUDE} 
                          step="any"
                          {...field} 
                          className="text-sm"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {/* P1 Longitude */}
                <FormField
                  control={form.control}
                  name="geoBoundingBox.point1.lon"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>P1 (Longitude)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="e.g. -100.0"
                          min={MIN_LONGITUDE} 
                          max={MAX_LONGITUDE} 
                          step="any"
                          {...field} 
                          className="text-sm"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {/* P2 Latitude */}
                <FormField
                  control={form.control}
                  name="geoBoundingBox.point2.lat"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>P2 (Latitude)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="e.g. 30.0"
                          min={MIN_LATITUDE} 
                          max={MAX_LATITUDE} 
                          step="any"
                          {...field} 
                          className="text-sm"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {/* P2 Longitude */}
                <FormField
                  control={form.control}
                  name="geoBoundingBox.point2.lon"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>P2 (Longitude)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="e.g. -90.0"
                          min={MIN_LONGITUDE} 
                          max={MAX_LONGITUDE} 
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
                <FormField
                  control={form.control}
                  name="geoBoundingBox"
                  render={() => <FormMessage />}
                />
              </div>
              </>
            )}

            {canRenderMap && (
              <div className="mt-4">
                <MapIndicator geoBoundingBox={mapIndicatorGeoBoundingBox} type={mapIndicatorType} />
              </div>
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
                      max={totalZipCodes > 0 ? Math.min(totalZipCodes, MAX_CUSTOM_ZIP_SIZE) : undefined }
                      placeholder={`Enter size (1-${totalZipCodes > 0 ? Math.min(totalZipCodes, MAX_CUSTOM_ZIP_SIZE) : 'max'})`}
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
      point1: { lat: 0, lon: 0 },
      point2: { lat: 0, lon: 0 },
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
    mode: "onChange",
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
    const updatedFilters: FilterOptions = {};
    if(data.ageMin) {
      updatedFilters.ageMin = data.ageMin;
    }
    if(data.ageMax) {
      updatedFilters.ageMax = data.ageMax;
    }
  
    if(Object.keys(updatedFilters).length > 0) {
      handleFilterChange(updatedFilters);
    }

    const locationData: ZipCodeSearchParams = {};
    if(data.city) { 
      locationData.city = data.city;
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
      } else if (data.boundingBoxType === "corners" && 
                 box.point1 && 
                 box.point2) {
        const { lat: lat1, lon: lon1 } = box.point1;
        const { lat: lat2, lon: lon2 } = box.point2;

        if (lat1 !== lat2 && lon1 !== lon2) {
          // 1: (upper diagonal)
          if (lat1 < lat2 && lon1 < lon2) {
            locationData.geoBoundingBox = { 
              bottom_left: { lat: lat1, lon: lon1 }, 
              top_right: { lat: lat2, lon: lon2 } 
            } as const;
          // 2: (upper diagonal, swapped)
          } else if (lat1 > lat2 && lon1 > lon2) {
            locationData.geoBoundingBox = { 
              bottom_left: { lat: lat2, lon: lon2 }, 
              top_right: { lat: lat1, lon: lon1 } 
            } as const;
          // 3: (lower diagonal)
          } else if (lat1 > lat2 && lon1 < lon2) {
            locationData.geoBoundingBox = { 
              top_left: { lat: lat1, lon: lon1 }, 
              bottom_right: { lat: lat2, lon: lon2 } 
            } as const;
          // 4: (lower diagonal, swapped)
          } else if (lat1 < lat2 && lon1 > lon2) {
            locationData.geoBoundingBox = { 
              top_left: { lat: lat2, lon: lon2 }, 
              bottom_right: { lat: lat1, lon: lon1 } 
            } as const;
          }
        }
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
          locationData.from = 0;
          locationData.size = data.customZipSize ? Math.min(data.customZipSize, MAX_CUSTOM_ZIP_SIZE) : DEFAULT_ZIP_PAGE_SIZE;
        break;
      default:
        locationData.from = 0;
        locationData.size = DEFAULT_ZIP_PAGE_SIZE;
        break;
    }

  const keys = [...formSchema._def.schema.keyof().options];
  const keysToCompare = keys.filter(key => key !== "zipCodeLoading" && key !== "customZipSize");

  for(const key of keysToCompare) {
    // This checks if there's a new value that wasn't there before.
    if(String(data[key] ?? "").length > 0 && String(lastAppliedFilters[key] ?? "").length === 0) {
      locationData.from = 0;
      locationData.size = DEFAULT_ZIP_PAGE_SIZE;
      break;
    }
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
