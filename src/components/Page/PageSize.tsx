import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel } from "../ui/form";
import { Input } from "../ui/input";
import { Button } from "../ui/button";

const MAX_PAGE_SIZE = 100;

const formSchema = z.object({
  pageSize: z.coerce.number()
    .min(1, "Page size must be at least 1")
    .max(MAX_PAGE_SIZE, `Page size must be less than or equal to ${MAX_PAGE_SIZE}`)
});

type FormValues = z.infer<typeof formSchema>;

export default function PageSize(props: {pageSize: number, setPageSize: (pageSize: number) => void}) {
  const { pageSize, setPageSize } = props;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      pageSize: pageSize
    }
  });

  const onSubmit = (values: FormValues) => {
    setPageSize(values.pageSize);
  };

  return (
    <div className="flex items-center gap-2">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex items-center gap-2">
          <FormField
            control={form.control}
            name="pageSize"
            render={({ field }) => (
              <FormItem className="flex items-center gap-2">
                {/** TODO:  */}
                <FormLabel className="text-sm font-medium">Results per page</FormLabel>
                <FormControl>
                  <Input 
                    required
                    type="number" 
                    className="w-24" 
                    // placeholder="25"
                    max={MAX_PAGE_SIZE} 
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
