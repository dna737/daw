import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "../ui/form";
import { MAX_ZIP_BATCH_SIZE } from "../utils";

const batchSizeSchema = z.object({
  batchSize: z.coerce.number().min(1, "Must be at least 1").max(MAX_ZIP_BATCH_SIZE, `Cannot exceed ${MAX_ZIP_BATCH_SIZE}`)
});

type BatchSizeFormValues = z.infer<typeof batchSizeSchema>;

interface ZipCodeSpecifierProps {
  onNextBatch: () => void;
  onLoadAll: () => void;
  onBatchSizeChange: (batchSize: number) => void;
  currentBatchSize: number;
  isAllLoaded: boolean;
}

export default function ZipCodeSpecifier({
  onNextBatch,
  onLoadAll,
  onBatchSizeChange,
  currentBatchSize,
  isAllLoaded
}: ZipCodeSpecifierProps) {
  const form = useForm<BatchSizeFormValues>({
    resolver: zodResolver(batchSizeSchema),
    defaultValues: { batchSize: currentBatchSize },
  });

  const onSubmit = (data: BatchSizeFormValues) => {
    onBatchSizeChange(data.batchSize);
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-2">
        <Button type="button" onClick={onNextBatch} disabled={isAllLoaded}>
          Load next {currentBatchSize} zip codes
        </Button>
        <Button type="button" onClick={onLoadAll} disabled={isAllLoaded}>
          Load all zip codes
        </Button>
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex items-end gap-2">
          <FormField
            control={form.control}
            name="batchSize"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Set zip code batch size</FormLabel>
                <FormControl>
                  <Input type="number" min={1} max={MAX_ZIP_BATCH_SIZE} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit">Set</Button>
        </form>
      </Form>
    </div>
  );
} 