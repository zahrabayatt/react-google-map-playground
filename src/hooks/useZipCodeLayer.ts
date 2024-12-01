import { useEffect, useMemo, useState } from "react";
import { PolygonLayer } from "@deck.gl/layers";
import { ZipCode } from "../types/ZipCode";

const useZipCodeLayer = () => {
  const [zipCodes, setZipCodes] = useState<ZipCode[]>([]);

  useEffect(() => {
    const fetchZipCodes = async () => {
      const response = await fetch(
        "https://raw.githubusercontent.com/visgl/deck.gl-data/master/website/sf-zipcodes.json"
      );
      const data: ZipCode[] = await response.json();
      setZipCodes(data);
    };
    fetchZipCodes();
  }, []);

  const layer = useMemo(
    () =>
      new PolygonLayer<ZipCode>({
        id: "ZipCodesLayer",
        data: zipCodes,
        getPolygon: (d: ZipCode) => d.contour,
        getElevation: (d: ZipCode) => d.population / d.area / 10,
        getFillColor: (d: ZipCode) => [d.population / d.area / 60, 140, 0],
        getLineColor: [255, 255, 255],
        getLineWidth: 20,
        lineWidthMinPixels: 1,
        pickable: true,
      }),
    [zipCodes]
  );

  return layer;
};

export default useZipCodeLayer;
