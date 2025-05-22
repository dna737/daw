"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import type { DogSearchOption } from "@/models"

const formSchema = z.object({
  zipCodes: z.string().optional(),
  ageMin: z.coerce.number().min(0).optional(),
  ageMax: z.coerce.number().min(0).optional()
}).refine(
  (data) => {
    if (data.ageMin != null && data.ageMax != null) {
      return data.ageMax >= data.ageMin;
    }
    return true;
  },
  {
    message: "Maximum age must be greater than or equal to minimum age",
    path: ["ageMax"]
  }
);

const filterSchema = z.object({
  zipCodes: z.string()
    .optional()
    .transform(val => val ? val.split(",").map(z => z.trim()).filter(Boolean) : [])
    .refine(
      (codes) => codes.every(code => /^\d{5}(-\d{4})?$/.test(code)),
      {
        message: "Each zip code must be in format 12345 or 12345-6789",
        path: ["zipCodes"]
      }
    ),
  ageMin: z.coerce.number().min(0).optional(),
  ageMax: z.coerce.number().min(0).optional()
}).refine(
  (data) => {
    if (data.ageMin != null && data.ageMax != null) {
      return data.ageMax >= data.ageMin;
    }
    return true;
  },
  {
    message: "Maximum age must be greater than or equal to minimum age",
    path: ["ageMax"]
  }
);

type FormValues = z.infer<typeof formSchema>;
type FilterValues = z.infer<typeof filterSchema>;

interface FiltersProps {
  breeds: DogSearchOption[];
  onFilterChange: (filters: {
    breeds: string[];
    zipCodes: string[];
    ageMin?: number;
    ageMax?: number;
  }) => void;
}

export default function Filters({ breeds, onFilterChange }: FiltersProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      zipCodes: "",
      ageMin: undefined,
      ageMax: undefined,
    },
  })

  const onSubmit = (data: FormValues) => {
    const validatedData = filterSchema.parse(data);
    onFilterChange({
      breeds: breeds.filter(b => b.isSelected).map(b => b.name),
      zipCodes: validatedData.zipCodes,
      ageMin: validatedData.ageMin,
      ageMax: validatedData.ageMax
    });
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">Filters</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80">
        <DropdownMenuLabel>Filter Options</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <Form {...form}>
          <form onChange={form.handleSubmit(onSubmit)} className="p-4 space-y-4">
            <FormField
              control={form.control}
              name="zipCodes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Zip Codes</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter zip codes (comma-separated)" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="space-y-2">
              <FormLabel>Age Range</FormLabel>
              <div className="flex gap-2">
                <FormField
                  control={form.control}
                  name="ageMin"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormControl>
                        <Input type="number" placeholder="Min age" {...field} />
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
                        <Input type="number" placeholder="Max age" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </form>
        </Form>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
