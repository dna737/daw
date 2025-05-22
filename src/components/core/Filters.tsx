import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form"
import { Input } from "../ui/input"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "../ui/button"
import type { FilterOptions } from "@/models"

const formSchema = z.object({
  zipCodes: z.string().optional(),
  ageMin: z.coerce.number().min(0).optional(),
  ageMax: z.coerce.number().min(0).optional(),
}).refine((data) => {
  if (data.ageMin && data.ageMax) {
    return data.ageMin <= data.ageMax;
  }
  return true;
}, {
  message: "Minimum age must be less than or equal to maximum age",
  path: ["ageMin"]
});

type FormValues = z.infer<typeof formSchema>;

export default function Filters(props: { handleFilterChange: (filter: FilterOptions) => void }) {

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      zipCodes: "",
      ageMin: undefined,
      ageMax: undefined
    }
  });

  const { handleFilterChange } = props;

  const onSubmit = (values: FormValues) => {
    console.log("values", values);
    handleFilterChange({
      zipCodes: values.zipCodes?.split(",").map(code => code.trim()).filter(Boolean) ?? undefined,
      ageMin: values.ageMin,
      ageMax: values.ageMax
    });
  };

  return (
    <div className="w-80 border rounded-lg shadow-sm h-fit">
      <div className="p-4 border-b">
        <h4 className="font-medium">Filter Options</h4>
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="p-4 space-y-4">
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
          <Button type="submit">Apply Filters</Button>
        </form>
      </Form>
    </div>
  )
}
