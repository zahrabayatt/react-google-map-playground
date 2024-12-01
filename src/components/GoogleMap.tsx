import { useEffect, useMemo, useRef, useState } from "react";
import { GoogleMapsOverlay } from "@deck.gl/google-maps";
import { ScatterplotLayer } from "@deck.gl/layers";

interface Props {
  center: google.maps.LatLngLiteral;
  zoom: number;
  panToMarker: () => void;
}

interface BartStation {
  name: string;
  code: string;
  address: string;
  entries: string; // Entries are in string format, we need to parse them to numbers
  exits: string; // Exits are in string format, we need to parse them to numbers
  coordinates: [number, number]; // [longitude, latitude]
}

const GoogleMap = ({ center, zoom, panToMarker }: Props) => {
  const ref = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [marker, setMarker] = useState<google.maps.Marker | null>(null);

  const [bartStations, setBartStations] = useState<BartStation[]>([]);

  useEffect(() => {
    const fetchBartStations = async () => {
      const response = await fetch(
        "https://raw.githubusercontent.com/visgl/deck.gl-data/master/website/bart-stations.json"
      );
      const data: BartStation[] = await response.json();
      setBartStations(data);
    };
    fetchBartStations();
  }, []);

  const layer = useMemo(
    () =>
      new ScatterplotLayer<BartStation>({
        id: "ScatterplotLayer",
        data: bartStations,
        stroked: true,
        getPosition: (d) => d.coordinates,
        getRadius: (d) => Math.sqrt(parseInt(d.exits)),
        getFillColor: [255, 140, 0],
        getLineColor: [0, 0, 0],
        getLineWidth: 10,
        radiusScale: 6,
        pickable: true,
      }),
    [bartStations] // Recreate layer when bartStations changes
  );

  useEffect(() => {
    if (ref.current) {
      const mapInstance = new window.google.maps.Map(ref.current, {
        center,
        zoom,
      });
      setMap(mapInstance);

      const markerInstance = new window.google.maps.Marker({
        position: center,
        map: mapInstance,
        title: "Uluru",
      });
      setMarker(markerInstance);
    }
  }, [center, zoom]);

  useEffect(() => {
    if (map && marker) {
      map.panTo(marker.getPosition() as google.maps.LatLng);
      map.setZoom(8);
    }
  }, [center, map, marker]);

  useEffect(() => {
    if (map && bartStations.length > 0) {
      const overlay = new GoogleMapsOverlay({
        layers: [layer],
      });
      overlay.setMap(map);
    }
  }, [map, bartStations, layer]);

  return (
    <div style={{ position: "relative" }}>
      <div ref={ref} id="map" style={{ width: "100%", height: "100vh" }}></div>
      <button
        onClick={panToMarker}
        style={{
          position: "absolute",
          bottom: "40px",
          left: "10px",
          zIndex: 10,
        }}
      >
        Pan to Uluru
      </button>
    </div>
  );
};
export default GoogleMap;

// https://deck.gl/docs/get-started/getting-started
// https://deck.gl/docs/api-reference/layers/scatterplot-layer#
// https://deck.gl/docs/api-reference/google-maps/overview
