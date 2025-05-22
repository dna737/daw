import { useEffect, useState } from "react";
import type { DogLocation } from "@/models";
import { getLocations } from "@/services/proxy";

export const useZipCodes = (zipCodes: string[] | undefined) => {

  const [locations, setLocations] = useState<DogLocation[] | undefined>(undefined);

  useEffect(() => {
    if (zipCodes) {
    getLocations(zipCodes).then(
      (result: DogLocation[]) => {
        setLocations(result);
      }
    ).catch(error => {
        console.error(error);
      });
    }
  }, [JSON.stringify(zipCodes)]);

  return { locations };
};
