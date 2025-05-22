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

const filterSchema = z.object({
  zipCodes: z.string().optional(),
  ageMin: z.coerce.number().optional().unwrap().min(0),
  ageMax: z.coerce.number().optional().unwrap().min(0)
})

type FilterFormValues = z.infer<typeof filterSchema>

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
  const form = useForm<FilterFormValues>({
    resolver: zodResolver(filterSchema),
    defaultValues: {
      zipCodes: "",
      ageMin: undefined,
      ageMax: undefined,
    },
  })

  const onSubmit = (data: FilterFormValues) => {
    onFilterChange({
      breeds: breeds.filter(b => b.isSelected).map(b => b.name),
      zipCodes: data.zipCodes ? data.zipCodes.split(",").map(z => z.trim()).filter(Boolean) : [],
      ageMin: data.ageMin ? data.ageMin : undefined,
      ageMax: data.ageMax ? data.ageMax : undefined
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
