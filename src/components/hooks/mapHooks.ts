import { useEffect, useState, useCallback } from "react";

type Marker = { lat: number; lon: number };

export function useMarkersInView(
  mapRef: React.RefObject<any>,
  markers: Marker[] | undefined
) {
  if(!markers) {
    return { allVisible: true, checkVisibility: () => {} };
  }
  const [allVisible, setAllVisible] = useState(true);

  const checkVisibility = useCallback(() => {
    const bounds = mapRef.current?.getBounds?.();
    if (!bounds) return;

    const [[south, west], [north, east]] = bounds;

    const visible = markers.every(({ lat, lon }) =>
      lat >= south && lat <= north && lon >= west && lon <= east
    );

    setAllVisible(visible);
  }, [mapRef, markers]);

  useEffect(() => {
    checkVisibility();
  }, [checkVisibility]);

  return { allVisible, checkVisibility };
}
