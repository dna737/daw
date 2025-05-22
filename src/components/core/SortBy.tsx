import { SortByOptions } from "@/models/interfaces";
import { Button } from "../ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuTrigger } from "../ui/dropdown-menu";

export default function SortBy(props: {currentValue: SortByOptions, setCurrentValue: (value: SortByOptions) => void}) {
  const { currentValue, setCurrentValue } = props;
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">Sort</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuRadioGroup value={currentValue} onValueChange={(value) => setCurrentValue(value as SortByOptions)}>
          <DropdownMenuRadioItem value={SortByOptions.BREED_ASC}>Breed Ascending (A-Z)</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value={SortByOptions.BREED_DESC}>Breed Descending (Z-A)</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value={SortByOptions.NAME_ASC}>Name Ascending (A-Z)</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value={SortByOptions.NAME_DESC}>Name Descending (Z-A)</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value={SortByOptions.AGE_ASC}>Age Ascending (Youngest)</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value={SortByOptions.AGE_DESC}>Age Descending (Oldest)</DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
