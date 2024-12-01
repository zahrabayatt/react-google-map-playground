import { useState, useEffect } from "react";
import { Loader } from "@googlemaps/js-api-loader";

const useGoogleMap = (
  apiKey: string,
  markerPosition: google.maps.LatLngLiteral
) => {
  const [map, setMap] = useState<google.maps.Map | null>(null);

  useEffect(() => {
    const initMap = async () => {
      try {
        const loader = new Loader({
          apiKey,
          version: "weekly",
          libraries: ["places", "marker"],
        });

        const googleMaps = await loader.importLibrary("maps");
        const mapInstance = new googleMaps.Map(
          document.getElementById("map") as HTMLElement,
          {
            center: { lat: -34.397, lng: 150.644 },
            zoom: 8,
          }
        );
        setMap(mapInstance);

        const { Marker } = await loader.importLibrary("marker");
        new Marker({
          position: markerPosition,
          map: mapInstance,
          title: "Uluru",
        });
      } catch (error) {
        console.error("Failed to initialize the map:", error);
      }
    };

    initMap();
  }, [apiKey, markerPosition]);

  return map;
};

export default useGoogleMap;
