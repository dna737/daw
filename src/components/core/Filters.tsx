import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
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

const formSchema = z.object({
  ageMin: z.coerce.number().min(0).optional(),
  ageMax: z.coerce.number().min(0).optional(),
  zipCodes: z.string().optional(),
}).refine((data) => {
  if (data.ageMin === undefined || data.ageMax === undefined) return true;
  return data.ageMax >= data.ageMin;
}, {
  message: "Maximum age must be greater than or equal to minimum age",
  path: ["ageMax"],
});

type FilterFormValues = z.infer<typeof formSchema>;

interface FiltersProps {
  handleFilterChange: (filter: { ageMin?: number; ageMax?: number; zipCodes?: string[]; }) => void;
}

export default function Filters({ handleFilterChange }: FiltersProps) {
  const form = useForm<FilterFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      ageMin: undefined,
      ageMax: undefined,
      zipCodes: "",
    },
  });

  const onSubmit = (data: FilterFormValues) => {
    const parsedData = formSchema.parse(data);
    const zipCodes = parsedData.zipCodes ? parsedData.zipCodes.split(",").map(zip => zip.trim()).filter(Boolean) : undefined;
    
    if (zipCodes && !zipCodes.every(zip => /^\d{5}$/.test(zip))) {
      form.setError("zipCodes", { message: "Each zip code must be 5 digits" });
      return;
    }

    handleFilterChange({
      ageMin: parsedData.ageMin,
      ageMax: parsedData.ageMax,
      zipCodes,
    });
  };

  return (
    <div className="flex flex-col gap-4 p-4 border rounded-lg shadow-sm">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <FormLabel>Zip Codes</FormLabel>
            <FormField
              control={form.control}
              name="zipCodes"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input placeholder="00000, 00001, etc." {...field} className="text-sm" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
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

