import {
  Pagination as PaginationComponent,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { getPageRange } from "../utils";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel } from "../ui/form";
import PageSize from "./PageSize";

export default function Pagination(props: {currentPage: number, totalPages: number, onPageChange: (page: number) => void, pageSize: number, setPageSize: (pageSize: number) => void}) {
  const { currentPage, totalPages, onPageChange, pageSize, setPageSize } = props;

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
    <div className="flex flex-col sm:flex-row w-full gap-4">
      <PageSize pageSize={pageSize} setPageSize={setPageSize} />

      <PaginationComponent className="flex-1">
        <PaginationContent>
          <PaginationItem>
            {currentPage > 1 && (
              <PaginationPrevious 
                className="cursor-pointer"
                onClick={() => currentPage > 1 && onPageChange(currentPage - 1)}
              />
            )}
          </PaginationItem>

         {getPageRange(currentPage, totalPages).map((page, idx) => (
            <PaginationItem key={idx}>
              {typeof page === "string" ? (
                <PaginationEllipsis />
              ) : (
                <PaginationLink
                  className="cursor-pointer"
                  isActive={page === currentPage}
                  onClick={() => onPageChange(page)}
                >
                  {page}
                </PaginationLink>
              )}
            </PaginationItem>
          ))}

          <PaginationItem>
            {currentPage < totalPages && (
              <PaginationNext 
                className="cursor-pointer"
                onClick={() => currentPage < totalPages && onPageChange(currentPage + 1)}
              />
            )}
          </PaginationItem>
          </PaginationContent>
        </PaginationComponent>

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
    </div>
  )
}
