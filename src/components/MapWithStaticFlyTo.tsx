import { GoogleMapsOverlay } from "@deck.gl/google-maps";
import { ScatterplotLayer } from "deck.gl";
import { useRef, useState, useEffect } from "react";

const MapWithStaticFlyTo: React.FC = () => {
    const mapRef = useRef<HTMLDivElement>(null);
    const [map, setMap] = useState<google.maps.Map | null>(null);

    const locations = {
        location1: { lat: 37.7749, lng: -122.4194 }, // San Francisco
        location2: { lat: 34.0522, lng: -118.2437 }, // Los Angeles
    };

    useEffect(() => {
        if (mapRef.current && !map) {
            const mapInstance = new google.maps.Map(mapRef.current, {
                center: locations.location1,
                zoom: 10,
            });
            setMap(mapInstance);
        }
    }, [map]);

    useEffect(() => {
        if (map) {
            const overlay = new GoogleMapsOverlay({
                layers: [
                    new ScatterplotLayer({
                        id: "scatterplot-layer",
                        data: [
                            { position: [-122.4194, 37.7749], size: 100, color: [255, 0, 0] }, // Red dot
                            { position: [-118.2437, 34.0522], size: 200, color: [0, 255, 0] }, // Green dot
                        ],
                        getPosition: (d) => d.position,
                        getRadius: (d) => d.size,
                        getColor: (d) => d.color,
                        radiusMinPixels: 5,
                    }),
                ],
            });

            overlay.setMap(map);

            return () => overlay.setMap(null);
        }
    }, [map]);

    const flyToLocation = (start: google.maps.LatLngLiteral, target: google.maps.LatLngLiteral, minZoom: number) => {
        if (!map) return;

        const steps = 50; // Number of animation steps per phase
        const duration = 2000; // Total animation time per phase
        const stepTime = duration / steps; // Time per step

        const currentZoom = map.getZoom() || 10;
        const targetZoom = 12; // Final zoom level at the target
        const zoomStepOut = (minZoom - currentZoom) / steps;
        const zoomStepIn = (targetZoom - minZoom) / steps;

        const deltaLatOut = (target.lat - start.lat) / (2 * steps); // Half for zoom-out
        const deltaLngOut = (target.lng - start.lng) / (2 * steps);
        const deltaLatIn = (target.lat - start.lat) / (2 * steps); // Half for zoom-in
        const deltaLngIn = (target.lng - start.lng) / (2 * steps);

        let currentStep = 0;

        const animate = () => {
            if (currentStep < steps) {
                // Zoom Out Phase
                const newLat = start.lat + deltaLatOut * currentStep;
                const newLng = start.lng + deltaLngOut * currentStep;
                const newZoom = currentZoom + zoomStepOut * currentStep;

                map.setCenter({ lat: newLat, lng: newLng });
                map.setZoom(newZoom);

                currentStep++;
                setTimeout(animate, stepTime);
            } else if (currentStep < 2 * steps) {
                // Zoom In Phase
                const newLat = start.lat + deltaLatIn * (currentStep - steps);
                const newLng = start.lng + deltaLngIn * (currentStep - steps);
                const newZoom = minZoom + zoomStepIn * (currentStep - steps);

                map.setCenter({ lat: newLat, lng: newLng });
                map.setZoom(newZoom);

                currentStep++;
                setTimeout(animate, stepTime);
            } else {
                // Final state
                map.setCenter(target);
                map.setZoom(targetZoom);
            }
        };

        if (currentZoom > minZoom) {
            // Start with zoom-out phase
            animate();
        } else {
            // Skip zoom-out and directly start with zoom-in phase
            currentStep = steps;
            animate();
        }
    };


    return (
        <div style={{ height: "100vh", width: "100%" }}>
            <div style={{ position: "absolute", top: 10, left: 10, zIndex: 1000 }}>
                <button onClick={() => flyToLocation(locations.location1, locations.location2, 8)}>
                    Fly to Los Angeles
                </button>
                <button onClick={() => flyToLocation(locations.location2, locations.location1, 8)}>
                    Fly to San Francisco
                </button>
            </div>
            <div ref={mapRef} style={{ height: "100%", width: "100%" }} />
        </div>
    );
}

export default MapWithStaticFlyTo;