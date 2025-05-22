import { z } from "zod";

const formSchema = z.object({
  page: z.coerce.number()
    .refine(val => !isNaN(val), { message: "Page number must be at least 1" })
    .min(1, "Page number must be at least 1")
    .max(totalPages, "Page number must be less than or equal to " + totalPages)
});

                    <Input 
                      id="page"
                      type="number" 
                      placeholder="Go to page" 
                      className="w-24"
                      max={totalPages} 
                      min={1} 
                      {...field}
                      onBlur={() => {
                        if (isNaN(field.value)) {
                          alert("Page number must be at least 1");
                          field.onChange(currentPage);
                        } else if (field.value > totalPages) {
                          field.onChange(currentPage);
                        }
                      }}
                    /> 