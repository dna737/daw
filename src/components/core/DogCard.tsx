import type { Dog } from "@/models";
import { Card, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Calendar, MapPin, PawPrint } from "lucide-react";

export default function DogCard(props: { dog: Dog; isLiked: boolean; handleLikeChange: (dogId: string) => void }) {
  const { dog, isLiked, handleLikeChange } = props;

  return (
    <Card className="w-full h-full">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>{dog.name}</CardTitle>
          <Button 
            variant="ghost"
            onClick={(e) => {
              e.stopPropagation();
              handleLikeChange(dog.id);
            }}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            {isLiked ? '❤️' : '🤍'}
          </Button>
        </div>
        <CardDescription className="flex flex-col justify-center gap-2">
          <img src={dog.img} alt={`Photo of ${dog.name}`} className="w-full h-48 object-cover rounded-md" />
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              <p>{dog.zip_code}</p>
            </div>

            <div className="flex items-center gap-2">
              <PawPrint className="w-4 h-4" />
              <p>{dog.breed}</p>
            </div>

            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <p>{`${dog.age} years old`}</p>
            </div>
          </div>
        </CardDescription>
      </CardHeader>
    </Card>
  );
}
