import { Wrapper } from "@googlemaps/react-wrapper";
import { useEffect, useState } from "react";
import "./App.css";
import GoogleMap from "./components/GoogleMap";

// graph representation
interface Node {
  point: google.maps.LatLng;
  neighbors: Map<string, { point: google.maps.LatLng; distance: number }>;
}

const App = () => {
  const [map, setMap] = useState<google.maps.Map | null>(null);

  useEffect(() => {
    if (!map) return;

    const path1Coordinates = [
      { lat: -34.38, lng: 150.62 },
      { lat: -34.37, lng: 150.64 },
      { lat: -34.36, lng: 150.65 },
      { lat: -34.36, lng: 150.66 },
      { lat: -34.36, lng: 150.67 },
      { lat: -34.37, lng: 150.69 },
      { lat: -34.38, lng: 150.7 },
      { lat: -34.39, lng: 150.69 },
      { lat: -34.39, lng: 150.67 },
      { lat: -34.38, lng: 150.65 },
      { lat: -34.38, lng: 150.62 },
    ];

    const path2Coordinates = [
      { lat: -34.34, lng: 150.64 },
      { lat: -34.35, lng: 150.65 },
      { lat: -34.36, lng: 150.65 },
      { lat: -34.37, lng: 150.66 },
      { lat: -34.36, lng: 150.66 },
      { lat: -34.35, lng: 150.66 },
      { lat: -34.34, lng: 150.64 },
    ];

    const path3Coordinates = [
      { lat: -34.35, lng: 150.66 },
      { lat: -34.36, lng: 150.67 },
      { lat: -34.37, lng: 150.67 },
      { lat: -34.37, lng: 150.68 },
      { lat: -34.38, lng: 150.69 },
      { lat: -34.37, lng: 150.69 },
    ];

    const polyline1 = new google.maps.Polyline({
      path: path1Coordinates,
      geodesic: true,
      strokeColor: "#FF0000",
      strokeOpacity: 1.0,
      strokeWeight: 3,
      map: map,
    });

    const hitArea1 = new google.maps.Polyline({
      path: path1Coordinates,
      geodesic: true,
      strokeColor: "#FF0000",
      strokeOpacity: 0.0,
      strokeWeight: 20,
      map: map,
      zIndex: 1,
    });

    const polyline2 = new google.maps.Polyline({
      path: path2Coordinates,
      geodesic: true,
      strokeColor: "#00FF00",
      strokeOpacity: 1.0,
      strokeWeight: 3,
      map: map,
    });

    const hitArea2 = new google.maps.Polyline({
      path: path2Coordinates,
      geodesic: true,
      strokeColor: "#00FF00",
      strokeOpacity: 0.0,
      strokeWeight: 20,
      map: map,
      zIndex: 1,
    });

    const polyline3 = new google.maps.Polyline({
      path: path3Coordinates,
      geodesic: true,
      strokeColor: "#0000FF",
      strokeOpacity: 1.0,
      strokeWeight: 3,
      map: map,
    });

    const hitArea3 = new google.maps.Polyline({
      path: path3Coordinates,
      geodesic: true,
      strokeColor: "#0000FF",
      strokeOpacity: 0.0,
      strokeWeight: 20,
      map: map,
      zIndex: 1,
    });

    // Create hover marker (initially hidden) with default pin icon
    const hoverMarker = new google.maps.Marker({
      map: map,
      visible: false,
      clickable: false,
    });

    // Store all markers and connection lines
    const markers: google.maps.Marker[] = [];
    const connectionLines: (google.maps.Polyline | google.maps.Marker)[] = [];

    // Function to find the shortest path between two points using existing polyline segments
    const findShortestPath = (
      start: google.maps.LatLng,
      end: google.maps.LatLng
    ) => {
      const graph = new Map<string, Node>();

      // Helper function to get node key
      const getNodeKey = (point: google.maps.LatLng) =>
        `${point.lat()},${point.lng()}`;

      // Helper function to add edge to graph
      const addEdge = (
        point1: google.maps.LatLng,
        point2: google.maps.LatLng
      ) => {
        const key1 = getNodeKey(point1);
        const key2 = getNodeKey(point2);
        const distance = google.maps.geometry.spherical.computeDistanceBetween(
          point1,
          point2
        );

        if (!graph.has(key1)) {
          graph.set(key1, { point: point1, neighbors: new Map() });
        }
        if (!graph.has(key2)) {
          graph.set(key2, { point: point2, neighbors: new Map() });
        }

        graph.get(key1)!.neighbors.set(key2, { point: point2, distance });
        graph.get(key2)!.neighbors.set(key1, { point: point1, distance });
      };

      // Build graph from all polylines
      const allPaths = [polyline1, polyline2, polyline3];
      allPaths.forEach((polyline) => {
        const path = polyline.getPath();
        for (let i = 0; i < path.getLength() - 1; i++) {
          addEdge(path.getAt(i), path.getAt(i + 1));
        }
      });

      // Find closest points in graph to start and end
      let startNode: string | null = null;
      let endNode: string | null = null;
      let minStartDist = Infinity;
      let minEndDist = Infinity;

      graph.forEach((node, key) => {
        const startDist = google.maps.geometry.spherical.computeDistanceBetween(
          start,
          node.point
        );
        const endDist = google.maps.geometry.spherical.computeDistanceBetween(
          end,
          node.point
        );

        if (startDist < minStartDist) {
          minStartDist = startDist;
          startNode = key;
        }
        if (endDist < minEndDist) {
          minEndDist = endDist;
          endNode = key;
        }
      });

      if (!startNode || !endNode) return [];

      // Dijkstra's algorithm
      const distances = new Map<string, number>();
      const previous = new Map<string, string>();
      const unvisited = new Set<string>();

      // Initialize distances
      graph.forEach((_, key) => {
        distances.set(key, Infinity);
        unvisited.add(key);
      });
      distances.set(startNode, 0);

      while (unvisited.size > 0) {
        // Find closest unvisited node
        const current = Array.from(unvisited).reduce((a, b) =>
          (distances.get(a) ?? Infinity) < (distances.get(b) ?? Infinity)
            ? a
            : b
        );

        if (!current || current === endNode) break;
        unvisited.delete(current);

        // Update distances to neighbors
        const currentNode = graph.get(current)!;
        currentNode.neighbors.forEach((neighbor, neighborKey) => {
          if (unvisited.has(neighborKey)) {
            const newDistance = distances.get(current)! + neighbor.distance;
            if (newDistance < distances.get(neighborKey)!) {
              distances.set(neighborKey, newDistance);
              previous.set(neighborKey, current);
            }
          }
        });
      }

      // Reconstruct path
      const path: google.maps.LatLng[] = [];
      let current: string | undefined = endNode;
      while (current) {
        path.unshift(graph.get(current)!.point);
        current = previous.get(current);
        if (current && current === startNode) {
          path.unshift(graph.get(current)!.point);
          break;
        }
      }

      return path;
    };

    // Function to update all connections
    const updateAllConnections = () => {
      // Clear existing connection lines
      connectionLines.forEach((line) => {
        if (line instanceof google.maps.Polyline) {
          line.setMap(null);
        } else if (line instanceof google.maps.Marker) {
          line.setMap(null);
        }
      });
      connectionLines.length = 0;

      // Create connections between all pairs of markers
      for (let i = 0; i < markers.length; i++) {
        for (let j = i + 1; j < markers.length; j++) {
          const path = findShortestPath(
            markers[i].getPosition()!,
            markers[j].getPosition()!
          );

          if (path.length > 0) {
            const connectionLine = new google.maps.Polyline({
              path: path,
              geodesic: true,
              strokeColor: "#FFA500", // Orange color for connection
              strokeOpacity: 1.0,
              strokeWeight: 3,
              map: map,
              zIndex: 2,
            });
            connectionLines.push(connectionLine);

            // Create distance labels for each segment
            for (let k = 0; k < path.length - 1; k++) {
              const segmentStart = path[k];
              const segmentEnd = path[k + 1];

              // Calculate distance for this segment
              const segmentDistance =
                google.maps.geometry.spherical.computeDistanceBetween(
                  segmentStart,
                  segmentEnd
                );

              // Calculate midpoint for label placement
              const midPoint = new google.maps.LatLng(
                (segmentStart.lat() + segmentEnd.lat()) / 2,
                (segmentStart.lng() + segmentEnd.lng()) / 2
              );

              const distanceLabel = new google.maps.Marker({
                position: midPoint,
                map: map,
                icon: {
                  path: google.maps.SymbolPath.CIRCLE,
                  scale: 0, // Makes the marker invisible
                },
                label: {
                  text: `${Math.round(segmentDistance)} m`,
                  color: "#000000",
                  fontSize: "12px",
                  fontWeight: "bold",
                },
                clickable: false,
                zIndex: 3,
              });

              connectionLines.push(distanceLabel as google.maps.Marker);
            }
          }
        }
      }
    };

    // Add hover listeners to each polyline pair
    [
      {
        line: polyline1,
        hitArea: hitArea1,
        color: "#FF0000",
        iconUrl: "http://maps.google.com/mapfiles/ms/icons/red-dot.png",
      },
      {
        line: polyline2,
        hitArea: hitArea2,
        color: "#00FF00",
        iconUrl: "http://maps.google.com/mapfiles/ms/icons/green-dot.png",
      },
      {
        line: polyline3,
        hitArea: hitArea3,
        color: "#0000FF",
        iconUrl: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png",
      },
    ].forEach(({ line, hitArea, iconUrl }) => {
      google.maps.event.addListener(hitArea, "click", () => {
        const position = hoverMarker.getPosition();
        const insertIndex = hoverMarker.get("insertIndex");

        if (!position || insertIndex === undefined) return;

        // Insert the new point into both paths
        const path = line.getPath();
        const hitAreaPath = hitArea.getPath();
        path.insertAt(insertIndex, position);
        hitAreaPath.insertAt(insertIndex, position);

        // Create a new marker at the clicked position
        const newMarker = new google.maps.Marker({
          position: position,
          map: map,
          icon: {
            url: iconUrl,
            scaledSize: new google.maps.Size(40, 40),
          },
        });

        // Add to markers array and update all connections
        markers.push(newMarker);
        updateAllConnections();
      });

      // Mouseover listener
      google.maps.event.addListener(hitArea, "mouseover", () => {
        line.setOptions({ strokeOpacity: 0.8 });
        hoverMarker.setVisible(true);
      });

      // Mouseout listener
      google.maps.event.addListener(hitArea, "mouseout", () => {
        line.setOptions({ strokeOpacity: 1.0 });
        hoverMarker.setVisible(false);
      });

      // Mousemove listener
      google.maps.event.addListener(
        hitArea,
        "mousemove",
        (e: google.maps.MapMouseEvent) => {
          if (!e.latLng) return;

          const path = line.getPath();
          let minDistance = Infinity;
          let nearestPoint = e.latLng;
          let insertIndex = 0;

          for (let i = 0; i < path.getLength() - 1; i++) {
            const start = path.getAt(i);
            const end = path.getAt(i + 1);

            const projection = map.getProjection();
            if (!projection) return;

            const startPoint = projection.fromLatLngToPoint(start);
            const endPoint = projection.fromLatLngToPoint(end);
            const mousePoint = projection.fromLatLngToPoint(e.latLng);

            if (!startPoint || !endPoint || !mousePoint) return;

            const dx = endPoint.x - startPoint.x;
            const dy = endPoint.y - startPoint.y;
            const t =
              ((mousePoint.x - startPoint.x) * dx +
                (mousePoint.y - startPoint.y) * dy) /
              (dx * dx + dy * dy);

            if (t < 0) continue;
            if (t > 1) continue;

            const pointX = startPoint.x + t * dx;
            const pointY = startPoint.y + t * dy;
            const point = projection.fromPointToLatLng(
              new google.maps.Point(pointX, pointY)
            );

            if (!point) continue;

            const distance =
              google.maps.geometry.spherical.computeDistanceBetween(
                e.latLng,
                point
              );

            if (distance < minDistance) {
              minDistance = distance;
              nearestPoint = point;
              insertIndex = i + 1;
            }
          }

          hoverMarker.setPosition(nearestPoint);
          hoverMarker.set("insertIndex", insertIndex);
        }
      );
    });

    // Create small circles for each point in each path

    const circles1 = path1Coordinates.map(
      (coord) =>
        new google.maps.Marker({
          position: coord,
          map: map,
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            fillColor: "#FFFFFF",
            fillOpacity: 1,
            strokeColor: "#FF0000",
            strokeWeight: 2,
            scale: 4,
          },
        })
    );

    const circles2 = path2Coordinates.map(
      (coord) =>
        new google.maps.Marker({
          position: coord,
          map: map,
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            fillColor: "#FFFFFF",
            fillOpacity: 1,
            strokeColor: "#00FF00",
            strokeWeight: 2,
            scale: 4,
          },
        })
    );

    const circles3 = path3Coordinates.map(
      (coord) =>
        new google.maps.Marker({
          position: coord,
          map: map,
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            fillColor: "#FFFFFF",
            fillOpacity: 1,
            strokeColor: "#0000FF",
            strokeWeight: 2,
            scale: 4,
          },
        })
    );

    return () => {
      polyline1.setMap(null);
      polyline2.setMap(null);
      polyline3.setMap(null);
      hitArea1.setMap(null);
      hitArea2.setMap(null);
      hitArea3.setMap(null);
      hoverMarker.setMap(null);
      markers.forEach((marker) => marker.setMap(null));
      connectionLines.forEach((line) => {
        if (line instanceof google.maps.Polyline) {
          line.setMap(null);
        } else if (line instanceof google.maps.Marker) {
          line.setMap(null);
        }
      });
      circles1.forEach((circle) => circle.setMap(null));
      circles2.forEach((circle) => circle.setMap(null));
      circles3.forEach((circle) => circle.setMap(null));
    };
  }, [map]);

  return (
    <Wrapper
      apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}
      libraries={["geometry"]}
    >
      <div className="map-container">
        <GoogleMap
          zoom={13}
          center={{ lat: -34.397, lng: 150.644 }}
          map={map}
          setMap={setMap}
        />
      </div>
    </Wrapper>
  );
};

export default App;
