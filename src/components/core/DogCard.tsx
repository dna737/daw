import type { Dog } from "@/models";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";

export default function DogCard(props: { dog: Dog; isLiked: boolean; handleLikeChange: (dogId: string) => void }) {
  const { dog, isLiked, handleLikeChange } = props;

  /*
  id: string;
  img: string;
  name: string;
  age: number;
  zip_code: string;
  breed: string;
  */

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
        <CardDescription>
          <img src={dog.img} alt={`Photo of ${dog.name}`} className="w-full h-48 object-cover rounded-md" />
        </CardDescription>
      </CardHeader>
      <CardContent>
      <div className={`bg-[url(${dog.img})]`}/>
      </CardContent>
      <CardFooter>
        <p>{"Test"}</p>
      </CardFooter>
    </Card>
  );
}
