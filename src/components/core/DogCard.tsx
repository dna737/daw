import type { Dog } from "@/models";
import { Card, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Calendar, InfoIcon, MapPin, PawPrint } from "lucide-react";
import { useZipCodes } from "../hooks";
import { Tooltip, TooltipTrigger, TooltipContent } from "../ui/tooltip";
import type { DogLocation } from "@/models";

function LocationTooltip(props: { location: DogLocation | undefined }) {

  const { location } = props;

  if (!location) {
    return null;
  }

  return (
    <Tooltip>
      <TooltipTrigger>
        <InfoIcon className="w-4 h-4" />
      </TooltipTrigger>
      <TooltipContent>
        {
          Object.entries(location).map(([key, value]) => {
            const formattedKey = key.replace("_", " ");
            const capitalizedKey = formattedKey.charAt(0).toUpperCase() + formattedKey.slice(1);
            return (
              <p key={key} className="text-left">{capitalizedKey}: {value}</p>
            )
          })
        }
      </TooltipContent>
    </Tooltip>
  )
}

export default function DogCard(props: { dog: Dog; isLiked?: boolean; handleLikeChange?: (dogId: string) => void }) {
  const { dog, isLiked, handleLikeChange } = props;
  const { locations } = useZipCodes([dog.zip_code]);
  const location = locations?.[0];

  const displayDogAge = () => {
    switch (dog.age) {
      case 0:
        return "Less than a year old";
      case 1:
        return "1 year old";
      default:
        return `${dog.age} years old`;
    }
  }

  return (
    <Card className="w-full h-full p-4">
      <CardHeader className="p-0">
        <div className="flex justify-between items-center">
          <CardTitle>{dog.name}</CardTitle>
          {isLiked !== undefined && (
            <Button 
              variant="ghost"
              onClick={(e) => {
                e.stopPropagation();
                handleLikeChange?.(dog.id);
              }}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              {isLiked ? '❤️' : '🤍'}
            </Button>
          )}
        </div>
        <CardDescription className="flex flex-col justify-center gap-2">
          <div className="w-full h-48 rounded-md flex items-center justify-center">
            <img 
              src={dog.img} 
              alt={`Photo of ${dog.name}`} 
              className="max-w-full max-h-full object-contain rounded-md"
            />
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                <p className="text-left">{location?.city}, {location?.state}</p>
              </div>
              <LocationTooltip location={location} />
            </div>

            <div className="flex items-center gap-2">
              <PawPrint className="w-4 h-4" />
              <p className="text-left">{dog.breed}</p>
            </div>

            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <p className="text-left">{displayDogAge()}</p>
            </div>
          </div>
        </CardDescription>
      </CardHeader>
    </Card>
  );
}
