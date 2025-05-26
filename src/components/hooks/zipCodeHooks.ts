import { useEffect, useState } from "react";
import type { DogLocation } from "@/models";
import { getLocations } from "@/services/proxy";
import { MAX_PAGE_SIZE } from "../utils";

export const useZipCodes = (zipCodes: string[] | undefined) => {

  const [dogLocations, setDogLocations] = useState<Record<string, DogLocation> | undefined>(undefined);

  useEffect(() => {
    if (zipCodes && zipCodes.length > 0 && zipCodes.length <= MAX_PAGE_SIZE) {
    getLocations(zipCodes).then(
      (result: DogLocation[]) => {
        setDogLocations(result.reduce((acc, location) => {
          if (location && location.zip_code) {
            acc[location.zip_code] = location;
          }
          return acc;
        }, {} as Record<string, DogLocation>));
      }
    ).catch(error => {
        console.error(error);
      });
    }
  }, [JSON.stringify(zipCodes)]);

  return { dogLocations };
};
