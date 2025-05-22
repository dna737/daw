import { z } from "zod";
import { Form, FormField, FormItem, FormLabel, FormControl } from "../ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "../ui/input";
import { Button } from "../ui/button";

export default function PageJumper(props: {totalPages: number, currentPage: number, onPageChange: (page: number) => void}) {
  const { totalPages, currentPage, onPageChange } = props;

const formSchema = z.object({
  page: z.coerce.number()
    .min(1, "Page number must be at least 1")
    .max(totalPages, "Page number must be less than or equal to " + totalPages)
});

type FormValues = z.infer<typeof formSchema>;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      page: currentPage
    }
  });

  const onSubmit = (values: FormValues) => {
    if (values.page > 0 && values.page <= totalPages) {
      onPageChange(values.page);
    }
  };


  return (
    <div className="flex items-center gap-2">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex items-center gap-2">
            <FormField
              control={form.control}
              name="page"
              render={({ field }) => (
                <FormItem className="flex items-center gap-2">
                  <FormLabel className="text-sm font-medium">Go to page</FormLabel>
                  <FormControl>
                    <Input 
                      id="page"
                      type="number" 
                      placeholder="Go to page" 
                      className="w-24"
                      max={totalPages} 
                      min={1} 
                      {...field}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <Button type="submit" className="shrink-0">Go</Button>
          </form>
        </Form>
    </div>
  );
}
