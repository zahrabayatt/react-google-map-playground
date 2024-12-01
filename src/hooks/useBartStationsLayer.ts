import { useEffect, useMemo, useState } from "react";
import { ScatterplotLayer } from "@deck.gl/layers";
import BartStation from "../types/BartStation";

const useBartStationsLayer = () => {
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
    [bartStations]
  );

  return layer;
};

export default useBartStationsLayer;
