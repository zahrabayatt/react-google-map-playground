import { GoogleMapsOverlay } from '@deck.gl/google-maps';
import { ScatterplotLayer } from 'deck.gl';
import React, { useEffect, useRef, useState } from 'react'
import * as turf from "@turf/turf";

const MapWithTrufFlyTo = () => {
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


    const flyToLocation = (start: google.maps.LatLngLiteral, target: google.maps.LatLngLiteral) => {
        if (!map) return;

        // Create a line between the two points using Turf.js
        const startPoint = turf.point([start.lng, start.lat]);
        const endPoint = turf.point([target.lng, target.lat]);
        const line = turf.greatCircle(startPoint, endPoint);

        // Ensure the geometry is a LineString
        let coordinates: GeoJSON.Position[];
        if (line.geometry.type === "LineString") {
            coordinates = line.geometry.coordinates;
        } else if (line.geometry.type === "MultiLineString") {
            // Flatten MultiLineString to a single LineString (use the first segment)
            coordinates = line.geometry.coordinates[0];
        } else {
            throw new Error("Invalid geometry type");
        }

        const steps = 100; // Number of animation steps
        const stepTime = 20; // Time per step (ms)

        let currentStep = 0;

        const animate = () => {
            if (currentStep < steps) {
                // Use turf.along to get intermediate points along the route
                const point = turf.along(turf.lineString(coordinates), (currentStep / steps) * turf.length(turf.lineString(coordinates)));
                const [lng, lat] = point.geometry.coordinates;

                map.setCenter({ lat, lng });

                currentStep++;
                setTimeout(animate, stepTime);
            } else {
                // Ensure final position and zoom
                map.setCenter(target);
                map.setZoom(12);
            }
        };

        animate();
    };

    return (
        <div style={{ height: "100vh", width: "100%" }}>
            <div style={{ position: "absolute", top: 10, left: 10, zIndex: 1000 }}>
                <button onClick={() => flyToLocation(locations.location1, locations.location2)}>
                    Fly to Los Angeles
                </button>
                <button onClick={() => flyToLocation(locations.location2, locations.location1)}>
                    Fly to San Francisco
                </button>
            </div>
            <div ref={mapRef} style={{ height: "100%", width: "100%" }} />
        </div>
    );
}

export default MapWithTrufFlyTo