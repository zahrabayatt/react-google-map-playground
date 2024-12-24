import React, { useEffect, useRef, useState } from "react";
import { GoogleMapsOverlay } from "@deck.gl/google-maps";
import { ScatterplotLayer, PolygonLayer } from "@deck.gl/layers";

const mapContainerStyle: React.CSSProperties = {
    width: "100%",
    height: "100vh",
    position: "relative",
};

// const locations = {
//     location1: { lat: 40.7128, lng: -74.0060 }, // New York City, New York
//     location2: { lat: 41.8781, lng: -87.6298 }, // Chicago, Illinois
// };

// const locations = {
//     location1: { lat: 28.6139, lng: 77.2090 }, // New Delhi, India
//     location2: { lat: 19.0760, lng: 72.8777 }, // Mumbai, India
// };

const locations = {
    location1: { lat: 35.6892, lng: 51.3890 }, // Tehran, Iran
    location2: { lat: 29.5918, lng: 52.5837 }, // Shiraz, Iran
};

// const calculateMaxZoom = (
//     mapWidthInPixels: number,
//     mapHeightInPixels: number,
//     lng1: number,
//     lng2: number,
//     lat1: number,
//     lat2: number
// ): number => {
//     const tileSize = 256; // Tile size at zoom level 0

//     // Convert latitudes to radians for calculations
//     const lat1Rad = (lat1 * Math.PI) / 180;
//     const lat2Rad = (lat2 * Math.PI) / 180;

//     // Calculate the longitude and latitude spans
//     const lngSpan = Math.abs(lng2 - lng1);
//     const latSpan = Math.abs(lat2Rad - lat1Rad);

//     // Longitude-based zoom calculation
//     const zoomForLng = Math.log2((mapWidthInPixels * 360) / (tileSize * lngSpan));

//     // Latitude-based zoom calculation (accounting for Mercator projection)
//     const zoomForLat = Math.log2(
//         (mapHeightInPixels * Math.PI) /
//         (tileSize * latSpan * Math.cos((lat1Rad + lat2Rad) / 2))
//     );

//     // Return the floored zoom level for both width and height, rounded down
//     return Math.min(Math.floor(zoomForLng), Math.floor(zoomForLat));
// };

export const calculateMaxZoom = (
    mapWidthInPixels: number,
    lng1: number,
    lng2: number
): number => {
    const boundaryWidthInDegrees = Math.abs(lng2 - lng1);
    const tileSize = 256; // Tile size at zoom level 0
    const scale = (mapWidthInPixels * 360) / (boundaryWidthInDegrees * tileSize);
    return Math.floor(Math.log2(scale)); // Floor to get maximum zoom
};

const ShowBoundaryDemo: React.FC = () => {
    const mapRef = useRef<HTMLDivElement | null>(null);
    const [map, setMap] = useState<google.maps.Map | null>(null);
    const [minZoomLevel, setMinZoomLevel] = useState<number | null>(null);

    useEffect(() => {
        const mapWidthInPixels = mapRef.current?.offsetWidth || 800; // Default width if not available
        // const mapHeigh                         tInPixels = mapRef.current?.offsetHeight || 400;
        const { location1, location2 } = locations;

        const zoom = calculateMaxZoom(mapWidthInPixels, location1.lng, location2.lng);

        setMinZoomLevel(zoom);
    }, []);

    useEffect(() => {
        if (map && mapRef.current) {
            // Define bounds
            const bounds = new google.maps.LatLngBounds();
            bounds.extend(locations.location1);
            bounds.extend(locations.location2);

            // Define the polygon boundary
            const boundaryCoordinates = [
                [locations.location1.lng, locations.location1.lat],
                [locations.location2.lng, locations.location1.lat],
                [locations.location2.lng, locations.location2.lat],
                [locations.location1.lng, locations.location2.lat],
                [locations.location1.lng, locations.location1.lat], // Close the polygon
            ];

            // Scatterplot layer for points
            const scatterplotLayer = new ScatterplotLayer({
                id: "scatterplot-layer",
                data: Object.values(locations),
                getPosition: (d) => [d.lng, d.lat],
                getFillColor: [255, 0, 0],
                getRadius: 10000, // Radius in meters
                radiusMinPixels: 5,
                radiusMaxPixels: 20,
            });

            // Polygon layer for the boundary
            const polygonLayer = new PolygonLayer({
                id: "polygon-layer",
                data: [
                    {
                        boundary: boundaryCoordinates,
                    },
                ],
                getPolygon: (d) => d.boundary,
                getFillColor: [186, 186, 247, 100],
                getLineColor: [0, 0, 255],
                lineWidthMinPixels: 2,
                filled: true,
                stroked: true,
            });

            // Overlay layers on the map
            const overlay = new GoogleMapsOverlay({
                layers: [scatterplotLayer, polygonLayer],
            });

            //map.fitBounds(bounds); // Adjust the map to fit the bounds
            map.setCenter(bounds.getCenter());
            map.setZoom(minZoomLevel || 16)
            overlay.setMap(map); // Attach the overlay to the map
        }
    }, [map]);

    useEffect(() => {
        if (mapRef.current && !map) {
            setMap(
                new google.maps.Map(mapRef.current, {
                    center: { lat: 36.0, lng: -120.0 },
                    zoom: minZoomLevel || 16,
                })
            );
        }
    }, [map, minZoomLevel]);

    return (
        <>
            <button onClick={() => console.log(map?.getZoom())}>
                log zoom level
            </button>
            <div style={mapContainerStyle}>
                <div
                    style={{
                        position: "absolute",
                        top: "60px",
                        left: "10px",
                        padding: "5px 10px",
                        backgroundColor: "rgba(69, 68, 68, 0.8)",
                        borderRadius: "4px",
                        zIndex: 1000,
                    }}
                >
                    {minZoomLevel !== null ? `Minimum Zoom Level: ${minZoomLevel}` : "Calculating..."}
                </div>
                <div ref={mapRef} style={{ width: "100%", height: "100%" }} />
            </div>
        </>
    );
};

export default ShowBoundaryDemo;