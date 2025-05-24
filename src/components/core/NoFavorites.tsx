import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { TriangleAlert } from "lucide-react";

export default function NoFavorites() {
  return (
    <div className="flex flex-col items-center justify-center gap-2 w-full h-full flex-1 p-4">
      <Alert className="flex flex-col items-center gap-2 w-fit">
        <AlertTitle className="flex items-center gap-2">
          <TriangleAlert className="h-4 w-4 stroke-red-600" />
          {"No favorite dogs yet!"}
        </AlertTitle>
        <AlertDescription>
          {"Click on the 🤍 icon on a dog's card to mark as a favorite. ❤"}
        </AlertDescription>
      </Alert>
    </div>
  );
}
